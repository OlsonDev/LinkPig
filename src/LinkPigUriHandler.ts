import * as path from 'path';
import * as vscode from 'vscode';

export class LinkPigUriHandler implements vscode.UriHandler {
  handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
    const query = new URLSearchParams(uri.query);
    const action = query.get('action');

    if (action === 'open') {
      return this.handleOpenAction(query);
    }

    vscode.window.showWarningMessage(`Link Pig: Unknown action "${action}"`);
  }

  private async handleOpenAction(query: URLSearchParams): Promise<void> {
    const file = query.get('file');

    if (!file) {
      vscode.window.showErrorMessage('Link Pig: Missing "file" parameter');
      return;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('Link Pig: No workspace folder is open');
      return;
    }

    const filePath = path.isAbsolute(file)
      ? file
      : path.join(workspaceFolder.uri.fsPath, file);

    try {
      const fileUri = vscode.Uri.file(filePath);
      const document = await vscode.workspace.openTextDocument(fileUri);
      const editor = await vscode.window.showTextDocument(document);
      const line = this.getPositionParam(query, 'line');
      const column = this.getPositionParam(query, 'column');

      if (!isNaN(line)) {
        const position = new vscode.Position(Math.max(0, line), Math.max(0, column));
        const range = new vscode.Range(position, position);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
      }

      vscode.window.showInformationMessage(`Link Pig: Opened ${path.basename(file)} at line ${line + 1}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Link Pig: Failed to open file: ${error}`);
    }
  }

  private getPositionParam(query: URLSearchParams, key: string): number {
    const str = query.get(key);
    return str ? parseInt(str, 10) - 1: 0;
  }
}
