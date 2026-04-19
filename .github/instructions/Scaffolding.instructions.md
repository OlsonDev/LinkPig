---
description: Load when working with scaffolding, throwNotImplemented, or phased development.
---
# Scaffolding-first development

Work in two phases: scaffolding (design) then implementation.

## Phase 1: Scaffolding
Create structure with `throwNotImplemented()` calls to signal intent. Code must compile.

**Tests:** Empty test bodies or markers at change points.
```typescript
it('should validate line numbers', () => throwNotImplemented());
```

**Implementation:** Classes, signatures, properties—no logic yet.
```typescript
validate(context: ExecutionContext): ValidationResult {
  throwNotImplemented();
}
```

Reviewers approve the design before Phase 2 begins.

## Phase 2: Implementation
After scaffolding is approved and committed, fill in the actual logic.
