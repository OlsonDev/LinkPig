import * as vscode from 'vscode';
import { Command } from '../Command';
import { ExecutionContext } from '../ExecutionContext';
import { ValidationResult } from '../ValidationResult';
import { Selection, SelectParameters } from '../../core';
import { SelectionValidationError } from '../SelectionValidationError';

export class SelectCommand extends Command<SelectParameters> {
  static readonly commandKey = 'select';

  static parse(value: string, position: number): SelectCommand {
    if (!value) {
      throw new Error('Missing value for select command');
    }

    const addToExisting = value.startsWith('+');
    const rawSelections = addToExisting ? value.slice(1) : value;

    if (!rawSelections) {
      throw new Error('Missing selection value after + prefix');
    }

    const selectionSegments = rawSelections.split(';');
    const selections = selectionSegments.map(segment => this.parseSelectionSegment(segment));

    const selectParams = new SelectParameters({ selections, addToExisting });
    return new SelectCommand(selectParams, SelectCommand.commandKey, position);
  }

  private static parseSelectionSegment(segment: string): Selection {
    if (!segment) {
      throw new Error('Empty selection segment');
    }

    const dashIndex = segment.indexOf('-');
    if (dashIndex === -1) {
      return this.parseCursorSegment(segment);
    }

    return this.parseRangeSegment(segment, dashIndex);
  }

  private static parseCursorSegment(segment: string): Selection {
    const { line, character } = this.parsePosition(segment);
    return Selection.fromPosition(line, character);
  }

  private static parseRangeSegment(segment: string, dashIndex: number): Selection {
    const anchorPart = segment.slice(0, dashIndex);
    const activePart = segment.slice(dashIndex + 1);

    const anchorHasColon = anchorPart.includes(':');
    const activeHasColon = activePart.includes(':');

    if (activeHasColon) {
      return this.parseCrossLineRange(anchorPart, activePart);
    }

    if (anchorHasColon) {
      return this.parseSameLineRange(anchorPart, activePart);
    }

    return this.parseLineRange(anchorPart, activePart);
  }

  private static parseSameLineRange(anchorPart: string, activePart: string): Selection {
    const { line, character: anchorCharacter } = this.parsePosition(anchorPart);
    const activeCharacter = this.parseNumber(activePart, 'character');

    return Selection.fromCharacterRange(line, anchorCharacter, activeCharacter);
  }

  private static parseLineRange(anchorPart: string, activePart: string): Selection {
    const anchorLine = this.parseNumber(anchorPart, 'line');
    const activeLine = this.parseNumber(activePart, 'line');

    return Selection.fromLineRange(anchorLine, activeLine);
  }

  private static parseCrossLineRange(anchorPart: string, activePart: string): Selection {
    const anchor = this.parsePosition(anchorPart);
    const active = this.parsePosition(activePart);

    return new Selection({
      anchorLine: anchor.line,
      anchorCharacter: anchor.character,
      activeLine: active.line,
      activeCharacter: active.character
    });
  }

  private static parsePosition(positionStr: string): { line: number; character: number } {
    const parts = positionStr.split(':');
    if (parts.length > 2) {
      throw new Error(`Invalid position format: ${positionStr} (too many colons)`);
    }
    const line = this.parseNumber(parts[0], 'line');
    const character = parts[1] !== undefined ? this.parseNumber(parts[1], 'character') : 1;

    return { line, character };
  }

  private static parseNumber(value: string, type: 'line' | 'character'): number {
    if (!/^\d+$/.test(value)) {
      throw new Error(`Invalid ${type} number: ${value}`);
    }
    return parseInt(value, 10);
  }

  async validate(context: ExecutionContext): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];

    if (!context.currentEditor) {
      errors.push(new SelectionValidationError(
        this.paramKey,
        this.position,
        'No file is open to select in',
        0
      ));
      return { valid: false, errors };
    }

    const document = context.currentEditor.document;

    this.params.selections.forEach((selection, selectionIndex) => {
      this.validateSelection(selection, selectionIndex, document, errors);
    });

    if (errors.length === 0) {
      this.simulateSelections(context);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private validateSelection(
    selection: Selection,
    selectionIndex: number,
    document: vscode.TextDocument,
    errors: ValidationResult['errors']
  ): void {
    this.validateLine(selection.anchorLine, 'anchor', selectionIndex, document, errors);
    this.validateLine(selection.activeLine, 'active', selectionIndex, document, errors);

    if (selection.anchorLine >= 1 && selection.anchorLine <= document.lineCount) {
      this.validateCharacter(
        selection.anchorCharacter,
        selection.anchorLine,
        'anchor',
        selectionIndex,
        document,
        errors
      );
    }

    if (selection.activeLine >= 1 && selection.activeLine <= document.lineCount) {
      this.validateCharacter(
        selection.activeCharacter,
        selection.activeLine,
        'active',
        selectionIndex,
        document,
        errors
      );
    }
  }

  private validateLine(
    line: number,
    positionType: 'anchor' | 'active',
    selectionIndex: number,
    document: vscode.TextDocument,
    errors: ValidationResult['errors']
  ): void {
    if (line < 1 || line > document.lineCount) {
      errors.push(new SelectionValidationError(
        this.paramKey,
        this.position,
        `Selection ${selectionIndex + 1} ${positionType} line ${line} exceeds document length (${document.lineCount} lines)`,
        selectionIndex
      ));
    }
  }

  private validateCharacter(
    character: number,
    line: number,
    positionType: 'anchor' | 'active',
    selectionIndex: number,
    document: vscode.TextDocument,
    errors: ValidationResult['errors']
  ): void {
    const lineText = document.lineAt(line - 1);
    const maxCharacter = lineText.text.length + 1;

    if (character < 1 || character > maxCharacter) {
      errors.push(new SelectionValidationError(
        this.paramKey,
        this.position,
        `Selection ${selectionIndex + 1} ${positionType} character ${character} exceeds line ${line} length (${lineText.text.length} characters)`,
        selectionIndex
      ));
    }
  }

  private simulateSelections(context: ExecutionContext): void {
    const vscodeSelections = this.createVscodeSelections();
    const lastSelection = vscodeSelections[vscodeSelections.length - 1];

    context.currentEditor = {
      ...context.currentEditor,
      selection: lastSelection,
      selections: vscodeSelections
    } as vscode.TextEditor;
  }

  private createVscodeSelections(): vscode.Selection[] {
    return this.params.selections.map(selection => {
      const anchor = new vscode.Position(
        selection.anchorLine - 1,
        selection.anchorCharacter - 1
      );
      const active = new vscode.Position(
        selection.activeLine - 1,
        selection.activeCharacter - 1
      );
      return new vscode.Selection(anchor, active);
    });
  }

  async execute(context: ExecutionContext): Promise<void> {
    if (!context.currentEditor) {
      throw new Error('No editor available for select command');
    }

    const newSelections = this.createVscodeSelections();
    const finalSelections = this.params.addToExisting
      ? [...context.currentEditor.selections, ...newSelections]
      : newSelections;

    context.currentEditor.selections = finalSelections;

    const lastSelection = finalSelections[finalSelections.length - 1];
    const range = new vscode.Range(lastSelection.active, lastSelection.active);
    context.currentEditor.revealRange(range, vscode.TextEditorRevealType.InCenter);

    context.addCommand('select');
  }
}
