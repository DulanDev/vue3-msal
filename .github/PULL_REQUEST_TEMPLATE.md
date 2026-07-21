## Summary

<!-- Reference the issue this PR closes (e.g. "Closes #123"), plus a short summary of the change. -->

## Change type

- [ ] `fix` — non-breaking bug fix
- [ ] `feat` — non-breaking new feature
- [ ] `build` / `chore` / `docs` / `refactor` / `test` — non-user-facing
- [ ] `BREAKING CHANGE` — a breaking change to the public API; issue/discussion linked above

## Verification

- [ ] `npm run lint` is green
- [ ] `npm test` is green
- [ ] `npm run build` is green
- [ ] New behavior is covered by tests
- [ ] `lib/` is not included in the diff (gitignored, regenerated at build time)

## CHANGELOG

- [ ] User-facing changes are recorded under `## [Unreleased]` in `CHANGELOG.md`
- [ ] N/A — change is internal only

## Public API

- [ ] Public API signatures are unchanged (existing consumer code keeps working)
- [ ] If a new export/composable/option was added, it is documented in the README and typed in `.d.ts`

## Notes for reviewers

<!-- Anything reviewers should pay extra attention to. -->