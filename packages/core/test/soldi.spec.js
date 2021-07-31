import { jest } from '@jest/globals';

import Soldi from '../index.mjs';

// A default currency
const currency = 'USD';
// A higher precision
const highPrecision = 4;
// various amounts
const oneDollar = Soldi({ currency, amount: 100 });
const onePreciseDollar = Soldi({ currency, amount: 10000, precision: highPrecision });
const oneEuro = Soldi({ currency: 'EUR', amount: 100 });
const negativeOneDollar = oneDollar.multiply(-1);
const zero = Soldi({ currency, precision: 0 });
const max = Soldi({ currency, amount: Number.MAX_VALUE, precision: 0});
const halfMax = Soldi({ currency, amount: Number.MAX_VALUE / 2, precision: 0 });
const fittyCent = Soldi({ currency, amount: 50 });
const fourtyCents = Soldi({ currency, amount: 40 });
const iouFittyCent = Soldi({ currency, amount: -50 });
const treeFitty = Soldi({ currency, amount: 350 });
const twoFitty = Soldi({ currency, amount: 250 });
const twoFourty = Soldi({ currency, amount: 240 });
const centUno = Soldi({ currency, amount: 101 });
const trentaDue = Soldi({ currency, amount: 302 });

const section = (name, func) => describe(`# ${name} #`, func);
section.only = (name, func) => describe.only(`# ${name} #`, func);
section.skip = (name, func) => describe.skip(`# ${name} #`, func);

describe('Soldi', () => {
  section('instantiation', () => {
    describe('without currency', () => {
      it('should throw', () => {
        expect(Soldi).toThrow();
      });
    });

    describe('with precision inference', () => {
      const precisions = {
        'BHD': 3,
        'IQD': 3,
        'JOD': 3,
        'BIF': 0,
        'BYR': 0,
        'CLP': 0,
        'DJF': 0,
        'GNF': 0,
        'GWP': 0,
        'JPY': 0,
        'MGA': 0,
        'PYG': 0,
        'RWF': 0,
        'VND': 0,
        'VUV': 0,
        'XOF': 0,
        'XPF': 0,
        'USD': 2,
        'EUR': 2,
        'CAD': 2,
      };

      Object.keys(precisions).forEach(currency => {
        const precision = precisions[currency];
        it(`should infer precision ${precision} for ${currency}`, () => {
          expect(Soldi({ currency }).getPrecision()).toEqual(precision);
        });
      });
    });

    describe('with options', () => {
      const options = {
        'currency': {
          value: 'EUR',
          getter: 'getCurrency',
        },
        'precision': {
          value: 5,
          getter: 'getPrecision',
        },
        'amount': {
          value: 100,
          getter: 'getAmount',
        },
        'unit': {
          value: 1.50,
          getter: 'toUnit',
        },
      };

      Object.keys(options).forEach(option => {
        it(`should respect ${option} option`, () => {
          const { value, getter } = options[option];
          // We always need a currency
          const theOptions = Object.assign({ currency }, { [option]: value });
          const soldi = Soldi(theOptions);
          expect(soldi).toBeTruthy();
          expect(soldi[getter]()).toEqual(value);
        });
      });
    });
  });

  section('basic math', () => {
    const operations = {
      'add': {
        args: [oneDollar],
        expect: 200,
        normalize: [onePreciseDollar],
        overflow: [halfMax, max],
      },
      'subtract': {
        args: [oneDollar],
        expect: 0,
        normalize: [onePreciseDollar],
        overflow: [oneDollar, halfMax],
      },
      'multiply': {
        args: [2],
        expect: 200,
        overflow: [halfMax, Number.MAX_VALUE],
        noOverflow: [max, 0],
      },
      'percentage': {
        args: [10],
        expect: 10,
        overflow: [halfMax, 0],
      },
      'divide': {
        args: [2],
        expect: 50,
        overflow: [oneDollar, 0],
        noOverflow: [zero, Number.MAX_VALUE],
      },
    };
    Object.keys(operations).forEach(operation => {
      describe(`.${operation}`, () => {
        const theTest = operations[operation];
        it(`should ${operation} correctly`, () => {
          const sum = oneDollar[operation](...theTest.args);
          expect(sum.getPrecision()).toEqual(2);
          expect(sum.getAmount()).toEqual(theTest.expect);
          expect(sum.getCurrency()).toEqual('USD');
        });

        it('should detect overflow', () => {
          const [ base, arg ] = theTest.overflow;
          expect(() => base[operation](arg)).toThrow();
        });

        if (theTest.noOverflow) {
          const [ base, arg ] = theTest.noOverflow;
          it(`should not overflow with ${base} ${operation} ${arg}`, () => {
            expect(() => base[operation](arg)).not.toThrow();
          });
        }

        if (theTest.normalize) {
          it('should throw when currencies differ', () => {
            expect(() => oneDollar[operation](oneEuro)).toThrow();
          });

          it('should normalize precision', () => {
            const sum = oneDollar[operation](onePreciseDollar);
            expect(sum.getPrecision()).toEqual(highPrecision);
            expect(sum.getAmount()).toEqual(theTest.expect * Math.pow(10, highPrecision - 2));
            expect(sum.getCurrency()).toEqual('USD');
          });
        } else {
          // TODO: Test rounding behavior on multiply and divide
        }
      });
    });
  });

  section('comparison', () => {
    const tests = {
      'hasSamePrecisionAs': {
        'same value': {
          base: oneDollar,
          value: oneDollar,
          expected: true,
        },
        'different precision': {
          base: oneDollar,
          value: onePreciseDollar,
          expected: false,
        },
        'different values same precision': {
          base: oneDollar,
          value: oneEuro,
          expected: true,
        },
      },
      'hasSameAmountAs': {
        'same value': {
          base: oneDollar,
          value: oneDollar,
          expected: true,
        },
        'different precision': {
          base: oneDollar,
          value: onePreciseDollar,
          expected: true,
        },
        'different values': {
          base: oneDollar,
          value: zero,
          expected: false,
        },
      },
      'isEqualTo': {
        'same value': {
          base: oneDollar,
          value: oneDollar,
          expected: true,
        },
        'different precision': {
          base: oneDollar,
          value: onePreciseDollar,
          expected: true,
        },
        'different values': {
          base: oneDollar,
          value: zero,
          expected: false,
        },
      },
      'isLessThan': {
        'same value': {
          base: oneDollar,
          value: oneDollar,
          expected: false,
        },
        'different precision': {
          base: oneDollar,
          value: onePreciseDollar,
          expected: false,
        },
        'greater than': {
          base: oneDollar,
          value: zero,
          expected: false,
        },
        'less than': {
          base: zero,
          value: oneDollar,
          expected: true,
        },
      },
      'isLessThanOrEqualTo': {
        'same value': {
          base: oneDollar,
          value: oneDollar,
          expected: true,
        },
        'different precision': {
          base: oneDollar,
          value: onePreciseDollar,
          expected: true,
        },
        'greater than': {
          base: oneDollar,
          value: zero,
          expected: false,
        },
        'less than': {
          base: zero,
          value: oneDollar,
          expected: true,
        },
      },
      'isGreaterThan': {
        'same value': {
          base: oneDollar,
          value: oneDollar,
          expected: false,
        },
        'different precision': {
          base: oneDollar,
          value: onePreciseDollar,
          expected: false,
        },
        'greater than': {
          base: oneDollar,
          value: zero,
          expected: true,
        },
        'less than': {
          base: zero,
          value: oneDollar,
          expected: false,
        },
      },
      'isGreaterThanOrEqualTo': {
        'same value': {
          base: oneDollar,
          value: oneDollar,
          expected: true,
        },
        'different precision': {
          base: oneDollar,
          value: onePreciseDollar,
          expected: true,
        },
        'greater than': {
          base: oneDollar,
          value: zero,
          expected: true,
        },
        'less than': {
          base: zero,
          value: oneDollar,
          expected: false,
        },
      },
      'isZero': {
        'non zero value': {
          base: oneDollar,
          expected: false,
        },
        'zero value': {
          base: zero,
          expected: true,
        },
      },
      'isGreaterThanZero': {
        'positive value': {
          base: oneDollar,
          expected: true,
        },
        'negative value': {
          base: negativeOneDollar,
          expected: false,
        },
        'zero value': {
          base: zero,
          expected: false,
        },
      },
      'isPositive': {
        'positive value': {
          base: oneDollar,
          expected: true,
        },
        'negative value': {
          base: negativeOneDollar,
          expected: false,
        },
        'zero value': {
          base: zero,
          expected: true,
        },
      },
      'isNegative': {
        'positive value': {
          base: oneDollar,
          expected: false,
        },
        'negative value': {
          base: negativeOneDollar,
          expected: true,
        },
        'zero value': {
          base: zero,
          expected: false,
        },
      },
    };

    Object.keys(tests).forEach(operation => {
      describe(`.${operation}`, () => {
        const cases = tests[operation];
        const keys = Object.keys(cases);
        keys.forEach(name => {
          const { base, value, expected } = cases[name];
          it(`should return ${expected} for ${name}`, () => {
            expect(base[operation](value)).toEqual(expected);
          });
        });
        // Do these cases have values?
        const { base, value } = cases[keys[0]];
        if (value) {
          it('should throw with undefined', () => {
            expect(() => base[operation]()).toThrow();
          });
        }
      });
    });
  });

  section('other operations', () => {
    describe('.allocate', () => {
      const tests = {
        'distribute remainder to the first bucket': {
          base: centUno,
          args: [ 50, 50 ],
          expected: [ 51, 50 ],
        },
        'distribute remainder across early buckets': {
          base: trentaDue,
          args: [ 1, 1, 1],
          expected: [ 101, 101, 100 ],
        },
        'allocate with ratios': {
          base: oneDollar,
          args: [ 1, 1 ],
          expected: [ 50, 50 ],
        },
        'not put remainder in zero buckets': {
          base: centUno,
          args: [ 0, 1, 1 ],
          expected: [ 0, 51, 50 ],
        },
        'throw with all zero buckets': {
          base: centUno,
          args: [ 0, 0, 0 ],
        },
        'throw with a negative bucket': {
          base: centUno,
          args: [ 1, -1, 1 ],
        },
        'throw with an empty array of buckets': {
          base: centUno,
          args: [],
        },
        'throw with undefined': {
          base: centUno,
        },
      };
      Object.keys(tests).forEach(name => {
        const { base, args, expected } = tests[name];
        it(`should ${name}`, () => {
          if (!expected) {
            expect(() => base.allocate(args)).toThrow();
          } else {
            expect(base.allocate(args).map(a => a.getAmount())).toEqual(expected);
          }
        });
      });
    });

    describe('.normalize', () => {
      it('should normalize converting precisions and amounts', () => {
        const normalized = oneDollar.normalize(onePreciseDollar);
        expect(normalized.length).toEqual(2);
        normalized.forEach(soldi => {
          expect(soldi.getAmount()).toEqual(10000);
          expect(soldi.getPrecision()).toEqual(highPrecision);
        });
      });
    });

    describe('.convertPrecision', () => {
      it('should convert precision up and adjust amount', () => {
        expect(oneDollar.convertPrecision(highPrecision).toObject()).toMatchObject(
          onePreciseDollar.toObject()
        );
      });
      it('should convert precision down and adjust amount', () => {
        expect(onePreciseDollar.convertPrecision(2).toObject()).toMatchObject(
          oneDollar.toObject()
        );
      });
      it('should convert precision down and round amount', () => {
        expect(twoFitty.convertPrecision(0).toObject()).toMatchObject(
          {
            currency,
            amount: 2,
          }
        );
      });
      it('should convert precision down and round amount respecting mode', () => {
        expect(twoFitty.convertPrecision(0, Soldi.ROUND.HALF_UP).toObject())
          .toMatchObject(
            {
              currency,
              amount: 3,
            }
          );
      });
    });

    describe('.exchange', () => {
      it('should throw when rates are undefined', () => {
        expect(() => oneDollar.exchange('EUR')).toThrow();
      });
      it('should throw when target rate is missing', () => {
        expect(() => oneDollar.exchange('EUR', {})).toThrow();
      });
      it('should throw when target rate is non-numeric', () => {
        expect(() => oneDollar.exchange('EUR', { EUR: 'EUR' })).toThrow();
      });
      it('should apply the supplied rate', () => {
        expect(oneDollar.exchange('EUR', { EUR: 2 }).toObject()).toMatchObject(
          {
            currency: 'EUR',
            amount: 200,
          }
        );
      });
      it('should apply the supplied rate and carry forward precision', () => {
        expect(onePreciseDollar.exchange('EUR', { EUR: 2 }).toObject()).toMatchObject(
          {
            currency: 'EUR',
            amount: 20000,
            precision: 4,
          }
        );
      });
    });
  });

  section('introspection', () => {
    const tests = {
      'toUnit': {
        'no precision': {
          base: oneDollar,
          expected: 1
        },
        'given percision': {
          base: onePreciseDollar,
          expected: 1
        },
      },
      'hasSubUnits': {
        'tree fitty': {
          base: treeFitty,
          expected: true,
        },
        'fitty cent': {
          base: fittyCent,
          expected: true,
        },
        'one precise dolla': {
          base: onePreciseDollar,
          expected: false,
        },
        'one dolla': {
          base: oneDollar,
          expected: false,
        },
      },
      'toRoundedUnit': {
        'half even down': {
          base: fittyCent,
          args: [0, Soldi.ROUND.HALF_EVEN],
          expected: 0,
        },
        'half odd': {
          base: fittyCent,
          args: [0, Soldi.ROUND.HALF_ODD],
          expected: 1,
        },
        'half odd down': {
          base: fourtyCents,
          args: [0, Soldi.ROUND.HALF_ODD],
          expected: 0,
        },
        'half up up': {
          base: fittyCent,
          args: [0, Soldi.ROUND.HALF_UP],
          expected: 1,
        },
        'half up down': {
          base: fourtyCents,
          args: [0, Soldi.ROUND.HALF_UP],
          expected: 0,
        },
        'half down of fitty cent': {
          base: fittyCent,
          args: [0, Soldi.ROUND.HALF_DOWN],
          expected: 0,
        },
        'half down of fourty cent': {
          base: fourtyCents,
          args: [0, Soldi.ROUND.HALF_DOWN],
          expected: 0,
        },
        'half towards zero of fitty cent': {
          base: fittyCent,
          args: [0, Soldi.ROUND.HALF_TOWARDS_ZERO],
          expected: 0,
        },
        'half towards zero of negative fitty cent': {
          base: iouFittyCent,
          args: [0, Soldi.ROUND.HALF_TOWARDS_ZERO],
          expected: -0,
        },
        'half away from zero of fitty cent': {
          base: fittyCent,
          args: [0, Soldi.ROUND.HALF_AWAY_FROM_ZERO],
          expected: 1,
        },
        'half away from zero of fourty cent': {
          base: fourtyCents,
          args: [0, Soldi.ROUND.HALF_AWAY_FROM_ZERO],
          expected: 0,
        },
        'down of fitty cent': {
          base: fittyCent,
          args: [0, Soldi.ROUND.DOWN],
          expected: 0,
        },
        'half away from zero of negative fitty cent': {
          base: iouFittyCent,
          args: [0, Soldi.ROUND.HALF_AWAY_FROM_ZERO],
          expected: -1,
        },
        'half even of tree fitty': {
          base: treeFitty,
          args: [0, Soldi.ROUND.HALF_EVEN],
          expected: 4,
        },
        'half odd of tree fitty': {
          base: treeFitty,
          args: [0, Soldi.ROUND.HALF_ODD],
          expected: 3,
        },
        'half odd of two fitty': {
          base: twoFitty,
          args: [0, Soldi.ROUND.HALF_ODD],
          expected: 3,
        },
        'half odd of two fourty': {
          base: twoFourty,
          args: [0, Soldi.ROUND.HALF_ODD],
          expected: 2,
        },
        'half towards zero of two fourty': {
          base: twoFourty,
          args: [0, Soldi.ROUND.HALF_TOWARDS_ZERO],
          expected: 2,
        },
      },
      'toObject': {
        'with default precision': {
          base: oneDollar,
          expected: {
            amount: 100,
            currency: 'USD'
          },
        },
        'with high precision': {
          base: onePreciseDollar,
          expected: {
            amount: 10000,
            precision: 4,
            currency: 'USD'
          },
        },
      },
      'toJSON': {
        'with default precision': {
          base: oneDollar,
          expected: {
            amount: 100,
            currency: 'USD'
          },
        },
        'with high precision': {
          base: onePreciseDollar,
          expected: {
            amount: 10000,
            precision: 4,
            currency: 'USD'
          },
        },
      },
    };
    Object.keys(tests).forEach(operation => {
      describe(`.${operation}`, () => {
        const cases = tests[operation];
        Object.keys(cases).forEach(name => {
          const { base, args = [], expected } = cases[name];
          it(`should return ${JSON.stringify(expected)} for ${base} with ${name}`, () => {
            expect(base[operation](...args)).toEqual(expected);
          });
        });
      });
    });
  });

  section('getters', () => {
    const instance = Soldi({ amount: 100, currency: 'USD', precision: 5 });

    it('should have .amount', () => {
      expect(instance.amount).toEqual(instance.getAmount());
    });

    it('should have .currency', () => {
      expect(instance.currency).toEqual(instance.getCurrency());
    });

    it('should have .precision', () => {
      expect(instance.precision).toEqual(instance.getPrecision());
    });
  });

  section('static operations', () => {
    it('should have the correct class name', () => {
      expect(Soldi.class.name).toEqual('Soldi');
    });

    it('should have the correct ROUND modes', () => {
      expect(Soldi.ROUND).toMatchObject(
        {
          HALF_EVEN: 'HALF_EVEN',
          HALF_ODD: 'HALF_ODD',
          HALF_UP: 'HALF_UP',
          HALF_DOWN: 'HALF_DOWN',
          HALF_TOWARDS_ZERO: 'HALF_TOWARDS_ZERO',
          HALF_AWAY_FROM_ZERO: 'HALF_AWAY_FROM_ZERO',
          DOWN: 'DOWN'
        }
      );
    });

    const tests = {
      'minimum': {
        'one value': {
          value: [ oneDollar ],
          expected: oneDollar,
        },
        'all the same': {
          value: [ oneDollar, oneDollar ],
          expected: oneDollar,
        },
        'one zero first': {
          value: [ zero, oneDollar ],
          expected: zero,
        },
        'one zero second': {
          value: [ oneDollar, zero ],
          expected: zero,
        },
        'one negative': {
          value: [ negativeOneDollar, oneDollar ],
          expected: negativeOneDollar,
        },
        'three values': {
          value: [ negativeOneDollar, zero, oneDollar ],
          expected: negativeOneDollar,
        },
      },
      'maximum': {
        'all the same': {
          value: [ oneDollar, oneDollar ],
          expected: oneDollar,
        },
        'one zero first': {
          value: [ zero, oneDollar ],
          expected: oneDollar,
        },
        'one zero second': {
          value: [ oneDollar, zero ],
          expected: oneDollar,
        },
        'one negative': {
          value: [ negativeOneDollar, oneDollar ],
          expected: oneDollar,
        },
        'three values': {
          value: [ negativeOneDollar, zero, oneDollar ],
          expected: oneDollar,
        },
      },
    };
    const throws = {
      'no arguments': undefined,
      'non array': {},
      'zero length array': [],
    };
    Object.keys(tests).forEach(operation => {
      describe(`.${operation}`, () => {
        const cases = tests[operation];
        Object.keys(cases).forEach(name => {
          const { value, expected } = cases[name];
          it(`should return ${expected} with ${name}`, () => {
            const result = Soldi[operation](value);
            expect(result.isEqualTo(expected)).toBeTruthy();
          });
        });
        Object.keys(throws).forEach(name => {
          const value = throws[name];
          it('should throw with ${name}', () => {
            expect(() => Soldi[operation](value)).toThrow();
          });
        });
      });
    });

    // extend
    describe('.extend', () => {
      const options = { currency };

      it('should support extension with init', () => {
        const init = jest.fn((o) => o);
        const WithInit = Soldi.extend('WithInit', { init });
        const value = WithInit(options);
        expect(value).toMatchObject({
          currency,
          amount: 0,
        });
        expect(init).toHaveBeenCalledWith(options);
      });
      it('should default options to {} in sub create function', () => {
        const init = jest.fn((o) => o);
        const WithInit = Soldi.extend('WithInit', { init });
        expect(WithInit).toThrow();
        expect(init).toHaveBeenCalledWith({});
      });
      it('should support extension with constructor', () => {
        const constructor = jest.fn();
        const WithConstructor = Soldi.extend('WithConstructor', { constructor });
        const value = WithConstructor(options);
        expect(value).toMatchObject({
          currency,
          amount: 0,
        });
        expect(constructor).toHaveBeenCalledWith(options);
      });
      it('should pass init output to construtor', () => {
        const init = jest.fn((options) => Object.assign({}, options, { amount: 100 }));
        const constructor = jest.fn();
        const WithBoth = Soldi.extend('WithBoth', { init, constructor });
        const value = WithBoth(options);
        expect(value).toMatchObject({
          currency,
          amount: 100,
        });
        expect(init).toHaveBeenCalledWith(options);
        expect(constructor).toHaveBeenCalledWith(init(options));
      });
      it('should support extension with methods', () => {
        const method = jest.fn();
        const WithMethod = Soldi.extend('WithMethod', { method });
        const value = WithMethod(options);
        expect(value).toMatchObject({
          currency,
          amount: 0,
        });
        expect(value.method).toBeTruthy();
        value.method();
        expect(method).toHaveBeenCalled();
      });
      it('should support extension with no methods', () => {
        const WithNoMethods = Soldi.extend('WithNoMethods');
        const value = WithNoMethods(options);
        expect(value).toMatchObject({
          currency,
          amount: 0,
        });
        expect(value.method).toBeUndefined();
      });
      it('should support extending an extension', () => {
        const initOne = jest.fn(o => {
          return { one: true, ...o };
        });
        const constructorOne = jest.fn(function(o) {
          this.one = o.one;
          this.cOne = true;
        });
        const LevelOne = Soldi.extend('LevelOne', {
          init: initOne,
          constructor: constructorOne
        });

        const initTwo = jest.fn(o => {
          return { two: true, ...o };
        });
        const constructorTwo = jest.fn(function(o) {
          this.two = o.two;
          // Make sure constructorOne was called first
          expect(this.cOne).toBeTruthy();
          this.cTwo = true;
        });
        const LevelTwo = LevelOne.extend('LevelTwo', {
          init: initTwo,
          constructor: constructorTwo
        });

        const value = LevelTwo(options);
        // Make sure the calls cascaded
        expect(initOne).toHaveBeenCalledWith(options);
        const optionsOne = { one: true, ...options };
        expect(initTwo).toHaveBeenCalledWith(optionsOne);
        const optionsTwo = { two: true, ...optionsOne };
        expect(constructorOne).toHaveBeenCalledWith(optionsTwo);
        expect(constructorTwo).toHaveBeenCalledWith(optionsTwo);

        expect(value.toObject()).toMatchObject({
          currency,
          amount: 0,
          one: true,
          two: true,
        });

      });
      it('should support superCall from an extension', () => {
        const ForcePrecision = Soldi.extend('ForcePrecision', {
          toObject: function() {
            return Object.assign(this.superCall('toObject'), {
              precision: this.getPrecision(),
            });
          },
        });
        const value = ForcePrecision(options);
        expect(value.toObject()).toMatchObject({
          currency,
          amount: 0,
          precision: 2,
        });
      });
      it('should throw with superCall from non-extended method', () => {
        const InvalidSuperCall = Soldi.extend('InvalidSupercall', {
          noSuper: function() {
            return Object.assign(this.superCall('noSuper'), {
              precision: this.getPrecision(),
            });
          },
        });
        const value = InvalidSuperCall(options);
        expect(() => value.noSuper()).toThrow('Attempt to superCall noSuper but missing in prototype chain');
      });
      it('should support superCall through two levels of extension', () => {
        const ForcePrecision = Soldi.extend('ForcePrecision', {
          toObject: function() {
            const ret = Object.assign(this.superCall('toObject'), {
              precision: this.getPrecision(),
            });
            return ret;
          },
        });
        const ForceLocale = ForcePrecision.extend('ForceLocale', {
          toObject: function() {
            const ret = Object.assign(this.superCall('toObject'), {
              locale: 'en-us',
            });
            return ret;
          },
        });
        const value = ForceLocale(options);
        const ret = value.toObject();
        expect(ret).toMatchObject({
          currency,
          amount: 0,
          precision: 2,
          locale: 'en-us',
        });
      });
      it('should support superCall that calls override', () => {
        const SuperCall = Soldi.extend('SuperCall', {
          percentage: function(percent) {
            return this.superCall('percentage', percent);
          },
          toObject: function() {
            return Object.assign(this.superCall('toObject'), {
              precision: this.getPrecision(),
            });
          },
        });
        const value = SuperCall({ currency, amount: 200 });
        expect(value.percentage(50).getAmount()).toEqual(100);
      });
      it.skip('should support overriding calculator', () => {
        expect(true).toEqual(false);
      });
      it('should support extensions which add properties', () => {
        const constructor = jest.fn(function() {
          this.extra = true;
        });
        const ExtraProperty = Soldi.extend('ExtraProperty', {
          constructor,
        });
        let value = ExtraProperty(options);
        expect(value.toObject()).toMatchObject({
          currency,
          amount: 0,
          extra: true,
        });
        // Make sure we keep the property when we do some operations
        const tests = {
          add: value,
          subtract: value,
          multiply: 2,
          divide: 2,
        };
        Object.keys(tests).forEach(operation => {
          const arg = tests[operation];
          const derived = value[operation](arg);
          expect(derived.toObject()).toMatchObject({
            extra: true,
          });
        });
      });
      it('should keep ROUND, minimum, and maximum visible on an extension', () => {
        const WithNoMethods = Soldi.extend('WithNoMethods');
        expect(WithNoMethods.ROUND).toEqual(Soldi.ROUND);
        expect(WithNoMethods.minimum).toEqual(Soldi.minimum);
        expect(WithNoMethods.maximum).toEqual(Soldi.maximum);
      });
      it('should keep a custom static on a subclass', () => {
        const WithStatic = Soldi.extend('WithStatic');
        WithStatic.STATIC = true;
        const WithSubStatic = WithStatic.extend('WithSubStatic');
        expect(WithSubStatic.STATIC).toBeTruthy();
      });
      it('should wrap the subclass name', () => {
        const CheckName = Soldi.extend('CheckName');
        expect(CheckName.class.name).toBe('CheckName(Soldi)');
      });
      it.skip('should allow static extensions', () => {
        expect(true).toEqual(false);
      });
      it('should respect extensions to getters', () => {
        const CustomPrecision = Soldi.extend('CustomPrecision', {
          getPrecision: function() {
            return 2 * this.superCall('getPrecision');
          }
        });
        const custom = CustomPrecision({ currency, precision: 5 });
        expect(custom.getPrecision()).toEqual(10);
        expect(custom.precision).toEqual(10);
      });
    });
  });

  section('globals', () => {
    const WithGlobals = Soldi.extend('WithGlobals', {
      globals: {
        'globalVariable': 'default',
      },
    });
    it('should not define a method called globals', () => {
      expect(WithGlobals.globals).toBeUndefined();
    });
    it('should allow addition of globals in an extension', () => {
      expect(WithGlobals.globalVariable).toEqual('default');
    });
    it('should allow setting a known global value', () => {
      WithGlobals.globalVariable = 'true';
      expect(WithGlobals.globalVariable).toEqual('true');
    });
    it('should allow setting a known global value to the default', () => {
      WithGlobals.globalVariable = 'default';
      expect(WithGlobals.globalVariable).toEqual('default');
    });
    it('should make the global visible to further extensions', () => {
      const CanSeeGlobal = Soldi.extend('CanSeeGlobal');
      CanSeeGlobal.globalVariable = 'cansee';
      expect(CanSeeGlobal.globalVariable).toEqual('cansee');
      expect(WithGlobals.globalVariable).toEqual('cansee');
    });
    it('should log a warning when shadowing a global and return shadowed default', () => {
      jest.spyOn(global.console, 'warn');
      global.console.warn.mockImplementation(() => {});
      const BaseGlobal = Soldi.extend('BaseGlobal', {
        globals: {
          baseGlobal: 'base',
        }
      });
      const ShadowGlobal = BaseGlobal.extend('ShadowGlobal', {
        getGlobal: function() {
          return ShadowGlobal.baseGlobal;
        },
        globals: {
          baseGlobal: 'shadow',
        }
      });
      expect(global.console.warn).toHaveBeenCalledWith(
        'Existing global baseGlobal with default: \'base\' shadowed by ShadowGlobal with default: \'shadow\''
      );
      const value = ShadowGlobal({ currency });
      expect(value.getGlobal()).toEqual('shadow');
    });
  });

});
