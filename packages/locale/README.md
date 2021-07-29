# @soldi/format-dinero

This package offers an extension to Soldi which adds the ability
to add a `locale` to a Dinero instance using setLocale() and introspect
that using getLocale().

This is one aspect of the Dinero v1 API we feel was not well thought
out, and so we are offering it as an extension over `@soldi/core` for
users who's code relies on it, but hope most projects do not
need this functionality.

It works in conjunction with the `@soldi/format-dinero` API to provide
backwards compatibility on top of Soldi for Dinero v1 users who need
this functionality.

For documentation on the getLocale() and setLocale() functions please
see the [documentation for Dinero
v1](https://dinerojs.com/module-dinero).
