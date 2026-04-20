import * as assert from 'assert';
import { Selection } from './Selection';

describe('Selection', () => {
  describe('constructor', () => {
    it('assigns all four parameters', () => {
      const selection = new Selection({
        anchorLine: 5,
        anchorCharacter: 10,
        activeLine: 8,
        activeCharacter: 15
      });

      assert.strictEqual(selection.anchorLine, 5);
      assert.strictEqual(selection.anchorCharacter, 10);
      assert.strictEqual(selection.activeLine, 8);
      assert.strictEqual(selection.activeCharacter, 15);
    });

    it('accepts reversed selection (active before anchor)', () => {
      const selection = new Selection({
        anchorLine: 10,
        anchorCharacter: 5,
        activeLine: 3,
        activeCharacter: 2
      });

      assert.strictEqual(selection.anchorLine, 10);
      assert.strictEqual(selection.anchorCharacter, 5);
      assert.strictEqual(selection.activeLine, 3);
      assert.strictEqual(selection.activeCharacter, 2);
    });

    it('accepts single character cursor (all values equal)', () => {
      const selection = new Selection({
        anchorLine: 7,
        anchorCharacter: 12,
        activeLine: 7,
        activeCharacter: 12
      });

      assert.strictEqual(selection.anchorLine, 7);
      assert.strictEqual(selection.anchorCharacter, 12);
      assert.strictEqual(selection.activeLine, 7);
      assert.strictEqual(selection.activeCharacter, 12);
    });
  });

  describe('fromLine', () => {
    it('creates cursor at start of line', () => {
      const selection = Selection.fromLine(5);

      assert.strictEqual(selection.anchorLine, 5);
      assert.strictEqual(selection.anchorCharacter, 1);
      assert.strictEqual(selection.activeLine, 5);
      assert.strictEqual(selection.activeCharacter, 1);
    });

    it('creates cursor at line 1', () => {
      const selection = Selection.fromLine(1);

      assert.strictEqual(selection.anchorLine, 1);
      assert.strictEqual(selection.anchorCharacter, 1);
      assert.strictEqual(selection.activeLine, 1);
      assert.strictEqual(selection.activeCharacter, 1);
    });
  });

  describe('fromPosition', () => {
    it('creates cursor at specified position', () => {
      const selection = Selection.fromPosition(10, 25);

      assert.strictEqual(selection.anchorLine, 10);
      assert.strictEqual(selection.anchorCharacter, 25);
      assert.strictEqual(selection.activeLine, 10);
      assert.strictEqual(selection.activeCharacter, 25);
    });

    it('creates cursor at position (1, 1)', () => {
      const selection = Selection.fromPosition(1, 1);

      assert.strictEqual(selection.anchorLine, 1);
      assert.strictEqual(selection.anchorCharacter, 1);
      assert.strictEqual(selection.activeLine, 1);
      assert.strictEqual(selection.activeCharacter, 1);
    });
  });

  describe('fromLineRange', () => {
    it('creates selection spanning multiple lines', () => {
      const selection = Selection.fromLineRange(3, 7);

      assert.strictEqual(selection.anchorLine, 3);
      assert.strictEqual(selection.anchorCharacter, 1);
      assert.strictEqual(selection.activeLine, 7);
      assert.strictEqual(selection.activeCharacter, 1);
    });

    it('creates reversed selection (active line before anchor line)', () => {
      const selection = Selection.fromLineRange(10, 5);

      assert.strictEqual(selection.anchorLine, 10);
      assert.strictEqual(selection.anchorCharacter, 1);
      assert.strictEqual(selection.activeLine, 5);
      assert.strictEqual(selection.activeCharacter, 1);
    });

    it('creates cursor when anchor and active lines are equal', () => {
      const selection = Selection.fromLineRange(4, 4);

      assert.strictEqual(selection.anchorLine, 4);
      assert.strictEqual(selection.anchorCharacter, 1);
      assert.strictEqual(selection.activeLine, 4);
      assert.strictEqual(selection.activeCharacter, 1);
    });
  });

  describe('fromCharacterRange', () => {
    it('creates selection on same line', () => {
      const selection = Selection.fromCharacterRange(5, 10, 20);

      assert.strictEqual(selection.anchorLine, 5);
      assert.strictEqual(selection.anchorCharacter, 10);
      assert.strictEqual(selection.activeLine, 5);
      assert.strictEqual(selection.activeCharacter, 20);
    });

    it('creates reversed selection (active before anchor)', () => {
      const selection = Selection.fromCharacterRange(8, 30, 5);

      assert.strictEqual(selection.anchorLine, 8);
      assert.strictEqual(selection.anchorCharacter, 30);
      assert.strictEqual(selection.activeLine, 8);
      assert.strictEqual(selection.activeCharacter, 5);
    });

    it('creates cursor when characters are equal', () => {
      const selection = Selection.fromCharacterRange(3, 15, 15);

      assert.strictEqual(selection.anchorLine, 3);
      assert.strictEqual(selection.anchorCharacter, 15);
      assert.strictEqual(selection.activeLine, 3);
      assert.strictEqual(selection.activeCharacter, 15);
    });
  });

  describe('properties are readonly', () => {
    it('anchorLine is readonly', () => {
      const selection = Selection.fromLine(5);
      const descriptor = Object.getOwnPropertyDescriptor(selection, 'anchorLine');

      assert.strictEqual(descriptor?.writable, false);
    });

    it('anchorCharacter is readonly', () => {
      const selection = Selection.fromLine(5);
      const descriptor = Object.getOwnPropertyDescriptor(selection, 'anchorCharacter');

      assert.strictEqual(descriptor?.writable, false);
    });

    it('activeLine is readonly', () => {
      const selection = Selection.fromLine(5);
      const descriptor = Object.getOwnPropertyDescriptor(selection, 'activeLine');

      assert.strictEqual(descriptor?.writable, false);
    });

    it('activeCharacter is readonly', () => {
      const selection = Selection.fromLine(5);
      const descriptor = Object.getOwnPropertyDescriptor(selection, 'activeCharacter');

      assert.strictEqual(descriptor?.writable, false);
    });
  });
});
