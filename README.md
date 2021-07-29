# Soldi

Soldi is a simple currency manipulation library for safely calculating
with monetary values in JavaScript.

## About Soldi

`@soldi/core` is a re-implementation of many of the ideas in the
[Dinero v1](https://github.com/dinerojs/dinero.js/tree/v1) API design, but
written with extensibility in mind.

For new users, it offers a fluent, chainable, simple API, with
extensibility.

For Dinero v1 users, Soldi offers a compatibility layer
`@soldi/dinero` to make migration from Dinero v1 to Soldi as simple as
changing the import. As evidence of Soldi's extensibility, the Dinero v1
compatibility layer is written as a number of extension layers on top
of Soldi.

Extensions are easy to write and test separate from Soldi, making
the system flexible and easy to maintain.

## Benefits of Soldi

- Fluent, immutable, and chainable API
- Easily extensible, with several extensions already written
- Overflow detection
- Dinero v1 compatibility with a smaller bundle size
- Currency exchange features
- Formatting Options via Extensions
- 100% test coverage
- Enthusiastic maintainer open to community contributions

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

## Why Soldi?

Soldi was written with the goal of providing a Dinero v1 compatible
API, with better extensibility properties.

The maintainer of Dinero v1 made it clear that [she is not interested
in maintaining Dinero
v1](https://github.com/dinerojs/dinero.js/pulls?q=is%3Apr+author%3Anickpalmer).
While her efforts on Dinero v1 are admirable and appreciated,
maintaining existing APIs also has value for users of those
APIs. Offers of assistance in maintain Dinero v1 where summarily
ignored, and reasonable PRs not accepted for almost a year, and then
closed when v2 API was released, instead of merging them into the v1
API.

Too often with subsequent systems, designers choose to throw away
their first implementation entirely, while not offering a good
migration path to the new system. This often ignores the negative
impact on users of the first system, who are then forced to either do
an expensive rewrite of their software, stick with an unmaintained
system, or take on extensive maintenance themselves via a fork. ([See
loopback v3 to loopback
v4](https://loopback.io/doc/en/lb4/migration-overview.html) for an
example of a migration path requiring an extensive rewrite of existing
software.)

The Dinero v2 API is dramatically different from the Dinero v1 API and
would thus require extensive rewriting of existing software which uses
the Dinero v1 API.

While it is true that the Dinero v1 API has some issues, in particular
the use of globals with potential side effects, a problematic convert
API, and storage of locale information on instances, most of the API
is well designed. It is the lack of extensibility at the
implementation level that is the largest flaw. This is fortunately an
implementation detail, and not the result of larger API design flaws.
`@soldi/core` moves the problematic features of the Dinero v1 API into
extensions.

The Dinero v1 extensibility issues are almost entirely due to avoiding
the use of JavaScript's prototype mechanism. This makes extensions
nearly impossible to undertake, and unnecessarily bloats memory and
CPU usage, all in the name of encapsulation. While a hard fork of
Dinero v1 was considered, given the extensibility issues in the
existing implementation, it was decided that a re-implementation
patterned after the Dinero v1 API was a more maintainable path for the
future.

The benefits of the v2 API, (side effect free, use of typescript,
ability to tree shake the implementation, etc) are only valuable if
adoption of Dinero spreads to many libraries. This is doubtful, and
even then the problems of the v1 API are likely very manageable for
real world systems taking advantage of Dinero. Thus the benefits of
switching to the v2 API were judged to be insufficient to support the
high cost of doing a migration.

As such, Soldi offers a migration path for Dinero v1 users that don't
want to, or cannot rewrite all their software using the new Dinero v2
API, while also making it more easily extended, and properly
maintained. This makes Soldi simpler to "fork" using a public or
private extension, without forcing developers using Soldi to maintain
the entirety of the core system, which will likely have little
need to change in the future.

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
