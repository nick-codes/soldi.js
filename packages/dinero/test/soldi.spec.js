// Some tests to push coverage up on our compatibity layer
import Dinero from '../index.mjs';
import { getJSON } from '../src/helpers.js';

describe('Dinero', () => {
  // Dinero supports a default currency so no options
  // construction should not throw like Soldi does.
  it('should handle no options construction', () => {
    expect(Dinero()).toBeTruthy();
  });

  // We shortcut convert to the same currency so we need this to get
  // coverage over that shortcut
  it('should return the same object when converting to same currency', async () => {
    const original = Dinero();
    expect(await original.convert(original.getCurrency())).toBe(original);
  });

  describe('#normalizePrecision', () => {
    // Dinero tests don't order the normalization in reverse order
    // so we need this to cover that code properly

    it('should handle normalization in reverse order', () => {
      const normalized = Dinero.normalizePrecision([
        Dinero({ amount: 1000, precision: 3 }),
        Dinero({ amount: 100, precision: 2 }),
      ]);
      expect(normalized[1].getAmount() && normalized[1].getAmount()).toBe(1000);
      expect(normalized[1].getPrecision() && normalized[1].getPrecision()).toBe(3);
    });
  });

  // Dinero tests don't actually check the getJSON implementation so
  // we need this to get coverage over that
  describe('getJSON', () => {
    const mock = function() {};
    Object.assign(mock, {
      action: 'load',

      status: 200,
      responseText: '{"response": true}',
      statusText: 'error',
      headers: {},

      listeners: {},
      open: function(method, endpoint) {
        this.method = method;
        this.endpoint = endpoint;
      },
      addEventListener: function(method, fn) {
        this.listeners[method] = fn;
      },
      setRequestHeader: function(header, value) {
        this.headers[header] = value;
      },
      send: function() {
        this.listeners[this.action]();
      },
    });

    global.XMLHttpRequest = function() { return mock; };

    it('should call the endpoint', async () => {
      const data = await getJSON('USD', 'EUR', {
        endpoint: '{{from}}=>{{to}}',
        headers: 'headers',
      });
      expect(data).toMatchObject({ response: true });
      expect(mock.endpoint).toEqual('USD=>EUR');
    });

    it('should not blow up with no endpoint', async () => {
      const data = await getJSON('USD', 'EUR', {
        headers: 'headers',
      });
      expect(data).toMatchObject({ response: true });
      expect(mock.endpoint).toEqual('');
    });

    it('should reject on abort', async () => {
      mock.action = 'abort';
      await getJSON('USD', 'EUR', {
        endpoint: '{{from}}=>{{to}}',
        headers: 'headers',
      }).then(() => {
        expect(false).toBeTruthy();
      }).catch(err => {
        expect(err).toBeTruthy();
      });
    });

    it('should reject on error', async () => {
      mock.action = 'error';
      await getJSON('USD', 'EUR', {
        endpoint: '{{from}}=>{{to}}',
        headers: 'headers',
      }).then(() => {
        expect(false).toBeTruthy();
      }).catch(err => {
        expect(err).toBeTruthy();
      });
    });

  });
});