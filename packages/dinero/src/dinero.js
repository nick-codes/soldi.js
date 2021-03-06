import Soldi, { assert, _isDefined, _hasKey } from '@soldi/core/index.mjs';
import withLocale from '@soldi/locale/index.mjs';
import withFormatDinero from '@soldi/format-dinero/index.mjs';

import { getPath, mergeTags, getJSON } from './helpers.js';

// This is a Dinero v1 compatibility layer over Soldi
const Dinero = withFormatDinero(withLocale(Soldi)).extend('Dinero', {
  init: function(options) {
    // Dinero has a global default currency
    if (!_hasKey(options, 'currency')) {
      options.currency = Dinero.globalDefaultCurrency;
    }
    return options;
  },
  globals: {
    'globalDefaultCurrency': 'USD',
    'globalExchangeRatesApi': {
      propertyPath: 'rates.{{to}}',
    },
  },
  // Solid uses more fluent names for these so just adapt them
  equalsTo: function(that) {
    return this.isEqualTo(that);
  },
  hasSameCurrency: function(that) {
    return this.hasSameCurrencyAs(that);
  },
  hasSameAmount: function(that) {
    return this.hasSameAmountAs(that);
  },
  greaterThan: function(that) {
    return this.isGreaterThan(that);
  },
  greaterThanOrEqual: function(that) {
    return this.isGreaterThanOrEqualTo(that);
  },
  lessThan: function(that) {
    return this.isLessThan(that);
  },
  lessThanOrEqual: function(that) {
    return this.isLessThanOrEqualTo(that);
  },
  // Support this deprecated method.
  hasCents: function() {
    return this.hasSubUnits();
  },
  // The API for this function is problematic so it isn't offered
  // in Soldi. You can use Soldi.exchange to get the important part
  // of doing an exchange without having to call an endpoint on
  // every request. We suggest migrating to that function
  // and managing exchanges outside the library instead of using
  // this convert API. It is easier to manage caching behavior
  // and access credentials that way.
  convert: function(currency, options) {
    const from = this.getCurrency();
    const to = currency;
    // Exchange to the same currency is always 1 so skip the hard work
    if (from !== to) {
      options = Object.assign({}, Dinero.globalExchangeRatesApi, options);
      let promise;
      // Is it thenable?
      if (_isDefined(options.endpoint) &&
          _isDefined(options.endpoint.then)) {
        promise = options.endpoint;
      } else {
        promise = getJSON(options);
      }
      return promise.then(data =>
        getPath(data, mergeTags(options.propertyPath, { from, to }))
      ).then(exchange =>
        this.exchange(currency, { [currency]: exchange })
      );
    } else {
      return Promise.resolve(this);
    }
  },
  percentage: function(percentage) {
    // Dinero does this additional check that doesn't make a lot of sense to me
    // but the tests check for it so for the highest level of campatibility
    // we add it here.
    assert(percentage <= 100, 'Percentage must be less than or equal to 100');
    return this.superCall('percentage', percentage);
  },
  toObject: function() {
    // Dinero always includes precision, but soldi leaves it
    // implicit to the currency when possible so we add it here.
    return Object.assign(this.superCall('toObject'), {
      precision: this.getPrecision(),
    });
  },
});

// Dinero has this extra function which doesn't seem useful to me
// outside of internal implementation but it is tested as part of
// the external API so we add it here.
Dinero.normalizePrecision = function(amounts) {
  assert.defined('normalizePrecision amounts', amounts);
  assert(amounts.length > 1, 'You must pass at least 2 amounts to normalizePrecision');

  let maxPrecision = Number.MIN_VALUE;
  amounts.forEach(amount => {
    const precision = amount.getPrecision();
    if (precision > maxPrecision) {
      maxPrecision = precision;
    }
  });
  return amounts.map(function(s) {
    if (s.getPrecision() !== maxPrecision) {
      return s.convertPrecision(maxPrecision);
    }
    return s;
  });
};

export default Dinero;
