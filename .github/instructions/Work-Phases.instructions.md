---
description: Load when working with phased development.
---

# Design-first development

Work in two main phases: design then implementation. You may look for §Detours first, and handle them in either the Design or Implementation phase as appropriate. They should be reviewed like any other change, but the @Committer should make separate commit(s) for them.

## Phase 1: Design

- Write code that expresses design intent.
  - What classes and methods will exist?
  - What tests will be added/modified?
  - Add minimal comments to clarify intent if needed
- Add `throwNotImplemented()` so code compiles. Import it from `dev/`:

  ```typescript
  import { throwNotImplemented } from '../dev';
  ```

  - Add `throwNotImplemented('intended design')` if the surrounding context isn't clear enough.
  - If the code in the implementation phase will likely use a block body, put your `throwNotImplemented()` inside a block body. This will keep our diffs cleaner.
  - Remove the import when the implementation phase replaces all `throwNotImplemented()` calls.

### Test code example

```typescript
it('should validate line numbers', () => throwNotImplemented());
```

### Source code example

```typescript
validate(context: ExecutionContext): ValidationResult {
  throwNotImplemented('line numbers, foo, bar, baz');
}
```

## Phase 2: Design review

- @Reviewer-Lead must approve the design.

## Phase 3: Commit design

- @Committer commits the approved design.

## Phase 4: Implementation

- Write code that fills in the actual logic.

## Phase 5: Implementation review

- @Reviewer-Lead must approve the implementation.

## Phase 6: Commit implementation

- @Committer commits the approved implementation.
