import * as vscode from 'vscode';
import { Command } from '../Command';
import { ExecutionContext } from '../ExecutionContext';
import { ValidationResult } from '../ValidationResult';
import { SelectParameters } from '../../core';

export class SelectCommand extends Command<SelectParameters> {
  static readonly commandKey = 'select';

  static parse(value: string, position: number): SelectCommand {
    if (!value) {
      throw new Error('Missing value for select command');
    }

    const parts = value.split(':');
    const line = parseInt(parts[0], 10);
    let column: number | undefined = undefined;
    
    if (parts[1] !== undefined) {
      column = parseInt(parts[1], 10);
    }

    if (isNaN(line)) {
      throw new Error(`Invalid line number: ${parts[0]}`);
    }
    if (column !== undefined && isNaN(column)) {
      const colStr = parts[1];
      throw new Error(`Invalid column number: ${colStr !== undefined ? colStr : ''}`);
    }

    const selectParams = new SelectParameters({ line, column });
    return new SelectCommand(selectParams, SelectCommand.commandKey, position);
  }

  async validate(context: ExecutionContext): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];

    if (!context.currentEditor) {
      errors.push({
        param: this.paramKey,
        position: this.position,
        message: 'No file is open to select in'
      });
      return { valid: false, errors };
    }

    const document = context.currentEditor.document;
    const lineIndex = this.params.line - 1;

    if (lineIndex < 0 || lineIndex >= document.lineCount) {
      errors.push({
        param: this.paramKey,
        position: this.position,
        message: `Line ${this.params.line} is out of range (document has ${document.lineCount} lines)`
      });
    } else if (this.params.column !== undefined) {
      const line = document.lineAt(lineIndex);
      const columnIndex = this.params.column - 1;
      
      if (columnIndex < 0 || columnIndex > line.text.length) {
        errors.push({
          param: this.paramKey,
          position: this.position,
          message: `Column ${this.params.column} is out of range (line ${this.params.line} has ${line.text.length} characters)`
        });
      }
    }

    // Simulate the selection change in context
    if (errors.length === 0) {
      const line = this.params.line - 1;
      const column = (this.params.column ?? 1) - 1;
      const position = new vscode.Position(line, column);
      // Update the simulated editor state
      context.currentEditor = {
        ...context.currentEditor,
        selection: new vscode.Selection(position, position)
      } as vscode.TextEditor;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async execute(context: ExecutionContext): Promise<void> {
    if (!context.currentEditor) {
      throw new Error('No editor available for select command');
    }

    const line = this.params.line - 1;
    const column = (this.params.column ?? 1) - 1;
    const position = new vscode.Position(Math.max(0, line), Math.max(0, column));
    const range = new vscode.Range(position, position);
    
    context.currentEditor.selection = new vscode.Selection(position, position);
    context.currentEditor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    context.addCommand('select');
  }
}
