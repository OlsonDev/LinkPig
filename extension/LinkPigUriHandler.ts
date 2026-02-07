import * as vscode from 'vscode';
import { Command } from './Command';
import { ExecutionContext } from './ExecutionContext';
import { ValidationResult } from './ValidationResult';
import { OpenCommand } from './commands/OpenCommand';
import { SelectCommand } from './commands/SelectCommand';

interface CommandConstructor {
  readonly commandKey: string;
  parse(value: string, position: number): Command;
}

export class LinkPigUriHandler implements vscode.UriHandler {
  private commandRegistry: Map<string, CommandConstructor> = new Map([
    [OpenCommand.commandKey, OpenCommand as CommandConstructor],
    [SelectCommand.commandKey, SelectCommand as CommandConstructor]
  ]);

  async handleUri(uri: vscode.Uri): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('Link Pig: No workspace folder is open');
      return;
    }

    try {
      const commands = this.parseCommands(uri.query);
      
      if (commands.length === 0) {
        vscode.window.showWarningMessage('Link Pig: No commands found in URI');
        return;
      }

      const context = new ExecutionContext(
        vscode.window.activeTextEditor,
        workspaceFolder
      );

      const validationResult = await this.validateCommands(commands, context);
      
      if (!validationResult.valid) {
        await this.showValidationErrors(validationResult.errors);
        return;
      }

      await this.executeCommands(commands, context);
      
      vscode.window.showInformationMessage(
        `Link Pig: Executed ${commands.length} command${commands.length > 1 ? 's' : ''}`
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Link Pig: ${error}`);
    }
  }

  private parseCommands(queryString: string): Command[] {
    const params = new URLSearchParams(queryString);
    const commands: Command[] = [];
    let position = 0;

    for (const [key, value] of params.entries()) {
      const CommandClass = this.commandRegistry.get(key);
      
      if (CommandClass) {
        try {
          const command = CommandClass.parse(value, position);
          commands.push(command);
        } catch (error) {
          throw new Error(`Failed to parse "${key}" command: ${error}`);
        }
      } else {
        vscode.window.showWarningMessage(`Link Pig: Unknown command "${key}"`);
      }
      
      position++;
    }

    return commands;
  }

  private async validateCommands(
    commands: Command[],
    realContext: ExecutionContext
  ): Promise<ValidationResult> {
    const allErrors: ValidationResult['errors'] = [];
    const validationContext = realContext.clone();

    for (const command of commands) {
      const result = await command.validate(validationContext);
      if (!result.valid) {
        allErrors.push(...result.errors);
      }
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  }

  private async executeCommands(
    commands: Command[],
    context: ExecutionContext
  ): Promise<void> {
    for (const command of commands) {
      await command.execute(context);
    }
  }

  private async showValidationErrors(
    errors: ValidationResult['errors']
  ): Promise<void> {
    const summary = errors.length === 1
      ? '1 validation error found'
      : `${errors.length} validation errors found`;
    
    const detailedErrors = errors
      .map(e => `[${e.param} #${e.position}] ${e.message}`)
      .join('\n');

    const action = await vscode.window.showErrorMessage(
      `Link Pig: ${summary}`,
      'Copy Details'
    );

    if (action === 'Copy Details') {
      await vscode.env.clipboard.writeText(detailedErrors);
      vscode.window.showInformationMessage('Error details copied to clipboard');
    }
  }
}
