const exports = await import('../index.mjs');

describe('exports', () => {
  it('should be correct', () => {
    expect(Object.keys(exports)).toEqual([
      'ROUND',
      '_hasKey',
      '_isDefined',
      '_isEven',
      '_isHalf',
      'assert',
      'calculator',
      'default',
    ]);
  });
  it('should have Soldi as the default export', () => {
    expect(Object.keys(exports.default)).toEqual([
      'ROUND',
      'class',
      'extend',
      'minimum',
      'maximum',
    ]);
  });
});