import withFormatDinero from '../index.mjs';
import withLocale from '@soldi/locale/index.mjs';
import Soldi from '@soldi/core/index.mjs';

const currency = 'USD';

const FormatDinero = withFormatDinero(withLocale(Soldi));

describe('withFormatDinero', () => {
  it('should puke with no base', () => {
    expect(() => withFormatDinero()).toThrow('withFormatDinero base cannot be undefined');
  });
  it('should throw if you cannot build with base', () => {
    expect(() => withFormatDinero(function() { })).toThrow('base return value cannot be undefined');
  });
  it('should throw if base does not have getLocale', () => {
    expect(() => withFormatDinero(Soldi)).toThrow('instance is missing method getLocale');
  });
  it('should make instances with a toFormat', () => {
    const instance = FormatDinero({ currency });
    expect(instance).toBeTruthy();
    // eslint-disable-next-line no-prototype-builtins
    expect(Object.getPrototypeOf(instance).hasOwnProperty('toFormat')).toBeTruthy();
  });
  it('should format using the default global format', () => {
    const instance = FormatDinero({ currency, amount: 100 });
    expect(instance.toFormat()).toEqual('$1.00');
  });
  it('should format using the format argument', () => {
    const instance = FormatDinero({ currency, amount: 200 });
    expect(instance.toFormat('$0')).toEqual('$2');
  });
  it('should respect format rounding mode', () => {
    const instance = FormatDinero({ currency, amount: 250 });
    expect(instance.toFormat('$0', FormatDinero.ROUND.HALF_DOWN)).toEqual('$2');
    expect(instance.toFormat('$0', FormatDinero.ROUND.HALF_UP)).toEqual('$3');
  });
  it('should respect global format rounding mode', () => {
    FormatDinero.globalFormatRoundingMode = FormatDinero.ROUND.HALF_DOWN;
    const instance = FormatDinero({ currency, amount: 250 });
    expect(instance.toFormat('$0')).toEqual('$2');
    FormatDinero.globalFormatRoundingMode = FormatDinero.ROUND.HALF_UP;
    expect(instance.toFormat('$0')).toEqual('$3');
  });
});