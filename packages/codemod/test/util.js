import jscodeshift from 'jscodeshift';

// simulate the jscodeshift api
function api() {
  return {
    jscodeshift,
    j: jscodeshift,
  };
}

function runPlugin(plugin, source) {
  return plugin({ source, path: 'test.js' }, api());
}

function wrapPlugin(plugin) {
  return (source) => runPlugin(plugin, source);
}

export default function expectTransformation(plugin, source, expectedOutput, warnings = [], errors = []) {
  // Manual mocks for console.warn and console.error
  const originalWarn = console.warn;
  const originalError = console.error;

  const consoleWarnings = [];
  const consoleErrors = [];
  console.warn = (v) => consoleWarnings.push(v);
  console.error = (v) => consoleErrors.push(v);

  try {
    const wrappedPlugin = wrapPlugin(plugin);
    const result = wrappedPlugin(source);

    expect(result).toBe(expectedOutput);

    expect(consoleWarnings).toEqual(warnings);
    expect(consoleWarnings).toEqual(errors);
  } finally {
    console.warn = originalWarn;
    console.error = originalError;
  }
}
