# Security Policy

## Reporting a vulnerability

If you believe you have found a security vulnerability in `vue3-msal-plugin`, please report it privately:

- Email: **dulanhewage2@hotmail.com** with the subject line starting `[security]`.
- Do **not** open a public GitHub issue for security-related reports.

Please include as much of the following as possible in your report:

- A description of the issue and its potential impact.
- Steps to reproduce, or a minimal proof of concept.
- Affected versions (check `npm view vue3-msal-plugin version`).
- Any mitigations you have already considered.

You should receive an acknowledgment within **72 hours**. If you have not heard back within that window, please send a follow-up email referencing the original.

## Coordination and disclosure

We follow coordinated disclosure:

1. The maintainer confirms the report and triages its severity.
2. A fix is prepared on a private branch and verified against the regression suite.
3. A patch release is published to npm.
4. The public advisory is published on the relevant GitHub Security Advisory entry and the release notes after the fix is generally available.

Please do not publicly disclose the vulnerability until a fix has been released.

## Supported versions

Only the latest stable release line of `vue3-msal-plugin` receives security fixes.

| Version | Supported |
|---------|-----------|
| Latest release on npm | ✅ |
| Prior minor releases | ❌ |

Projects pinned to older versions should upgrade to the latest release to receive security fixes.

## Out of scope

- Security issues in upstream dependencies (`@azure/msal-browser`, `vue`). Report those directly to the upstream project.
- Vulnerabilities that require already-compromised developer credentials or compromised package registry infrastructure (those are npm's responsibility).
- Issues in the sample apps (`samples/sample-with-pinia`, `samples/sample-with-quasar`) that do not also affect the published library package.