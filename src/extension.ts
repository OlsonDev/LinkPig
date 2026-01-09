import * as vscode from 'vscode';
import * as path from 'path';

class LinkPigUriHandler implements vscode.UriHandler {
  handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
    console.log('Link Pig: Handling URI:', uri.toString());

    // Parse query parameters
    const query = new URLSearchParams(uri.query);
    const action = query.get('action');

    if (action === 'open') {
      return this.handleOpenAction(uri);
    }

    vscode.window.showWarningMessage(`Link Pig: Unknown action "${action}"`);
  }

  private async handleOpenAction(uri: vscode.Uri): Promise<void> {
    // Parse query parameters
    const query = new URLSearchParams(uri.query);
    const file = query.get('file');
    const lineStr = query.get('line');
    const columnStr = query.get('column');

    if (!file) {
      vscode.window.showErrorMessage('Link Pig: Missing "file" parameter');
      return;
    }

    // Get workspace folder
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('Link Pig: No workspace folder is open');
      return;
    }

    // Resolve the file path relative to workspace
    const filePath = path.isAbsolute(file) 
      ? file 
      : path.join(workspaceFolder.uri.fsPath, file);

    try {
      const fileUri = vscode.Uri.file(filePath);
      const document = await vscode.workspace.openTextDocument(fileUri);
      const editor = await vscode.window.showTextDocument(document);

      // Navigate to specific line and column if provided
      const line = lineStr ? parseInt(lineStr, 10) - 1 : 0; // VS Code uses 0-based line numbers
      const column = columnStr ? parseInt(columnStr, 10) - 1 : 0; // VS Code uses 0-based column numbers

      if (!isNaN(line)) {
        const position = new vscode.Position(Math.max(0, line), Math.max(0, column));
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(
          new vscode.Range(position, position),
          vscode.TextEditorRevealType.InCenter
        );
      }

      vscode.window.showInformationMessage(`Link Pig: Opened ${path.basename(file)} at line ${line + 1}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Link Pig: Failed to open file: ${error}`);
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Link Pig activated!');

  // Register URI handler
  const uriHandler = new LinkPigUriHandler();
  context.subscriptions.push(vscode.window.registerUriHandler(uriHandler));

  const cmdOpenLink = vscode.commands.registerCommand('linkPig.openLink', () => {
    vscode.window.showInformationMessage('Link Pig: Open Link command executed!');
  });

  const cmdCopyLink = vscode.commands.registerCommand('linkPig.copyLink', async (uri: vscode.Uri) => {
    try {
      // Get the workspace folder
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('Link Pig: No workspace folder is open');
        return;
      }

      let fileUri: vscode.Uri;
      let line: number | undefined;
      let column: number | undefined;

      // Check if there's an active editor with a selection
      const editor = vscode.window.activeTextEditor;
      if (editor && (!uri || editor.document.uri.toString() === uri.toString())) {
        // Called from editor context or explorer with an open editor
        fileUri = editor.document.uri;
        // Get the start of the first selection (1-based for URL)
        line = editor.selection.start.line + 1;
        column = editor.selection.start.character + 1;
      } else if (uri) {
        // Called from explorer context without matching editor
        fileUri = uri;
      } else {
        vscode.window.showErrorMessage('Link Pig: No file or editor available');
        return;
      }

      // Calculate relative path from workspace root
      const relativePath = path.relative(workspaceFolder.uri.fsPath, fileUri.fsPath);
      
      // Normalize to forward slashes for cleaner URLs
      const normalizedPath = relativePath.replace(/\\/g, '/');
      
      // Generate the link
      let link = `vscode://olsondev.link-pig?action=open&file=${normalizedPath}`;
      if (line !== undefined) {
        link += `&line=${line}`;
        if (column !== undefined) {
          link += `&column=${column}`;
        }
      }
      
      // Copy to clipboard
      await vscode.env.clipboard.writeText(link);
      
      vscode.window.showInformationMessage(`Link Pig: Link copied to clipboard!`);
    } catch (error) {
      vscode.window.showErrorMessage(`Link Pig: Failed to copy link: ${error}`);
    }
  });

  const cmdCopyLinkFromTab = vscode.commands.registerCommand('linkPig.copyLinkFromTab', async (uri: vscode.Uri) => {
    try {
      // Get the workspace folder
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('Link Pig: No workspace folder is open');
        return;
      }

      let fileUri: vscode.Uri;

      // Use the provided URI or fall back to active editor
      if (uri) {
        fileUri = uri;
      } else {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          fileUri = editor.document.uri;
        } else {
          vscode.window.showErrorMessage('Link Pig: No file or editor available');
          return;
        }
      }

      // Calculate relative path from workspace root
      const relativePath = path.relative(workspaceFolder.uri.fsPath, fileUri.fsPath);
      
      // Normalize to forward slashes for cleaner URLs
      const normalizedPath = relativePath.replace(/\\/g, '/');
      
      // Generate the link without line/column info
      const link = `vscode://olsondev.link-pig?action=open&file=${normalizedPath}`;
      
      // Copy to clipboard
      await vscode.env.clipboard.writeText(link);
      
      vscode.window.showInformationMessage(`Link Pig: Link copied to clipboard!`);
    } catch (error) {
      vscode.window.showErrorMessage(`Link Pig: Failed to copy link: ${error}`);
    }
  });

  context.subscriptions.push(cmdOpenLink);
  context.subscriptions.push(cmdCopyLink);
  context.subscriptions.push(cmdCopyLinkFromTab);
}

export function deactivate() {}