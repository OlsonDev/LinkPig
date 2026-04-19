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
- Add `throwNotImplemented()` so code compiles
- If the code in the implementation phase will likely use a block body, put your `throwNotImplemented()` inside a block body. This will keep our diffs cleaner.

### Test code example
```typescript
it('should validate line numbers', () => throwNotImplemented());
```

### App code example
```typescript
validate(context: ExecutionContext): ValidationResult {
  throwNotImplemented();
}
```

## Phase 2: Design review
- All reviewer agents must approve the design.

## Phase 3: Commit design
- @Committer commits the approved design.

## Phase 4: Implementation
- Write code that fills in the actual logic.

## Phase 5: Implementation review
- All reviewer agents must approve the implementation.

## Phase 6: Commit implementation
- @Committer commits the approved implementation.
