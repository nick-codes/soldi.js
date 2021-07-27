import { assert } from '../index.mjs';

describe('assert', () => {
  describe('.validBase', () => {
    it('should throw on undefined', () => {
      expect(() => assert.validBase('test', undefined)).toThrow();
    });
    it('should throw on function returning undefined', () => {
      expect(() => assert.validBase('test', function() {})).toThrow();
    });
  });
  describe('hasMethod', () => {
    class Test {
      doTest() { }
    }
    it('should throw on no instance', () => {
      expect(() => assert.hasMethod(undefined, 'doTest')).toThrow();
    });
    it('should throw on no method', () => {
      expect(() => assert.hasMethod(Test, undefined)).toThrow();
    });
    it('should throw with no test method', () => {
      expect(() => assert.hasMethod({}, 'doTest')).toThrow();
    });
    it('should not throw on valid instance with method', () => {
      expect(() => assert.hasMethod(new Test(), 'doTest')).not.toThrow();
    });
  });
});