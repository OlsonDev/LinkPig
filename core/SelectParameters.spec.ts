import * as assert from 'assert';
import { SelectParameters } from './SelectParameters';
import { Selection } from './Selection';

describe('SelectParameters', () => {
  describe('constructor', () => {
    it('assigns selections array', () => {
      const selections = [Selection.fromLine(5)];
      const params = new SelectParameters({ selections });

      assert.strictEqual(params.selections.length, 1);
      assert.strictEqual(params.selections[0].anchorLine, 5);
    });

    it('assigns addToExisting flag', () => {
      const selections = [Selection.fromLine(1)];
      const params = new SelectParameters({ selections, addToExisting: true });

      assert.strictEqual(params.addToExisting, true);
    });

    it('defaults addToExisting to false', () => {
      const selections = [Selection.fromLine(1)];
      const params = new SelectParameters({ selections });

      assert.strictEqual(params.addToExisting, false);
    });

    it('accepts multiple selections', () => {
      const selections = [
        Selection.fromLine(1),
        Selection.fromLine(3),
        Selection.fromPosition(5, 10)
      ];
      const params = new SelectParameters({ selections });

      assert.strictEqual(params.selections.length, 3);
    });

    it('throws when selections array is empty', () => {
      assert.throws(
        () => new SelectParameters({ selections: [] }),
        /selections.*empty/i
      );
    });
  });

  describe('toQueryParams', () => {
    describe('single cursor', () => {
      it('encodes line-only cursor', () => {
        const selections = [Selection.fromLine(1)];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '1' });
      });

      it('encodes cursor with column', () => {
        const selections = [Selection.fromPosition(1, 5)];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '1:5' });
      });

      it('omits column when character is 1', () => {
        const selections = [Selection.fromPosition(7, 1)];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '7' });
      });
    });

    describe('same-line selection (column range)', () => {
      it('encodes column range on same line', () => {
        const selections = [Selection.fromCharacterRange(1, 1, 10)];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '1:1-10' });
      });

      it('encodes column range with non-1 anchor', () => {
        const selections = [Selection.fromCharacterRange(1, 4, 20)];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '1:4-20' });
      });

      it('encodes reversed column range', () => {
        const selections = [Selection.fromCharacterRange(5, 20, 4)];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '5:20-4' });
      });
    });

    describe('cross-line selection', () => {
      it('encodes selection spanning multiple lines', () => {
        const selections = [new Selection({
          anchorLine: 1,
          anchorCharacter: 4,
          activeLine: 2,
          activeCharacter: 6
        })];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '1:4-2:6' });
      });

      it('omits anchor character when 1', () => {
        const selections = [new Selection({
          anchorLine: 3,
          anchorCharacter: 1,
          activeLine: 7,
          activeCharacter: 15
        })];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '3-7:15' });
      });

      it('omits active character when 1', () => {
        const selections = [new Selection({
          anchorLine: 10,
          anchorCharacter: 5,
          activeLine: 15,
          activeCharacter: 1
        })];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '10:5-15' });
      });

      it('omits both characters when both are 1', () => {
        const selections = [Selection.fromLineRange(3, 7)];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '3-7' });
      });

      it('encodes reversed cross-line selection (active before anchor)', () => {
        const selections = [new Selection({
          anchorLine: 10,
          anchorCharacter: 5,
          activeLine: 3,
          activeCharacter: 2
        })];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '10:5-3:2' });
      });
    });

    describe('multiple selections', () => {
      it('delimits selections with semicolon', () => {
        const selections = [
          Selection.fromLine(1),
          Selection.fromLine(3)
        ];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '1;3' });
      });

      it('encodes multiple cursors with columns', () => {
        const selections = [
          Selection.fromPosition(1, 5),
          Selection.fromPosition(3, 10)
        ];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '1:5;3:10' });
      });

      it('encodes mixed cursor types', () => {
        const selections = [
          Selection.fromCharacterRange(1, 4, 20),
          new Selection({
            anchorLine: 3,
            anchorCharacter: 5,
            activeLine: 2,
            activeCharacter: 6
          })
        ];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '1:4-20;3:5-2:6' });
      });

      it('encodes three selections', () => {
        const selections = [
          Selection.fromLine(1),
          Selection.fromPosition(5, 3),
          Selection.fromLineRange(10, 12)
        ];
        const params = new SelectParameters({ selections });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '1;5:3;10-12' });
      });
    });

    describe('addToExisting prefix', () => {
      it('prefixes with + when addToExisting is true', () => {
        const selections = [Selection.fromLine(7)];
        const params = new SelectParameters({ selections, addToExisting: true });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '+7' });
      });

      it('prefixes multiple selections with +', () => {
        const selections = [
          Selection.fromLine(7),
          Selection.fromLine(8)
        ];
        const params = new SelectParameters({ selections, addToExisting: true });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '+7;8' });
      });

      it('prefixes column range with +', () => {
        const selections = [Selection.fromCharacterRange(1, 4, 20)];
        const params = new SelectParameters({ selections, addToExisting: true });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '+1:4-20' });
      });

      it('does not prefix when addToExisting is false', () => {
        const selections = [Selection.fromLine(7)];
        const params = new SelectParameters({ selections, addToExisting: false });

        const result = params.toQueryParams();

        assert.deepStrictEqual(result, { select: '7' });
      });
    });
  });

  describe('properties are readonly', () => {
    it('selections is readonly', () => {
      const selections = [Selection.fromLine(5)];
      const params = new SelectParameters({ selections });
      const descriptor = Object.getOwnPropertyDescriptor(params, 'selections');

      assert.strictEqual(descriptor?.writable, false);
    });

    it('addToExisting is readonly', () => {
      const selections = [Selection.fromLine(5)];
      const params = new SelectParameters({ selections });
      const descriptor = Object.getOwnPropertyDescriptor(params, 'addToExisting');

      assert.strictEqual(descriptor?.writable, false);
    });
  });
});
