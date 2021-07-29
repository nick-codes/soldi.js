# Soldi

Soldi is a simple currency manipulation library for safely calculating
with monetary values in JavaScript.

## About Soldi

`@soldi/core` is a re-implementation of many of the ideas in the
[Dinero v1](https://github.com/dinerojs/dinero.js) API design, but
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

## Bennefits of Solid

- Fluent, immutable, and chainable API
- Easily extensible, with several extensions already written
- Dinero v1 compatibility with a smaller bundle size
- Currency exchange features
- Formatting Options via Extensions
- 100% test coverage
- Enthusiastic maintainer open to community contributions

## Installation

For new users we recommend using `@soldi/core` directly.

```npm install @soldi/core```

or

```yarn add @soldi/core``

For existing Dinero v1 users, you can easily migrate to Soldi by
installing the Dinero v1 compatibility layer and changing imports.

```npm install @soldi/dinero```

or

```yarn add @soldi/dinero``

Soldi is shipped as a native ESM module, but also bundles a UMD
compatible bundle in `dist`. We welcome PRs offering additional
bundle options if the community has need of those.

## Why Soldi

The maintainer of Dinero v1 made it clear that [she is not interested
in maintaining Dinero
v1](https://github.com/dinerojs/dinero.js/pulls?q=is%3Apr+author%3Anickpalmer). While
we appreciate her efforts on Dinero v1, maintaining existing APIs also
has value for users of that API. Offers of assistance in maintaing
Dinero v1 where sumarily ignored, and reasonable PRs not accepted for
a year.

Too often with subsequent systems, designers choose to throw away
their first implementation entirely, while not offering a good
migration path to the new system. This often ignores the negative
impact on users of the first system, forced to do an expensive rewrite
of their software, or stick with an unmaintained system, or take on
extensive maintainence themselves. ([See loopback v3 to loopback
v4](https://loopback.io/doc/en/lb4/migration-overview.html) for an
example of a migration path requring an extensive rewrite of existing
software.)

The Dinero v2 API is dramatically different from the Dinero v1 API and
would require extensive rewriting of existing software which uses the
Dinero v1 API.

Additionally, switching to working exclusively on the Dinero v2 API
while not maintaining the v1 API a full year before v2 is even
released implies that the Dinero v2 API may also be abandoned in the
future in favor of a new v3 API subjecting users to even more rewrites
in the future, making an extensive rewrite to the Dinero v2 API less
attractive.

While it is true that the Dinero v1 API has some issues, in particular
the use of globals with potential side effects, and a problematic
convert API, most of the API is reasonably well designed. It is the
lack of extensibility at the implementation level that is the largest
design flaw.

The Dinero v1 extensibility issues are almost entirely due to avoiding
use of Javascripts prototype mechanism. This makes extensions
impossible to undertake, and unnecessarily bloats memory and CPU usage
in the name of encapsulation, which has dubious value in most
systems. While a hard fork of Dinero v1 was considered, given the
extensibility issues in the implementation, it was decided that a
re-implementation following the Dinero v1 API was a more maintainable
path for the future.

The bennefits of the v2 API: side effect free, use of typescript,
ability to tree shake the implementation, etc, are only a problem if
addoption of Dinero spreads to many libraries, and even then are
likely very manageable for real world systems taking advantage of
Dinero. Thus the bennefits of switching to the v2 API were not judged
as sufficient to support the cost of doing the migration.

Soldi is a ground up rewrite undertake with the goal of providing a
Dinero v1 compatible API with better extensibility properties.

Soldi offers a migration path for Dinero v1 users that don't want to,
or cannot rewrite all their software using the new Dinero v2 API,
while also making it more easily extended, and simpler to "fork" using
a public or private extension, without needing to maintain the
entirety of the core system, which we anticipate will have little
need to change in the future.

## ToDos

In no particular order:

- CI setup
- codemod to make migration to `@soldi/dinero` easy
- codemod to make migration from `@soldi/dinero` to `@soldi/core` easy
- `format-intl` package to use `Intl` instead of `Number.toLocaleFormat`
- `calculate-bigint` package to use BigInt for manipulating values
  larger than 2^53
- API documentation
- website
