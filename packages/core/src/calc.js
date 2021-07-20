import assert from './assert.js';
import { _hasKey, _isHalf, _isEven } from './util.js';

export const ROUND = {
  HALF_EVEN(number) {
    const rounded = Math.round(number);
    return _isHalf(number)
      ? _isEven(rounded)
        ? rounded
        : rounded - 1
      : rounded;
  },
  HALF_ODD(number) {
    const rounded = Math.round(number);
    return _isHalf(number)
      ? _isEven(rounded)
        ? rounded - 1
        : rounded
      : rounded;
  },
  HALF_UP(number) {
    return Math.round(number);
  },
  HALF_DOWN(number) {
    return _isHalf(number) ? Math.floor(number) : Math.round(number);
  },
  HALF_TOWARDS_ZERO(number) {
    return _isHalf(number)
      ? Math.sign(number) * Math.floor(Math.abs(number))
      : Math.round(number);
  },
  HALF_AWAY_FROM_ZERO(number) {
    return _isHalf(number)
      ? Math.sign(number) * Math.ceil(Math.abs(number))
      : Math.round(number);
  },
  DOWN(number) {
    return Math.floor(number);
  }
};

export const calculator = {
  ROUND: Object.keys(ROUND).reduce((ret, k) => {
    ret[k] = k;
    return ret;
  }, {}),
  modulo: function(a, b) {
    return a % b;
  },
  divide: function(a, b) {
    return a / b;
  },
  multiply: function(a, b) {
    return a * b;
  },
  add: function(a, b) {
    return a + b;
  },
  floor: function(a) {
    return Math.floor(a);
  },
  additionOverflows(a, b) {
    const c = a+b;
    return a !== c-b || b !== c-a;
  },
  subtractionOverflows(a, b) {
    const c = a-b;
    return a !== c+b || -b !== c-a;
  },
  multiplicationOverflows(a, b) {
    if (a == 0 || b == 0) {
      return false;
    }
    const absA = Math.abs(a);
    const absB = Math.abs(b);
    return Number.MAX_VALUE / absA < absB || Number.MAX_VALUE / absB < absA;
  },
  divisionOverflows(a, b) {
    if (b == 0) {
      return true;
    }
    if (a == 0) {
      return false;
    }
    const c = a / b;
    return !Number.isFinite(c);
  },
  subtract: function(a, b) {
    return a - b;
  },
  round: function(a, roundingMode = 'HALF_EVEN') {
    assert(_hasKey(ROUND, roundingMode), `Unknown Rounding Mode: ${roundingMode}`);

    return ROUND[roundingMode](a);
  },
};
