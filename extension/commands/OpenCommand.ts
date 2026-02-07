import * as vscode from 'vscode';
import * as path from 'path';
import { Command } from '../Command';
import { ExecutionContext } from '../ExecutionContext';
import { ValidationResult } from '../ValidationResult';
import { OpenParameters } from '../../core';

export class OpenCommand extends Command<OpenParameters> {
  static readonly commandKey = 'open';

  static parse(value: string, position: number): OpenCommand {
    if (!value) {
      throw new Error('Missing file path for open command');
    }
    const openParams = new OpenParameters({ relativePath: value });
    return new OpenCommand(openParams, OpenCommand.commandKey, position);
  }

  async validate(context: ExecutionContext): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];

    const filePath = path.isAbsolute(this.params.relativePath)
      ? this.params.relativePath
      : path.join(context.workspaceFolder.uri.fsPath, this.params.relativePath);

    try {
      const fileUri = vscode.Uri.file(filePath);
      const fileStat = await vscode.workspace.fs.stat(fileUri);
      
      if (fileStat.type !== vscode.FileType.File) {
        errors.push({
          param: this.paramKey,
          position: this.position,
          message: `Path is not a file: ${this.params.relativePath}`
        });
      } else {
        // Simulate opening the file by updating context
        const document = await vscode.workspace.openTextDocument(fileUri);
        // Don't actually show it during validation, just simulate the editor state
        context.currentEditor = {
          document,
          selection: new vscode.Selection(0, 0, 0, 0)
        } as vscode.TextEditor;
      }
    } catch (error) {
      errors.push({
        param: this.paramKey,
        position: this.position,
        message: `File not found: ${this.params.relativePath}`
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async execute(context: ExecutionContext): Promise<void> {
    const filePath = path.isAbsolute(this.params.relativePath)
      ? this.params.relativePath
      : path.join(context.workspaceFolder.uri.fsPath, this.params.relativePath);

    const fileUri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(fileUri);
    const editor = await vscode.window.showTextDocument(document);
    
    context.currentEditor = editor;
    context.addCommand('open');
  }
}
