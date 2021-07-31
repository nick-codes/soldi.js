// Soldi.js A simple currency library for Javascript designed to
// be mostly compatible with Dinero.js v1

import { _hasKey, _isDefined } from './util.js';
import assert from './assert.js';
import { calculator } from './calc.js';

// Base Soldi type
function Soldi(options) {
  return new soldi(options);
}

// Give easy access to rounding modes the calculator supports
Soldi.ROUND = calculator.ROUND;

// Give us a place to manage global state Soldi can handle
const _globals = {
  defaults: {},
  values: {},
};

function _doCombine(operation, a, b) {
  // Do we need to normalize?
  if (!a.hasSamePrecisionAs(b)) {
    const [ aNormal, bNormal ] = a.normalize(b);
    return aNormal.inherit({
      amount: a.getCalculator()[operation](aNormal.getAmount(), bNormal.getAmount()),
    });
  }

  return a.inherit({
    amount: a.getCalculator()[operation](a.getAmount(), b.getAmount()),
  });
}

function _doMath(operation, a, factor, roundingMode) {
  return a.inherit({
    amount: a.getCalculator().round(
      a.getCalculator()[operation](
        a.getAmount(), factor
      ),
      roundingMode,
    ),
  });
}

// Use symbols to hide variable storage
const PRECISION = Symbol('precision');
const AMOUNT = Symbol('amount');
const CURRENCY = Symbol('currency');

class soldi extends Object {
  constructor(options = {}) {
    super();

    // Setup currency so we can check precision inference
    assert.validCurrency(options.currency);
    this[CURRENCY] = options.currency;

    // Did they give us a precision
    if (_hasKey(options, 'precision')) {
      assert.integer(options.precision);

      // Is it not the default for the currency?
      if(options.precision !== this.getPrecision()) {
        this[PRECISION] = options.precision;
      }
    }

    // Are we constructing with unit
    if (_hasKey(options, 'unit')) {
      // Not rounding here so users get an error if the unit
      // has more precision than what they expected
      this[AMOUNT] = options.unit * Math.pow(10, this.getPrecision());
    } else {
      this[AMOUNT] = options.amount || options[AMOUNT] || 0;
    }
    assert.integer(this[AMOUNT]);
  }

  static get name() { return 'Soldi'; }

  get precision() {
    return this.getPrecision();
  }

  get amount() {
    return this.getAmount();
  }

  get currency() {
    return this.getCurrency();
  }

  getCalculator() {
    return calculator;
  }

  getPrecision() {
    // Are we working in a strange precision for the currency?
    if (_hasKey(this, PRECISION)) {
      return this[PRECISION];
    }

    // Okay, then lookup the precision based on the currency name
    switch (this.getCurrency()) {
    case 'BHD':
    case 'IQD':
    case 'JOD':
      return 3;
    case 'BIF':
    case 'BYR':
    case 'CLP':
    case 'DJF':
    case 'GNF':
    case 'GWP':
    case 'JPY':
    case 'MGA':
    case 'PYG':
    case 'RWF':
    case 'VND':
    case 'VUV':
    case 'XOF':
    case 'XPF':
      return 0;
    default:
      return 2;
    }
  }

  inherit(options) {
    return this.create(Object.assign(this.toObject(), options));
  }

  toString() {
    return JSON.stringify(this);
  }

  getAmount() {
    return this[AMOUNT];
  }

  getCurrency() {
    return this[CURRENCY];
  }

  add(that) {
    assert.sameCurrency(this, that);
    assert(!this.getCalculator().additionOverflows(this.getAmount(), that.getAmount()),
      `Adding ${this} and ${that} would cause an overflow`);

    return _doCombine('add', this, that);
  }

  subtract(that) {
    assert.sameCurrency(this, that);
    assert(!this.getCalculator().subtractionOverflows(this.getAmount(), that.getAmount()),
      `Subtracting ${this.getAmount()} and ${that.getAmount()} would cause an overflow`);

    return _doCombine('subtract', this, that);
  }

  multiply(multiplier, roundingMode) {
    assert(!this.getCalculator().multiplicationOverflows(this.getAmount(), multiplier),
      `Multiplying ${this.getAmount()} by ${multiplier} would cause an overflow`);

    return _doMath('multiply', this, multiplier, roundingMode);
  }

  divide(divisor, roundingMode) {
    assert(!this.getCalculator().divisionOverflows(this.getAmount(), divisor),
      `Dividing ${this.getAmount()} by ${divisor} would cause an overflow`);

    return _doMath('divide', this, divisor, roundingMode);
  }

  percentage(percent) {
    assert.percent(percent);

    const inDecimal = calculator.divide(percent, 100);
    return this.multiply(inDecimal);
  }

  allocate(buckets) {
    assert.validAllocation(buckets);

    // Figure out the sum of all buckets to calculate shares
    const total = buckets.reduce((a, b) => {
      assert(!this.getCalculator().additionOverflows(a, b),
        'The allocation buckets overflow,');

      return this.getCalculator().add(a, b);
    });
    let remainder = this.getAmount();

    // Figure out how much goes in each bucket
    const shares = buckets.map(bucket => {
      const share = this.getCalculator().floor(
        this.getCalculator().divide(
          this.getCalculator().multiply(this.getAmount(), bucket),
          total,
        )
      );
      remainder = this.getCalculator().subtract(remainder, share);
      return share;
    });

    // Allocate any remainder into the non-zero buckets
    for(let i = 0; remainder > 0; i += 1) {
      if (buckets[i] > 0) {
        shares[i] = this.getCalculator().add(shares[i], 1);
        remainder = this.getCalculator().subtract(remainder, 1);
      }
    }

    // Convert the shares back into Soldi
    return shares.map(amount => this.inherit({ amount }));
  }

  exchange(currency, rates, roundingMode) {
    assert.defined('exchange rates', rates);
    assert.numeric(rates[currency]);

    return this.inherit({
      amount: calculator.round(
        calculator.multiply(this.getAmount(), rates[currency]),
        roundingMode,
      ),
      currency
    });
  }

  hasSameCurrencyAs(that) {
    assert.defined('hasSameCurrencyAs argument', that);
    return this.getCurrency() == that.getCurrency();
  }

  hasSamePrecisionAs(that) {
    assert.defined('hasSamePrecisionAs argument', that);
    return this.getPrecision() == that.getPrecision();
  }

  convertPrecision(precision, roundingMode) {
    assert.integer(precision);
    const amount = this.getCalculator().round(
      this.getCalculator().multiply(
        this.getAmount(),
        Math.pow(10, this.getCalculator().subtract(precision, this.getPrecision()))
      ),
      roundingMode,
    );
    return this.inherit({
      amount,
      precision,
    });
  }

  normalize(b, roundingMode) {
    assert.defined('normalize argument', b);

    const maxPrecision = Math.max(this.getPrecision(), b.getPrecision());
    return [this, b].map(function(s) {
      if (s.getPrecision() !== maxPrecision) {
        return s.convertPrecision(maxPrecision, roundingMode);
      }
      return s;
    });
  }

  hasSameAmountAs(that) {
    assert.defined('hasSameAmountAs argument', that);

    // Do we need to normalize?
    if (!this.hasSamePrecisionAs(that)) {
      const [ thisNormal, thatNormal ] = this.normalize(that);
      return thisNormal.amount == thatNormal.amount;
    }
    return this.amount == that.amount;
  }

  isEqualTo(that) {
    assert.defined('isEqualTo argument', that);

    return this.hasSameCurrencyAs(that) && this.hasSameAmountAs(that);
  }

  isLessThan(that) {
    assert.defined('isLessThan argument', that);
    assert.sameCurrency(this, that);

    // Do we need to normalize?
    if (!this.hasSamePrecisionAs(that)) {
      const [ thisNormal, thatNormal ] = this.normalize(that);
      return thisNormal.amount < thatNormal.amount;
    }
    return this.amount < that.amount;
  }

  isLessThanOrEqualTo(that) {
    assert.defined('isLessThanOrEqualTo argument', that);
    assert.sameCurrency(this, that);

    // Do we need to normalize?
    if (!this.hasSamePrecisionAs(that)) {
      const [ thisNormal, thatNormal ] = this.normalize(that);
      return thisNormal.amount <= thatNormal.amount;
    }
    return this.amount <= that.amount;
  }

  isGreaterThan(that) {
    assert.defined('isGreaterThan argument', that);
    assert.sameCurrency(this, that);

    // Do we need to normalize?
    if (!this.hasSamePrecisionAs(that)) {
      const [ thisNormal, thatNormal ] = this.normalize(that);
      return thisNormal.amount > thatNormal.amount;
    }
    return this.amount > that.amount;
  }

  isGreaterThanOrEqualTo(that) {
    assert.defined('isGreaterThanOrEqualTo argument', that);
    assert.sameCurrency(this, that);

    // Do we need to normalize?
    if (!this.hasSamePrecisionAs(that)) {
      const [ thisNormal, thatNormal ] = this.normalize(that);
      return thisNormal.amount >= thatNormal.amount;
    }
    return this.amount >= that.amount;
  }

  isZero() {
    return this.amount == 0;
  }

  isGreaterThanZero() {
    return this.amount > 0;
  }

  isPositive() {
    return this.amount >= 0;
  }

  isNegative() {
    return this.amount < 0;
  }

  hasSubUnits() {
    return this.getCalculator().modulo(
      this.getAmount(),
      Math.pow(10, this.getPrecision())) !== 0;
  }

  toUnit() {
    return this.getCalculator().divide(
      this.getAmount(),
      Math.pow(10, this.getPrecision()));
  }

  toRoundedUnit(digits, roundingMode) {
    const factor = Math.pow(10, digits);
    return calculator.divide(
      calculator.round(
        calculator.multiply(this.toUnit(), factor),
        roundingMode,
      ),
      factor
    );
  }

  toObject() {
    const ret = Object.assign({}, this);
    // We need to convert any Symbols to the tag for the symbol
    Object.getOwnPropertySymbols(this).forEach(k => {
      ret[k.toString().replace('Symbol(','').replace(')','')] = ret[k];
      delete ret[k];
    });
    // We don't expose keys that start with underscore
    // since these are considered "private". This
    // also hides the implementation details of
    // superCall which uses an object key to walk
    // up the call chain.
    Object.keys(ret).forEach(k => {
      if (k[0] == '_') {
        delete ret[k];
      }
    });
    return ret;
  }

  toJSON() {
    return this.toObject();
  }
}

// Allow override of the internal constructor in the prototype chain
soldi.prototype.create = Soldi;

Soldi.class = soldi;

// Make it easy to extend Soldi
Soldi.extend = function(name, methods) {
  const subConstructor = _hasKey(methods, 'constructor') ? methods.constructor : () => {};
  const subInit = _hasKey(methods, 'init') ? methods.init : (options) => options;
  const baseClass = this.class;

  // Build the internal subclass
  const extended = class extends baseClass {
    constructor(options) {
      super(options);
      subConstructor.call(this, options);
    }
    static get name() { return `${name}(${baseClass.name})`; }
  };

  // Add the superCall to be able to call methods
  // on the super class when needed
  extended.prototype.superCall = function(method, ...args) {
    let base;
    if (_hasKey(this, '_soldi_super') && _hasKey(this._soldi_super, method)) {
      base = this._soldi_super[method];
    } else {
      base = Object.getPrototypeOf(Object.getPrototypeOf(this));
    }

    // Get the base method so we don't re-call it
    let baseMethod = this[method];

    // Walk up the chain until we find the method
    let descriptor = undefined;
    while(_isDefined(base) && (!_isDefined(descriptor) || descriptor.value === baseMethod)) {
      descriptor = Object.getOwnPropertyDescriptor(base, method);
      base = Object.getPrototypeOf(base);
    }
    // Did we find the method?
    if (_isDefined(descriptor)) {
      // Record what level we need to start at in the chain in
      // case the middle level calls superCall as well
      if (!_hasKey(this, '_soldi_super')) {
        this._soldi_super = {};
      }
      this._soldi_super[method] = base;

      // Call the actual method at the super level
      const output = descriptor.value.apply(this, args);

      // Delete the chain up records not needed anymore
      // since we are now unwinding the chain
      if (_isDefined(this._soldi_super)) {
        delete this._soldi_super[method];
        if (Object.keys(this._soldi_super).length === 0) {
          delete this._soldi_super;
        }
      }

      // Return what we got from the super level
      return output;
    } else {
      throw new Error(`Attempt to superCall ${method} but missing in prototype chain`);
    }
  };

  // Add any methods needed for the extension
  if (methods) {
    Object.keys(methods).forEach(method => {
      if (!['init', 'constructor', 'globals'].includes(method)) {
        extended.prototype[method] = methods[method];
      }
    });
  }

  // Build the base function
  const base = function(options = {}) {
    const baseInit = baseClass.init ? baseClass.init : o => o;
    return new extended(subInit(baseInit(options)));
  };

  if (_hasKey(methods, 'globals')) {
    // Check for a conflict with any globals from another extension
    Object.keys(methods.globals).forEach(k => {
      if (_hasKey(_globals.defaults, k)) {
        console.warn(`Existing global ${k} with default: '${_globals.defaults[k]}' shadowed by ${name} with default: '${methods.globals[k]}'`);
      }
    });
    // And add the defaults to the globals we know about
    Object.assign(_globals.defaults, methods.globals);
  }

  // Add a setter for all globals at the new level
  Object.keys(_globals.defaults).forEach(k => {
    Object.defineProperty(base, k, {
      get: function() {
        return _globals.values[k] || _globals.defaults[k];
      },
      set: function(value) {
        if (value == _globals.defaults[k]) {
          delete _globals.values[k];
        } else {
          _globals.values[k] = value;
        }
      },
    });
  });

  // Copy over any static methods on the base
  Object.assign(base, this);

  // Tell the extension how to create
  extended.prototype.create = base;

  // Tell the base what class to use for extensions
  base.class = extended;
  base.class.init = subInit;
  // Override ROUND in case they extended getCalculator()
  base.ROUND = extended.prototype.getCalculator().ROUND;

  return base;
};

// Static helper functions

Soldi.minimum = function(soldi) {
  assert.positiveLengthArray('Soldi.minimum', soldi);

  const [ first, ...rest ] = soldi;
  let minimum = first;
  rest.forEach(function(s) {
    if (s.isLessThan(minimum)) {
      minimum = s;
    }
  });
  return minimum;
};

Soldi.maximum = function(soldi) {
  assert.positiveLengthArray('Soldi.maximum', soldi);

  const [ first, ...rest ] = soldi;
  let maximum = first;
  rest.forEach(function(s) {
    if (s.isGreaterThan(maximum)) {
      maximum = s;
    }
  });
  return maximum;
};

export default Soldi;