import * as vscode from "vscode";
import * as path from "path";
import { LinkPigUriHandler } from "./LinkPigUriHandler";

function buildOpenLink(
  fileUri: vscode.Uri,
  line?: number,
  column?: number
): string | null {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage("Link Pig: No workspace folder is open");
    return null;
  }

  const relativePath = path.relative(
    workspaceFolder.uri.fsPath,
    fileUri.fsPath
  );

  // Use forward slashes for cleaner URLs.
  const normalizedPath = relativePath.replace(/\\/g, "/");
  let link = `vscode://olsondev.link-pig?action=open&file=${normalizedPath}`;
  if (line !== undefined) {
    link += `&line=${line}`;
    if (column !== undefined) {
      link += `&column=${column}`;
    }
  }
  return link;
}

async function copyOpenLink(
  fileUri: vscode.Uri,
  line?: number,
  column?: number
): Promise<void> {
  const link = buildOpenLink(fileUri, line, column);
  if (link) {
    await vscode.env.clipboard.writeText(link);
    vscode.window.showInformationMessage(`Link Pig: Link copied to clipboard!`);
  } else {
    vscode.window.showErrorMessage("Link Pig: Failed to build link");
  }
}

async function copyLinkToFileLineColumn(fileUri: vscode.Uri): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("Link Pig: No editor available");
    return;
  }

  const line = editor.selection.start.line + 1;
  const column = editor.selection.start.character + 1;
  await copyOpenLink(fileUri, line, column);
}

async function copyLinkToFile(fileUri: vscode.Uri): Promise<void> {
  await copyOpenLink(fileUri);
}

export function activate(context: vscode.ExtensionContext) {
  const uriHandler = new LinkPigUriHandler();
  context.subscriptions.push(vscode.window.registerUriHandler(uriHandler));
  const cmdCopyLinkToFileLineColumn = vscode.commands.registerCommand(
    "linkPig.copyLinkToFileLineColumn",
    copyLinkToFileLineColumn
  );
  const cmdCopyLinkToFile = vscode.commands.registerCommand(
    "linkPig.copyLinkToFile",
    copyLinkToFile
  );

  context.subscriptions.push(cmdCopyLinkToFileLineColumn);
  context.subscriptions.push(cmdCopyLinkToFile);
}

export function deactivate() {}
