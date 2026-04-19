---
description: Load when working with tests, including test files and test-related code.
applyTo: **/*.spec.ts, **/*.test.ts, **/tests/**, **/*Test*/**/*.ts
---
# Tests
## Always
- All commands need unit tests for:
  - Encoding
  - Decoding (parsing)
  - Validation
    - We needs tests for individual validation rules, e.g.
      - `open` command's path must look like a file path
      - `open` command's path must exist
      - `select` command's line and and character parameters must be positive integers
    - Multiple validation errors should be reported together, therefore we need tests for aggregated validation rules, e.g.
      - `select`'s `anchorLine` isn't a positive integer and its `activeCharacter` is out of range.

- Tests should be deterministic and not rely on external state. Use mocking and test doubles as necessary
- Tests code should be DRY:
  - Make helper methods and classes
  - Extract common setup code
  - Extract construction of test data
  - Extract common sets of assertions

## Mocking
Command validation tests will likely require mocking of the VS Code API and possibly other parts of the system. This is because validation may depend on the state of the file system, the contents of files, and the state of the text editor. For example:
  - Can I `open` this file? If the mock says it exists, yes. (Otherwise, no.)
  - Can I `select` these characters on this line in the current text editor? If the mock says they exist, yes. (Otherwise, no.)
