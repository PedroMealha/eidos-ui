# Security Policy

## Supported versions

Only the most recently published version of `eidos-ui` receives security fixes. There are no
long-term support branches.

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes       |
| < 1.0   | No        |

## Reporting a vulnerability

Please report security issues privately through GitHub's
[private vulnerability reporting](https://github.com/PedroMealha/eidos-ui/security/advisories/new)
rather than opening a public issue.

Expect an acknowledgement within a few days. If the report is valid, the fix ships as a patch
release and you'll be credited in the advisory unless you'd rather not be.

## Scope

`eidos-ui` is a client-side React component library: it ships no server code, makes no network
requests, and reads no credentials. The realistic issue classes are therefore:

- cross-site scripting via a prop that reaches markup without escaping
- a dependency advisory reaching consumers through the published bundle - `lucide-react` is the only
  runtime dependency
- Content Security Policy problems; see `src/ContentSecurityPolicy.mdx` for the library's CSP
  posture and its audited inline-style surface

Storybook, the `dev/` example app, and anything else outside the published `dist/` are
development-only and out of scope.
