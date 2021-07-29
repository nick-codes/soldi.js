# @soldi/core

Soldi is a simple currency manipulation library for safely calculating
with monetary values in JavaScript.

## Benefits of Soldi

- Fluent, immutable, and chainable API
- Easily extensible, with several extensions already written
- Overflow detection
- Currency exchange features
- Formatting Options via Extensions
- 100% test coverage
- Enthusiastic maintainer open to community contributions

## Installation

For new users we recommend using `@soldi/core` directly.

`npm install @soldi/core`

or

`yarn add @soldi/core`

## Usage

Soldi makes it easy to create and calculate using monetary values.

Amounts are specified in minor currency units (e.g.: "cents" for the
dollar). You must also specify a currency. We suggest using [ISO
4217](https://en.wikipedia.org/wiki/ISO_4217) currency codes, but you
are free to use anything you want.

For example to construct €1:

```
let oneEuro = Soldi({ amount: 100, currency: 'EUR' });
```

You can add and subtract amounts provided they have the same currency:

```
// returns a Soldi object with amount: 600 and currency 'EUR'
oneEuro.add(Soldi({ amount: 500, currency: 'EUR' }));
```

```
// returns a Soldi object with amount: 4500 and currency 'EUR'
price.subtract(Soldi({ amount: 500, currency: 'EUR' }));
```

Soldi is immutable, which means you always receive a new Soldi
instance when you perform any operation on it. The original instance
is unmodified by any operation.

All transformative operations return a Soldi instance, so you can
chain methods to perform a series of operations.

```
// Calculates ( 50 + 50 ) * 4 => 400
// not: 50 + 50 * 4 => 250
// as would be expected using normal operator precedence
Soldi({ amount: 50, currency: 'EUR' })
  .add(Soldi({ amount: 50, currency: 'EUR' }))
  .multiply(4);
```

Operations are executed in the chained order, so operator precedence
is as written in the chain, not as it would be for an equivalently
expressed mathematical expression.

You can also introspect your Soldi instance in various ways:

```
// returns true
Soldi({ amount: 500, currency }).isEqualTo(Soldi({ amount: 500, currency }));

// returns false
Soldi({ amount: 100, currency }).isZero();

// returns true
Soldi({ amount: 50, currency }).hasSubUnits();
```

Soldi can also be constructed with a precision, which tells Soldi how
many sub-units the currency supports, or to support more sub-units
than is common for the currency. For example if you wanted to create a
system capable of accounting hundredths of a cent, you could use a
higher precision soldi to do the calculations.

```
const onePreciseEuro = Soldi({ amount: 10000, precision: 4, currency });
```

Soldi also handles mixing precisions, and promotes lower precision numbers
to the highest precision amongst the Soldi in the operations.

```
// Returns Soldi { amount: 20000, precision: 4, currency: 'EUR' };
onePreciseEuro.add({ amount: 100, currency });
```

For most currencies, Soldi will infer the default precision for that
currency, if it is known, and will not include precision in the
`toObject()` version of the Soldi to save storage space if it matches
what Soldi would infer from the currency.

Finally, Soldi is easily extensible to offer additional features.  See
the source code for:
[`@soldi/locale`](https://github.com/nick-codes/soldi.js/blob/main/packages/locale/src/locale.js)
or
[`@soldi/dinero`](https://github.com/nick-codes/soldi.js/blob/main/packages/dinero/src/dinero.js)
for examples of how to extend Soldi with additional features. If your
extension would be of bennefit to others, consider opening a PR to add
your extension to @soldi directly.