# Soldi

Soldi is a simple currency manipulation library for safely calculating
with monetary values in JavaScript.

## Benefits of Soldi

- Fluent, immutable, and chainable API
- Easily extensible, with several extensions already written
- Overflow detection
- Dinero v1 compatibility with a smaller bundle size
- Currency exchange features
- Formatting Options via Extensions
- 100% test coverage
- Enthusiastic maintainer open to community contributions

## About Soldi

`@soldi/core` is a re-implementation of the core ideas in the [Dinero
v1](https://github.com/dinerojs/dinero.js/tree/v1) API design, but
written with extensibility in mind.

For new users, it offers a fluent, chainable, simple API, with
easy extensibility on which to build currency manipulating software.

For Dinero v1 users, Soldi offers a compatibility layer
`@soldi/dinero` to make migration from Dinero v1 to Soldi as simple as
changing the import. As evidence of Soldi's extensibility, the Dinero v1
compatibility layer is written as a number of extension layers on top
of Soldi.

Extensions are easy to write and test separate from Soldi, making
the system flexible and easy to extend and maintain.

For more on the rational behind writing Solid in the first place,
please read our
[RATIONAL.md](https://github.com/nick-codes/soldi.js/tree/main/RATIONAL.md).

## Installation

For new users we recommend using `@soldi/core` directly.

`npm install @soldi/core`

or

`yarn add @soldi/core`

For existing Dinero v1 users, you can easily migrate to Soldi by
installing the Dinero v1 compatibility layer and changing imports.

`npm install @soldi/dinero`

or

`yarn add @soldi/dinero`

Soldi is shipped as a native ESM module, but also bundles a UMD
compatible bundle in `dist`. We welcome PRs offering additional
bundle options if the community has need of those.

## Usage

See the [@soldi/core README.md](https://github.com/nick-codes/soldi.js/tree/main/packages/core) for
an explanation of the usage of `@soldi/core`.

See the [@soldi/dinero README.md](https://github.com/nick-codes/soldi.js/tree/main/packages/dinero) for
an explanation of the usage of `@soldi/dinero`.

## Contributing

Soldi welcomes contributions in all forms. Please fork and open a PR
with bug fixes, improvements to documentation, additional tests, or
new extensions. We especially welcome feedback from Dinero v1 users
who are migrating to Soldi to know if there are any differences in
behavior that are not covered with the current suite of unit tests.

## To-Dos

In no particular order:

- CI setup
- codemod to make migration to `@soldi/dinero` easy
- codemod to make migration from `@soldi/dinero` to `@soldi/core` easy
- `format-intl` package to use `Intl` instead of `Number.toLocaleFormat`
- `calculate-bigint` package to use BigInt for manipulating values
  larger than 2^53
- Extensions with popular crypto currency precisions
- API documentation
- website
