// Soldi.js A simple currency library for Javascript designed to
// be mostly compatible with Dinero.js v1

import { _hasKey } from './util.js';
import assert from './assert.js';
import { calculator } from './calc.js';

// Base Soldi type
function Soldi(options) {
  return new soldi(options);
}

// Give easy access to rounding modes the calculator supports
Soldi.ROUND = calculator.ROUND;

class soldi {
  constructor(options = {}) {
    // Setup currency so we can check precision inference
    assert.validCurrency(options.currency);
    this.currency = options.currency;

    // Did they give us a precision
    if (_hasKey(options, 'precision')) {
      assert.integer(options.precision);

      // Is it not the default for the currency?
      if(options.precision !== this.getPrecision()) {
        this.precision = options.precision;
      }
    }

    // Are we constructing with unit
    if (_hasKey(options, 'unit')) {
      // Not rounding here so users get an error if the unit
      // has more precision than what they expected
      this.amount = options.unit * Math.pow(10, this.getPrecision());
    } else {
      this.amount = options.amount || 0;
    }
    assert.integer(this.amount);
  }
  static get name() { return 'Soldi'; }
}

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
    return baseClass.prototype[method].call(this, ...args);
  };

  // Add any methods needed for the extension
  if (methods) {
    Object.keys(methods).forEach(method => {
      if (!['init', 'constructor'].includes(method)) {
        extended.prototype[method] = methods[method];
      }
    });
  }

  // Build the base function
  const base = function(options = {}) {
    const baseInit = baseClass.init ? baseClass.init : o => o;
    return new extended(subInit(baseInit(options)));
  };

  // Copy over any static methods on the base
  Object.assign(base, this);

  // Tell the extension how to create
  extended.prototype.create = base;

  // Tell the base what class to use for extensions
  base.class = extended;
  base.class.init = subInit;
  // Override ROUND in case they extended getCalculator()
  base.ROUND = extended.prototype.getCalculator().ROUND;
  // And store the super class for callSuper functionality
  extended.prototype.super = baseClass;

  return base;
};

soldi.prototype.getCalculator = function() {
  return calculator;
};

soldi.prototype.getPrecision = function() {
  // Are we working in a strange precision for the currency?
  if (_hasKey(this, 'precision')) {
    return this.precision;
  }

  // Okay, then lookup the precision based on the currency name
  switch (this.currency) {
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
};


// Allow override of the internal constructor in the prototype chain
soldi.prototype.create = Soldi;

soldi.prototype.inherit = function(options) {
  return this.create(Object.assign(this.toObject(), options));
};

soldi.prototype.toString = function() {
  return JSON.stringify(this);
};

soldi.prototype.getAmount = function() {
  return this.amount;
};

soldi.prototype.getCurrency = function() {
  return this.currency;
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

soldi.prototype.add = function(that) {
  assert.sameCurrency(this, that);
  assert(!this.getCalculator().additionOverflows(this.getAmount(), that.getAmount()),
    `Adding ${this} and ${that} would cause an overflow`);

  return _doCombine('add', this, that);
};

soldi.prototype.subtract = function(that) {
  assert.sameCurrency(this, that);
  assert(!this.getCalculator().subtractionOverflows(this.getAmount(), that.getAmount()),
    `Subtracting ${this.getAmount()} and ${that.getAmount()} would cause an overflow`);

  return _doCombine('subtract', this, that);
};

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

soldi.prototype.multiply = function(multiplier, roundingMode) {
  assert(!this.getCalculator().multiplicationOverflows(this.getAmount(), multiplier),
    `Multiplying ${this.getAmount()} by ${multiplier} would cause an overflow`);

  return _doMath('multiply', this, multiplier, roundingMode);
};

soldi.prototype.divide = function(divisor, roundingMode) {
  assert(!this.getCalculator().divisionOverflows(this.getAmount(), divisor),
    `Dividing ${this.getAmount()} by ${divisor} would cause an overflow`);

  return _doMath('divide', this, divisor, roundingMode);
};

soldi.prototype.percentage = function(percent) {
  assert.percent(percent);

  const inDecimal = calculator.divide(percent, 100);
  return this.multiply(inDecimal);
};

soldi.prototype.allocate = function(buckets) {
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
};

soldi.prototype.exchange = function(currency, rates, roundingMode) {
  assert.defined('exchange rates', rates);
  assert.numeric(rates[currency]);

  return this.inherit({
    amount: calculator.round(
      calculator.multiply(this.getAmount(), rates[currency]),
      roundingMode,
    ),
    currency
  });
};

soldi.prototype.hasSameCurrencyAs = function(that) {
  assert.defined('hasSameCurrencyAs argument', that);
  return this.getCurrency() == that.getCurrency();
};

soldi.prototype.hasSamePrecisionAs = function(that) {
  assert.defined('hasSamePrecisionAs argument', that);
  return this.getPrecision() == that.getPrecision();
};

soldi.prototype.convertPrecision = function(precision, roundingMode) {
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
};

soldi.prototype.normalize = function(b, roundingMode) {
  assert.defined('normalize argument', b);

  const maxPrecision = Math.max(this.getPrecision(), b.getPrecision());
  return [this, b].map(function(s) {
    if (s.getPrecision() !== maxPrecision) {
      return s.convertPrecision(maxPrecision, roundingMode);
    }
    return s;
  });
};

soldi.prototype.hasSameAmountAs = function(that) {
  assert.defined('hasSameAmountAs argument', that);

  // Do we need to normalize?
  if (!this.hasSamePrecisionAs(that)) {
    const [ thisNormal, thatNormal ] = this.normalize(that);
    return thisNormal.amount == thatNormal.amount;
  }
  return this.amount == that.amount;
};

soldi.prototype.isEqualTo = function(that) {
  assert.defined('isEqualTo argument', that);

  return this.hasSameCurrencyAs(that) && this.hasSameAmountAs(that);
};

soldi.prototype.isLessThan = function(that) {
  assert.defined('isLessThan argument', that);
  assert.sameCurrency(this, that);

  // Do we need to normalize?
  if (!this.hasSamePrecisionAs(that)) {
    const [ thisNormal, thatNormal ] = this.normalize(that);
    return thisNormal.amount < thatNormal.amount;
  }
  return this.amount < that.amount;
};

soldi.prototype.isLessThanOrEqualTo = function(that) {
  assert.defined('isLessThanOrEqualTo argument', that);
  assert.sameCurrency(this, that);

  // Do we need to normalize?
  if (!this.hasSamePrecisionAs(that)) {
    const [ thisNormal, thatNormal ] = this.normalize(that);
    return thisNormal.amount <= thatNormal.amount;
  }
  return this.amount <= that.amount;
};

soldi.prototype.isGreaterThan = function(that) {
  assert.defined('isGreaterThan argument', that);
  assert.sameCurrency(this, that);

  // Do we need to normalize?
  if (!this.hasSamePrecisionAs(that)) {
    const [ thisNormal, thatNormal ] = this.normalize(that);
    return thisNormal.amount > thatNormal.amount;
  }
  return this.amount > that.amount;
};

soldi.prototype.isGreaterThanOrEqualTo = function(that) {
  assert.defined('isGreaterThanOrEqualTo argument', that);
  assert.sameCurrency(this, that);

  // Do we need to normalize?
  if (!this.hasSamePrecisionAs(that)) {
    const [ thisNormal, thatNormal ] = this.normalize(that);
    return thisNormal.amount >= thatNormal.amount;
  }
  return this.amount >= that.amount;
};

soldi.prototype.isZero = function() {
  return this.amount == 0;
};

soldi.prototype.isGreaterThanZero = function() {
  return this.amount > 0;
};

soldi.prototype.isPositive = function() {
  return this.amount >= 0;
};

soldi.prototype.isNegative = function() {
  return this.amount < 0;
};

soldi.prototype.hasSubUnits = function() {
  return this.getCalculator().modulo(
    this.getAmount(),
    Math.pow(10, this.getPrecision())) !== 0;
};

soldi.prototype.toUnit = function() {
  return this.getCalculator().divide(
    this.getAmount(),
    Math.pow(10, this.getPrecision()));
};

soldi.prototype.toRoundedUnit = function(digits, roundingMode) {
  const factor = Math.pow(10, digits);
  return calculator.divide(
    calculator.round(
      calculator.multiply(this.toUnit(), factor),
      roundingMode,
    ),
    factor
  );
};

soldi.prototype.toObject = function() {
  return Object.assign({}, this);
};

soldi.prototype.toJSON = function() {
  return this.toObject();
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