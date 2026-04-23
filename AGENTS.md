# Project overview

This is a Visual Studio Code extension project concerned with sharing `vscode://` links that execute arbitrary commands when clicked. For instance, one may instruct VS Code to open a specific file and go to a specific line. Commands are executed in query string parameter order.

# Subprojects

- `builder`: responsible for providing a chainable API that builds URIs
- `extension`: responsible for executing commands within VS Code
- `core`: types that are common for both
