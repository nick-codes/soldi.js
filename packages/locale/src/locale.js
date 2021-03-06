import { assert, _hasKey, _isDefined } from '@soldi/core/index.mjs';

// Use Symbol to hide variable storage
const LOCALE = Symbol('locale');

const withLocale = (base) => {
  assert.validBase('withLocale', base);

  const WithLocale = base.extend('WithLocale', {
    constructor: function(options) {
      // Did they give us a locale?
      if (_hasKey(options, 'locale')) {
        assert.defined('options.locale', options.locale);
        this[LOCALE] = options.locale;
      } else {
        // Dinero implementation is a little weird with respect to the
        // behavior around the default for this global
        if (_isDefined(WithLocale.globalLocale) && WithLocale.globalLocale !== 'en-US') {
          this[LOCALE] = WithLocale.globalLocale;
        }
      }
    },
    getLocale: function() {
      return this[LOCALE] || 'en-US';
    },
    setLocale: function(locale) {
      return this.inherit({ locale });
    },
    properties: {
      locale: 'getLocale'
    },
    globals: {
      'globalLocale': undefined,
    }
  });
  return WithLocale;
};

export default withLocale;
