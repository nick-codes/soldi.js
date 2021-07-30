# Why Soldi?

Soldi was written with the goal of providing a Dinero v1 compatible
API, with better extensibility properties.

After examining the available currency management libraries for
JavaScript Dinero v1 was selected specifically for it's chainable.
The maintainer of Dinero v1 made it clear that [she is not interested
in maintaining Dinero
v1](https://github.com/dinerojs/dinero.js/pulls?q=is%3Apr+author%3Anickpalmer),
and has put all her effort on her new v2 API.

While her efforts on Dinero v1 are admirable and appreciated,
maintaining existing APIs also has value for users of those
APIs. Offers of assistance in maintain Dinero v1 where not accepted,
and reasonable PRs not accepted or commented on for almost a year, and
then closed when the v2 API was released, instead of merging them into the
v1 API, and making more v1 releases in parallel with the v2 API.

Too often with subsequent systems, designers choose to throw away
their first implementation entirely, while not offering a good
migration path to the new system. This often ignores the negative
impact on users of the first system, who are then forced to either do
an expensive rewrite of their software, stick with an unmaintained
system, or take on maintenance themselves via a fork. ([See
loopback v3 to loopback
v4](https://loopback.io/doc/en/lb4/migration-overview.html) for another
example of a migration path requiring an extensive rewrite of existing
software.)

The Dinero v2 API is dramatically different from the Dinero v1 API and
would thus require extensive rewriting of existing software which uses
the Dinero v1 API.

While it is true that the Dinero v1 API has some issues, in particular
the use of globals with potential side effects, a problematic convert
API, and storage of locale information on instances, most of the API
is well designed, and our personal usage of Dinero has avoided these
problematic features.

It is then primarily the lack of extensibility at the implementation
level that is the largest flaw. This is fortunately an implementation
detail, and not the result of larger API design flaws.  `@soldi/core`
moves the problematic features of the Dinero v1 API into extensions,
leaving a more pure core, that retains the chainable, immutible design
of Dinero v1.

The Dinero v1 extensibility issues are almost entirely due to avoiding
the use of JavaScript's prototype mechanism. This makes extensions
nearly impossible to undertake, and unnecessarily bloats memory and
CPU usage, all in the name of encapsulation. While a hard fork of
Dinero v1 was considered, given the extensibility issues in the
existing implementation, it was decided that a re-implementation
patterned after the Dinero v1 API, but which takes advantages of
JavaScript prototypes was a more maintainable path for the future.

The benefits of the v2 API, (side effect free, use of typescript,
ability to tree shake the implementation, etc) are only valuable if
adoption of Dinero spreads to many libraries. This is doubtful, and
even then the problems of the v1 API are likely very manageable for
real world systems taking advantage of Dinero. Thus the benefits of
switching to the v2 API were judged to be insufficient to support the
high cost of doing a migration, especially since our code doesn't make
use of those features, and we can thus drop them from `@soldi/core`.

As such, Soldi offers a migration path for Dinero v1 users that don't
want to, or cannot rewrite all their software using the new Dinero v2
API, while also making it more easily extended, and maintained.

The extensibility of the Soldi design makes it simple to "fork" Soldi,
using a public or private extension, without forcing developers using
Soldi to maintain the entirety of the core system, which will likely
have little need to change in the future. We consider `@soldi/core` to
be essentially feature complete at this point, and additional features
the community desires can be easily layered on top of it to add
any additional functionality that might be desired.
