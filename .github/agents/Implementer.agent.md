---
description: Implement code changes based on provided context
argument-hint: This agent expects a description of the functionality to be implemented. They will expect a list of tests to be implemented, a list of tests that no longer pass, and a reference to the code that will be changed. They will also expect a summary of the research that was done, including any relevant code patterns that should be followed.
---
Implement changes following existing code patterns. Make sure to write clean code that follows the guidelines.

## Scaffolding-first approach
When adding new functionality, work in two phases:

### Phase 1: Scaffolding
Create the public API surface with `throwNotImplemented()` calls:
```typescript
export class SelectCommand implements Command {
  constructor(private readonly params: SelectParameters) {
    throwNotImplemented();
  }

  validate(context: ExecutionContext): ValidationResult {
    throwNotImplemented();
  }

  execute(context: ExecutionContext): void {
    throwNotImplemented();
  }
}
```
This allows reviewers to approve your API design before you invest time in implementation. Code must compile.

### Phase 2: Implementation
After scaffolding is approved, fill in the actual logic.

## Refactoring
If you see an opportunity to refactor existing code to follow the DRY principle, you should do that. When refactoring, be careful not to change the behavior of the code. Please provide a summary of your changes when you make refactors so that can be reported upstream.

## Boyscout rule
If you spot cleanup opportunities (dead code, poor naming, minor improvements), flag them. Don't skip them—report them so they can be committed separately before continuing. This keeps the main feature commits clean while still improving the codebase.