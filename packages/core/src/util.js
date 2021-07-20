// Some helper functions

export function _hasKey(o, k) {
  return _isDefined(o) && Object.hasOwnProperty.call(o, k);
}

export function _isDefined(a) {
  return typeof a != 'undefined';
}

export function _isEven(n) {
  return n % 2 === 0;
}

export function _isHalf(n) {
  return Math.abs(n) % 1 === 0.5;
}
