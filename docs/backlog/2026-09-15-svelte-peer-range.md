# Should `peerDependencies.svelte` be narrowed to exclude vulnerable svelte?

**Raised:** during the rokkit#156 dependency sweep, carried as an open question.
**Status:** CLOSED 2026-09-15 — **decided: no change.** Documented instead.

## The question

Five packages publish `"svelte": "^5.0.0"` as a peer (`ui`, `app`, `chart`,
`forms`, `blocks`). Every svelte 5 release at or below **5.55.6** carries at
least one moderate advisory, so that range permits a consumer to pair rokkit with
a vulnerable svelte.

The floor, from the GitHub advisory database:

| Advisory | Vulnerable | Patched |
| --- | --- | --- |
| GHSA-f3cj-j4f6-wq85 | `>=5.46.0 <=5.55.6` | 5.55.7 |
| GHSA-rcqx-6q8c-2c42 | `<=5.55.6` | 5.55.7 |
| GHSA-9rmh-mm8f-r9h6 | `>=5.51.5 <=5.55.6` | 5.55.7 |
| GHSA-pr6f-5x2q-rwfp | `<=5.55.6` | 5.55.7 |
| GHSA-qgvg-pr8v-6rr3 | `>=5.53.0 <5.53.5` | 5.53.5 |

So `^5.55.7` would be the narrowed range.

## Decision: leave it at `^5.0.0`

Four reasons, in order of weight:

1. **It would be a compatibility claim used to carry a security assertion.** A
   peer range states *what the library works with*. Rokkit works fine on svelte
   5.0 — nothing here needs 5.55.7. Encoding a security floor there makes the
   metadata mean something it does not mean, and the next reader cannot tell
   which kind of constraint it is.

2. **It protects nobody.** `svelte` is a peer: the consumer installs it directly
   and controls the version. Their own `bun audit` / `npm audit` already reports
   it, against their own lockfile, whether or not rokkit has an opinion. A
   narrowed peer changes an install error, not an exposure.

3. **It is a treadmill.** Every future svelte advisory would require republishing
   five packages to move a number that has no functional meaning — and any gap
   between advisory and republish leaves the range *stating* a safety property it
   no longer has. Worse than not stating one.

4. **The advisories are in svelte's own surface** — SSR XSS via promise
   serialisation and spread attributes, DOM clobbering of framework state, ReDoS
   in `<svelte:element>` validation. None are reached through a rokkit API;
   they are exercised by the consumer's own app.

## What was done instead

Nothing published changes. The repo's own posture was already correct and was
re-verified:

- root `overrides.svelte` = `^5.55.7`, resolving 5.57.0
- `bun audit` reports no vulnerabilities

Consumers who want the floor should set it themselves, in their own manifest or
overrides, where it is their statement about their own tree.

## If this is revisited

The trigger to change the answer would be a **high/critical** advisory reachable
through a rokkit component's own API — i.e. where using rokkit is what exposes
you. That is a different question from the one asked here, and would justify a
real floor.
