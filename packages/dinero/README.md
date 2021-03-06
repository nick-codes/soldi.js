# @soldi/dinero

This is a compatibility layer on top of `@soldi/core` which offers a
[Dinero v1](https://github.com/dinerojs/dinero.js/tree/v1) compatible
API.

[![codecov](https://codecov.io/gh/nick-codes/soldi.js/branch/main/graph/badge.svg?token=tCJwUHxIhU)](https://codecov.io/gh/nick-codes/soldi.js) ![quality](https://github.com/nick-codes/soldi.js/actions/workflows/quality.yml/badge.svg) ![dependencies](https://david-dm.org/nick-codes/soldi.js.svg) ![npm (scoped)](https://img.shields.io/npm/v/@soldi/dinero?color=brightgreen) ![GitHub](https://img.shields.io/github/license/nick-codes/soldi.js) ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@soldi/dinero) ![Snyk Vulnerabilities for npm scoped package](https://img.shields.io/snyk/vulnerabilities/npm/@soldi/dinero)

## Installation

If you are an existing Dinero v1 user you can easily switch to Soldi:

`npm uninstall dinero.js && npm install @soldi/dinero`

or

`yarn remove dinero.js && yarn add @soldi/dinero`

Then change your imports/require to use `@soldi/dinero`.

```
// Old: const Dinero = require('dinero.js');
const Dinero = require('@soldi/dinero');
```

or

```
// Old: import Dinero from 'dinero.js';
import Dinero from '@soldi/dinero';
```

If you have switched to native ESM now supported by node and most
browsers, you can import `@soldi/dinero/index.mjs` directly as a
module using the index.mjs at the root.

```
// Old: import Dinero from 'dinero.js';
import Dinero from '@soldi/dinero/index.mjs';
```

## Usage

`@soldi/dinero` offers an identical API to Dinero v1 API.

As such all of the [documentation for Dinero
v1](https://dinerojs.com/module-dinero) can be used with
`@soldi/dinero`.