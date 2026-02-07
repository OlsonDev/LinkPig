import * as vscode from 'vscode';

export class ExecutionContext {
  constructor(
    public currentEditor: vscode.TextEditor | undefined,
    public readonly workspaceFolder: vscode.WorkspaceFolder,
    public readonly commandHistory: string[] = []
  ) {}

  clone(): ExecutionContext {
    return new ExecutionContext(
      this.currentEditor,
      this.workspaceFolder,
      [...this.commandHistory]
    );
  }

  addCommand(commandName: string): void {
    this.commandHistory.push(commandName);
  }
}
