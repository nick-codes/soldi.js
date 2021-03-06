// This file is directly copied from Dinero v1
// and is thus licensed under the LICENSE.md
// in this directory. Only the Dinero import has
// been updated to import our dinero compatibility
// layer
import Dinero from '../../index.mjs';
import jsc from 'jsverify';

describe('Dinero', () => {
  describe('#add', () => {
    test('should be commutative', () => {
      jsc.assert(
        jsc.forall(
          jsc.record({ amount: jsc.integer }),
          jsc.record({ amount: jsc.integer }),
          (a, b) =>
            Dinero(a)
              .add(Dinero(b))
              .getAmount() ===
            Dinero(b)
              .add(Dinero(a))
              .getAmount()
        )
      );
    });
    test('should be associative', () => {
      jsc.assert(
        jsc.forall(
          jsc.record({ amount: jsc.integer }),
          jsc.record({ amount: jsc.integer }),
          jsc.record({ amount: jsc.integer }),
          (a, b, c) =>
            Dinero(a)
              .add(Dinero(b))
              .add(Dinero(c))
              .getAmount() ===
            Dinero(b)
              .add(Dinero(a).add(Dinero(c)))
              .getAmount()
        )
      );
    });
    test('should be distributive with integers', () => {
      jsc.assert(
        jsc.forall(
          jsc.integer,
          jsc.record({ amount: jsc.integer }),
          jsc.record({ amount: jsc.integer }),
          (a, b, c) =>
            Dinero(b)
              .add(Dinero(c))
              .multiply(a)
              .getAmount() ===
            Dinero(b)
              .multiply(a)
              .add(Dinero(c).multiply(a))
              .getAmount()
        )
      );
    });
  });
  describe('#multiply', () => {
    test('should be commutative', () => {
      jsc.assert(
        jsc.forall(
          jsc.integer,
          jsc.integer,
          (a, b) =>
            Dinero({ amount: a })
              .multiply(b)
              .getAmount() ===
            Dinero({ amount: b })
              .multiply(a)
              .getAmount()
        )
      );
    });
    test('should be associative', () => {
      jsc.assert(
        jsc.forall(
          jsc.integer,
          jsc.integer,
          jsc.integer,
          (a, b, c) =>
            Dinero({ amount: a })
              .multiply(b)
              .multiply(c)
              .getAmount() ===
            Dinero({ amount: b })
              .multiply(
                Dinero({ amount: a })
                  .multiply(c)
                  .getAmount()
              )
              .getAmount()
        )
      );
    });
    test('should be distributive with integers', () => {
      jsc.assert(
        jsc.forall(
          jsc.integer,
          jsc.record({ amount: jsc.integer }),
          jsc.record({ amount: jsc.integer }),
          (a, b, c) =>
            Dinero(b)
              .add(Dinero(c))
              .multiply(a)
              .getAmount() ===
            Dinero(b)
              .multiply(a)
              .add(Dinero(c).multiply(a))
              .getAmount()
        )
      );
    });
    test('should round when multiplier is a non-integer', () => {
      jsc.assert(
        jsc.forall(
          jsc.nat,
          jsc.number(-1e10, 1e10),
          (a, b) =>
            Dinero({ amount: a })
              .multiply(b)
              .getAmount() -
              a * b <
            0.5
        )
      );
    });
  });
  describe('#divide', () => {
    test('should round when divisor is a positive non-integer', () => {
      jsc.assert(
        jsc.forall(
          jsc.nat,
          jsc.number(1, 1e10),
          (a, b) =>
            Dinero({ amount: a })
              .divide(b)
              .getAmount() -
              a / b <
            0.5
        )
      );
    });
    test('should round when divisor is a negative non-integer', () => {
      jsc.assert(
        jsc.forall(
          jsc.nat,
          jsc.number(-1e10, -1e-10),
          (a, b) =>
            Dinero({ amount: a })
              .divide(b)
              .getAmount() -
              a / b <
            0.5
        )
      );
    });
  });
});
