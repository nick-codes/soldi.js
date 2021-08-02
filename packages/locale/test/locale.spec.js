import Soldi from '@soldi/core/index.mjs';
import withLocale from '../index.mjs';

describe('withLocale', () => {
  const WithLocale = withLocale(Soldi);

  it('should throw with undefined base', () => {
    expect(() => withLocale()).toThrow();
  });
  it('should make instances with getLocale and setLocale', () => {
    const instance = WithLocale({ currency: 'USD' });
    expect(instance).toBeTruthy();
    expect(instance.getLocale).toBeTruthy();
    expect(instance.setLocale).toBeTruthy();
  });
  describe('#locale', () => {
    test('should return the right locale as a string', () => {
      expect(
        WithLocale({ currency: 'USD', locale: 'fr-FR' }).locale
      ).toBe('fr-FR');
    });
  });
  describe('#getLocale', () => {
    test('should return the right locale as a string', () => {
      expect(
        WithLocale({ currency: 'USD' })
          .setLocale('fr-FR')
          .getLocale()
      ).toBe('fr-FR');
    });
    test('should return the default locale as a string when no locale is specified', () => {
      expect(WithLocale({ currency: 'USD' }).getLocale()).toBe('en-US');
    });
    test('should return the globally set locale as a string when no locale is specified', () => {
      WithLocale.globalLocale = 'en-GB';
      expect(WithLocale({ currency: 'USD' }).getLocale()).toBe('en-GB');
      WithLocale.globalLocale = 'en-US';
    });
    test('should return the initial locale when global locale is redefined', () => {
      const price = WithLocale({ currency: 'USD' });
      WithLocale.globalLocale = 'fr-FR';
      expect(price.getLocale()).toBe('en-US');
      WithLocale.globalLocale = 'en-US';
    });
  });
  describe('#setLocale', () => {
    test('should return a new WithLocale object with the right locale as a string', () => {
      expect(
        WithLocale({ currency: 'USD' })
          .setLocale('de-DE')
          .getLocale()
      ).toBe('de-DE');
    });
    test('should return a new WithLocale object with the right locale as a string even if a locale was set globally', () => {
      WithLocale.globalLocale = 'fr-FR';
      expect(
        WithLocale({ currency: 'USD' })
          .setLocale('ja-JP')
          .getLocale()
      ).toBe('ja-JP');
      WithLocale.globalLocale = 'en-US';
    });
    test('should carry over the locale when chaining methods', () => {
      expect(
        WithLocale({ currency: 'USD' })
          .setLocale('ja-JP')
          .multiply(4)
          .getLocale()
      ).toBe('ja-JP');
    });
  });
});