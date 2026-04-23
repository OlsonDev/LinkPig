---
description: Load when working with validation, including validating method parameters, decoding URI schemas, and simulating command execution.
---

# Philosophy

We want to follow a philosophy similar to Rust's error handling with `Result<T, E>`, which encourages each layer having to consider errors, as opposed to exceptions which can skip layers. In our case, we want `E` to be able to represent multiple errors because we want users to be able to fix all of them on the first try instead of having to iterate through them one by one.

## Always:

- Return structured information about validation errors, including:
  - Where it occurred (e.g. which command, which parameter, which index)
  - Why it's invalid (e.g. "line number must be a positive integer", "file doesn't exist", "character position exceeds line length")
  - Subclass validation errors for different contexts, e.g. `SelectionValidationError` with `selectionIndex` property to indicate which selection is invalid.
  - Include structured information that allows higher layers to format errors in the best way available to them. For example, a CLI error could colorize specific parts. Or a web-based error report could linkify specific parts.
- Validate all input before returning any errors.
- Validate all input in the same area of a method (usually first). For example, do not validate method parameter `foo`, set some state (`this._foo = foo;`), then validate parameter `bar`. This reads awkwardly and can put objects in inconsistent states. Consider making private helper methods for validation and calling them at the start of the method. The more parameters or complex the validation logic, the more important this becomes. These methods don't just have to do validation, though. For example, let's say `qux` needs to be transformed in some way. The helper method already has to do the work, so we can just store it on the `validationResult` and reuse it in the method.

```typescript
public doSomething(foo: number, qux: string): void {
  const validationResult = this.validateDoSomethingParameters(foo, qux);
  if (!validationResult.isValid) return validationResult;
  this._foo = foo;
  this._qux = validationResult.extractedQuxValues;
  // Rest of method
}
```

## Never:

- Throw exceptions for invalid input.

# URI validation

When parsing URIs, the entire query string should be validated while tracking positional information so more informative messages can be provided.

- First, the schema should be validated.
  - Is the key a valid command?
  - Is the value valid for its command?
- Next, we should simulate executing valid-schema'd commands sequentially. For example:
  - `open` should ensure the provided path exists.
  - `select` should ensure the provided ranges exist.
  - The simulation will have to pass the context from one command to the next. For example, if the first command is `open` and it successfully resolves a file, then the next command `select` should be validated against that file. If `open` fails to resolve a file, then `select` should be marked as invalid because its context doesn't exist. In this case, the invalidity of `select` due to not having a valid context should cease the simulation validation. However, if there was another command after the `select`, its schema validation should still be performed.
- If there are validation errors, present a combined report of all of them (schema & simulation).
- If there are no validation errors, execute all the commands
