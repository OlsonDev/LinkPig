import * as assert from 'assert';
import { SelectCommand } from './SelectCommand';
import { Selection, SelectParameters } from '../../core';
import { ExecutionContext } from '../ExecutionContext';
import { ValidationResult } from '../ValidationResult';

// ─────────────────────────────────────────────────────────────────────────────
// Test Helpers
// ─────────────────────────────────────────────────────────────────────────────

interface MockLine {
  text: string;
}

interface MockDocument {
  lineCount: number;
  lineAt(index: number): MockLine;
}

interface MockEditor {
  document: MockDocument;
  selection?: unknown;
}

function createMockDocument(lineCount: number, lineLengths: number[] = []): MockDocument {
  return {
    lineCount,
    lineAt(index: number): MockLine {
      const length = lineLengths[index] ?? 80; // Default 80 chars
      return { text: 'x'.repeat(length) };
    }
  };
}

function createMockEditor(lineCount: number, lineLengths: number[] = []): MockEditor {
  return {
    document: createMockDocument(lineCount, lineLengths)
  };
}

function createMockContext(editor?: MockEditor): ExecutionContext {
  const workspaceFolder = {
    uri: { fsPath: '/workspace' },
    name: 'test',
    index: 0
  } as unknown;
  return new ExecutionContext(
    editor as unknown as import('vscode').TextEditor | undefined,
    workspaceFolder as import('vscode').WorkspaceFolder
  );
}

function assertSelection(actual: Selection, expected: {
  anchorLine: number;
  anchorCharacter: number;
  activeLine: number;
  activeCharacter: number;
}): void {
  assert.strictEqual(actual.anchorLine, expected.anchorLine, 'anchorLine mismatch');
  assert.strictEqual(actual.anchorCharacter, expected.anchorCharacter, 'anchorCharacter mismatch');
  assert.strictEqual(actual.activeLine, expected.activeLine, 'activeLine mismatch');
  assert.strictEqual(actual.activeCharacter, expected.activeCharacter, 'activeCharacter mismatch');
}

function assertValidationError(
  result: ValidationResult,
  opts: { position?: number; selectionIndex?: number; messagePattern?: RegExp }
): void {
  assert.strictEqual(result.valid, false, 'expected validation to fail');
  assert.ok(result.errors.length > 0, 'expected at least one error');

  const error = result.errors[0] as ValidationResult['errors'][0] & { selectionIndex?: number };

  if (opts.position !== undefined) {
    assert.strictEqual(error.position, opts.position, 'position mismatch');
  }
  if (opts.selectionIndex !== undefined) {
    assert.strictEqual(error.selectionIndex, opts.selectionIndex, 'selectionIndex mismatch');
  }
  if (opts.messagePattern !== undefined) {
    assert.match(error.message, opts.messagePattern, 'message pattern mismatch');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('SelectCommand', () => {
  describe('commandKey', () => {
    it('equals "select"', () => {
      assert.strictEqual(SelectCommand.commandKey, 'select');
    });
  });

  describe('parse', () => {
    describe('single cursor', () => {
      it('parses line-only cursor', () => {
        const command = SelectCommand.parse('1', 0);

        assert.strictEqual(command.params.selections.length, 1);
        assertSelection(command.params.selections[0], {
          anchorLine: 1,
          anchorCharacter: 1,
          activeLine: 1,
          activeCharacter: 1
        });
        assert.strictEqual(command.params.addToExisting, false);
      });

      it('parses cursor with column', () => {
        const command = SelectCommand.parse('1:5', 0);

        assert.strictEqual(command.params.selections.length, 1);
        assertSelection(command.params.selections[0], {
          anchorLine: 1,
          anchorCharacter: 5,
          activeLine: 1,
          activeCharacter: 5
        });
      });

      it('defaults missing column to 1', () => {
        const command = SelectCommand.parse('7', 0);

        assertSelection(command.params.selections[0], {
          anchorLine: 7,
          anchorCharacter: 1,
          activeLine: 7,
          activeCharacter: 1
        });
      });
    });

    describe('same-line selection (column range)', () => {
      it('parses column range on same line', () => {
        const command = SelectCommand.parse('1:4-20', 0);

        assert.strictEqual(command.params.selections.length, 1);
        assertSelection(command.params.selections[0], {
          anchorLine: 1,
          anchorCharacter: 4,
          activeLine: 1,
          activeCharacter: 20
        });
      });

      it('parses column range starting at column 1', () => {
        const command = SelectCommand.parse('5:1-10', 0);

        assertSelection(command.params.selections[0], {
          anchorLine: 5,
          anchorCharacter: 1,
          activeLine: 5,
          activeCharacter: 10
        });
      });

      it('parses reversed column range', () => {
        const command = SelectCommand.parse('3:20-5', 0);

        assertSelection(command.params.selections[0], {
          anchorLine: 3,
          anchorCharacter: 20,
          activeLine: 3,
          activeCharacter: 5
        });
      });
    });

    describe('cross-line selection', () => {
      it('parses selection spanning multiple lines', () => {
        const command = SelectCommand.parse('1:4-2:6', 0);

        assertSelection(command.params.selections[0], {
          anchorLine: 1,
          anchorCharacter: 4,
          activeLine: 2,
          activeCharacter: 6
        });
      });

      it('parses line range with default characters', () => {
        const command = SelectCommand.parse('3-7', 0);

        assertSelection(command.params.selections[0], {
          anchorLine: 3,
          anchorCharacter: 1,
          activeLine: 7,
          activeCharacter: 1
        });
      });

      it('parses anchor with column, active line only', () => {
        const command = SelectCommand.parse('10:5-15', 0);

        assertSelection(command.params.selections[0], {
          anchorLine: 10,
          anchorCharacter: 5,
          activeLine: 15,
          activeCharacter: 1
        });
      });

      it('parses anchor line only, active with column', () => {
        const command = SelectCommand.parse('3-7:15', 0);

        assertSelection(command.params.selections[0], {
          anchorLine: 3,
          anchorCharacter: 1,
          activeLine: 7,
          activeCharacter: 15
        });
      });

      it('parses reversed cross-line selection', () => {
        const command = SelectCommand.parse('10:5-3:2', 0);

        assertSelection(command.params.selections[0], {
          anchorLine: 10,
          anchorCharacter: 5,
          activeLine: 3,
          activeCharacter: 2
        });
      });
    });

    describe('multiple selections', () => {
      it('parses two cursors', () => {
        const command = SelectCommand.parse('1;3', 0);

        assert.strictEqual(command.params.selections.length, 2);
        assertSelection(command.params.selections[0], {
          anchorLine: 1,
          anchorCharacter: 1,
          activeLine: 1,
          activeCharacter: 1
        });
        assertSelection(command.params.selections[1], {
          anchorLine: 3,
          anchorCharacter: 1,
          activeLine: 3,
          activeCharacter: 1
        });
      });

      it('parses two selections with different types', () => {
        const command = SelectCommand.parse('1:4-20;3:5-2:6', 0);

        assert.strictEqual(command.params.selections.length, 2);
        assertSelection(command.params.selections[0], {
          anchorLine: 1,
          anchorCharacter: 4,
          activeLine: 1,
          activeCharacter: 20
        });
        assertSelection(command.params.selections[1], {
          anchorLine: 3,
          anchorCharacter: 5,
          activeLine: 2,
          activeCharacter: 6
        });
      });

      it('parses three selections', () => {
        const command = SelectCommand.parse('1;5:3;10-12', 0);

        assert.strictEqual(command.params.selections.length, 3);
        assertSelection(command.params.selections[0], {
          anchorLine: 1,
          anchorCharacter: 1,
          activeLine: 1,
          activeCharacter: 1
        });
        assertSelection(command.params.selections[1], {
          anchorLine: 5,
          anchorCharacter: 3,
          activeLine: 5,
          activeCharacter: 3
        });
        assertSelection(command.params.selections[2], {
          anchorLine: 10,
          anchorCharacter: 1,
          activeLine: 12,
          activeCharacter: 1
        });
      });
    });

    describe('addToExisting prefix', () => {
      it('sets addToExisting when prefixed with +', () => {
        const command = SelectCommand.parse('+1:4-20', 0);

        assert.strictEqual(command.params.addToExisting, true);
        assertSelection(command.params.selections[0], {
          anchorLine: 1,
          anchorCharacter: 4,
          activeLine: 1,
          activeCharacter: 20
        });
      });

      it('sets addToExisting with multiple selections', () => {
        const command = SelectCommand.parse('+7;8', 0);

        assert.strictEqual(command.params.addToExisting, true);
        assert.strictEqual(command.params.selections.length, 2);
      });

      it('does not set addToExisting without + prefix', () => {
        const command = SelectCommand.parse('1:4-20', 0);

        assert.strictEqual(command.params.addToExisting, false);
      });
    });

    describe('position tracking', () => {
      it('carries position through to command', () => {
        const command = SelectCommand.parse('5:10', 3);

        assert.strictEqual(command.position, 3);
      });
    });

    describe('invalid format', () => {
      it('throws for empty value', () => {
        assert.throws(
          () => SelectCommand.parse('', 0),
          /missing|empty|invalid/i
        );
      });

      it('throws for non-numeric line', () => {
        assert.throws(
          () => SelectCommand.parse('abc', 0),
          /invalid|line|number/i
        );
      });

      it('throws for non-numeric column', () => {
        assert.throws(
          () => SelectCommand.parse('5:abc', 0),
          /invalid|column|character|number/i
        );
      });
    });
  });

  describe('validate', () => {
    describe('valid selections', () => {
      it('passes for single selection within bounds', async () => {
        const command = SelectCommand.parse('5:10', 0);
        const context = createMockContext(createMockEditor(10, [0, 0, 0, 0, 20]));

        const result = await command.validate(context);

        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
      });

      it('passes for multiple selections all within bounds', async () => {
        const command = SelectCommand.parse('1;3;5', 0);
        const context = createMockContext(createMockEditor(10));

        const result = await command.validate(context);

        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
      });

      it('passes for selection at end of line (character = length + 1)', async () => {
        const command = SelectCommand.parse('1:11', 0);
        const context = createMockContext(createMockEditor(5, [10]));

        const result = await command.validate(context);

        assert.strictEqual(result.valid, true);
      });

      it('passes for cross-line selection within bounds', async () => {
        const command = SelectCommand.parse('1:5-3:10', 0);
        const context = createMockContext(createMockEditor(5, [20, 20, 20]));

        const result = await command.validate(context);

        assert.strictEqual(result.valid, true);
      });
    });

    describe('no editor', () => {
      it('fails when no editor is open', async () => {
        const command = SelectCommand.parse('1:5', 0);
        const context = createMockContext(undefined);

        const result = await command.validate(context);

        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => /no.*file|editor/i.test(e.message)));
      });
    });

    describe('line validation', () => {
      it('fails when line < 1', async () => {
        // Line < 1 should be caught by SelectParameters constructor,
        // but we test parse error handling
        assert.throws(
          () => SelectCommand.parse('0', 0),
          /line|must|>= 1|positive/i
        );
      });

      it('fails when line exceeds document line count', async () => {
        const command = SelectCommand.parse('15', 0);
        const context = createMockContext(createMockEditor(10));

        const result = await command.validate(context);

        assertValidationError(result, {
          selectionIndex: 0,
          messagePattern: /line.*15.*out of range|exceed/i
        });
      });

      it('includes selectionIndex for second selection error', async () => {
        const command = SelectCommand.parse('5;20', 0);
        const context = createMockContext(createMockEditor(10));

        const result = await command.validate(context);

        const errorWithIndex = result.errors.find(
          (e: ValidationResult['errors'][0] & { selectionIndex?: number }) =>
            e.selectionIndex === 1
        );
        assert.ok(errorWithIndex, 'expected error with selectionIndex 1');
      });
    });

    describe('character validation', () => {
      it('fails when character < 1', async () => {
        // Character < 1 should be caught by Selection constructor
        assert.throws(
          () => new Selection({
            anchorLine: 1,
            anchorCharacter: 0,
            activeLine: 1,
            activeCharacter: 1
          }),
          /character|must|>= 1|positive/i
        );
      });

      it('fails when character exceeds line length + 1', async () => {
        const command = SelectCommand.parse('1:50', 0);
        const context = createMockContext(createMockEditor(5, [10]));

        const result = await command.validate(context);

        assertValidationError(result, {
          selectionIndex: 0,
          messagePattern: /character.*50.*out of range|exceed/i
        });
      });

      it('validates active character in cross-line selection', async () => {
        const command = SelectCommand.parse('1:5-2:100', 0);
        const context = createMockContext(createMockEditor(5, [20, 10]));

        const result = await command.validate(context);

        assertValidationError(result, {
          messagePattern: /character.*100.*out of range|exceed/i
        });
      });
    });

    describe('multiple error aggregation', () => {
      it('reports errors for multiple invalid selections', async () => {
        const command = SelectCommand.parse('1:50;20', 0);
        const context = createMockContext(createMockEditor(10, [10]));

        const result = await command.validate(context);

        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.length >= 2, 'expected at least 2 errors');
      });

      it('includes correct selectionIndex for each error', async () => {
        const command = SelectCommand.parse('100;1:5;200', 0);
        const context = createMockContext(createMockEditor(10, [20]));

        const result = await command.validate(context);

        const indices = result.errors.map(
          (e: ValidationResult['errors'][0] & { selectionIndex?: number }) =>
            e.selectionIndex
        );
        assert.ok(indices.includes(0), 'expected error for selection 0');
        assert.ok(indices.includes(2), 'expected error for selection 2');
      });
    });

    describe('position in errors', () => {
      it('includes command position in all errors', async () => {
        const command = SelectCommand.parse('100', 5);
        const context = createMockContext(createMockEditor(10));

        const result = await command.validate(context);

        assert.ok(result.errors.every(e => e.position === 5));
      });
    });
  });
});
