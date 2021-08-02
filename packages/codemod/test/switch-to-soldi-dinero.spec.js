import transform from '../transforms/switch-to-soldi-dinero.js';

import expectTransformation from './util.js';

describe('switch-to-soldi-dinero', () => {

  it('should transform dinero.js require statements', () => {
    const expectRequire = 'const Dinero = require("@soldi/dinero/index.mjs");';
    const requireStatement = 'const Dinero = require("dinero.js");';
    expectTransformation(transform, requireStatement, expectRequire);
  });

  it('should transform import statements', () => {
    const importStatement = 'import Dinero from "dinero.js";';
    const expectImport = 'import Dinero from "@soldi/dinero/index.mjs";';
    expectTransformation(transform, importStatement, expectImport);
  });

  it('should not transform non-dinero.js require statements', () => {
    const noTransformRequire = 'const Dinero = require("not-dinero.js");';
    expectTransformation(transform, noTransformRequire, noTransformRequire);
  });

  it('should not transform non-dinero.js import statements', () => {
    const noTransformImport = 'import Dinero from "not-dinero.js";';
    expectTransformation(transform, noTransformImport, noTransformImport);
  });

});