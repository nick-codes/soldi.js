import { _isDefined } from './util.js';

export function assert(condition, errorMessage) {
  if (!condition) throw new Error(errorMessage);
}

assert.validAllocation = function(a) {
  assert(Array.isArray(a), 'Allocate requires an array to allocate');
  assert(a.length > 0, 'Allocate requires at least one bucket');
  assert(a.some(a => a > 0), 'Allocate requires at least one non-zero bucket');
  assert(a.every(a => a >= 0), 'Allocate requires all allocations to be positive');
};

assert.positiveLengthArray = function(name, a) {
  assert.defined(a, `${name} requires an array but received undefined`);
  assert(Array.isArray(a), `${name} requires an array but received ${typeof a}`);
  assert(a.length > 0, `${name} requires a positive length array`);
};

assert.defined = function(name, a) {
  assert(_isDefined(a), `${name} cannot be undefined`);
};

assert.validCurrency = function(a) {
  assert.defined('currency', a);
};

assert.integer = function(a) {
  assert(Number.isInteger(a), `Expected an integer but got: ${a}`);
};

assert.numeric = function(a) {
  assert(Number.isFinite(a), `Expected a number but got: ${a}`);
};

assert.sameCurrency = function(a, b) {
  assert(a.hasSameCurrencyAs(b), `Mismatched Currencies: ${a.currency} !== ${b.currency}`);
};

assert.percent = function(percent) {
  assert.numeric(percent);
  assert(percent > 0, `percentage must be greater than zero but received: ${percent}`);
};

export default assert;