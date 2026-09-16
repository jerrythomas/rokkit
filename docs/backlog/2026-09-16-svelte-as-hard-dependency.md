# Framework singletons shipped as hard dependencies

**Raised:** 2026-09-16, from the question "what breaks if we upgrade to latest svelte 5?"
**Status:** CLOSED 2026-09-16 — svelte and unocss moved to `peerDependencies`, guarded. **Unreleased.**

## The defect

Both packages declared `"svelte": "^5.55.7"` under **`dependencies`**, not
`peerDependencies`. Confirmed on the published artifact, not just the repo:

    $ npm view @rokkit/states@1.5.0 dependencies
    { ramda, svelte: "^5.55.7", d3-array, @rokkit/core, @rokkit/data }

A Svelte library must take svelte as a **peer**. As a hard dependency the
package manager is free to install a second copy beside the consumer's, and two
svelte runtimes in one app do not share module state — separate context maps,
separate lifecycle registries. Components created by one cannot read context set
by the other.

## Demonstrated, not theorised

A scratch consumer pinned to svelte 5.40.0 installing `@rokkit/ui@1.5.0`:

    5.40.0  ← node_modules/svelte                          (the app's)
    5.57.0  ← node_modules/@rokkit/states/node_modules/svelte
    5.57.0  ← node_modules/@rokkit/data/node_modules/svelte

Three copies, two runtimes. Any consumer whose svelte does not satisfy
`^5.55.7` gets this — which is every consumer the `^5.0.0` peer range on
`@rokkit/ui` explicitly invites.

## The fix

| Package | Was | Now | Why that floor |
| --- | --- | --- | --- |
| `@rokkit/states` | `dependencies: ^5.55.7` | `peerDependencies: ^5.7.0` | `MediaQuery` from `svelte/reactivity` — absent at 5.6.0, present at 5.7.0 (binary-searched) |
| `@rokkit/data` | `dependencies: ^5.55.7` | `peerDependencies: ^5.0.0` | only `svelte/store` and runes, both available from 5.0 |

Both gained `devDependencies.svelte` so the repo still builds and tests.
`pack-repoint.mjs` only rewrites export paths, so the declarations survive
publish. Lockfile diff carried no version changes.

## This corrects an earlier analysis

`2026-09-15-svelte-peer-range.md` concluded "no change" on narrowing
`peerDependencies.svelte` from `^5.0.0`. That reasoning still holds — a peer
range is a compatibility claim and shouldn't carry a security floor — **but it
answered an incomplete picture.** It checked the peer declarations of
`ui`/`app`/`chart`/`forms`/`blocks` and never checked whether svelte appeared as
a hard dependency elsewhere. It did, in two packages, which silently imposed a
≥5.55.7 floor transitively while `@rokkit/ui` advertised `^5.0.0`.

The peer range was never the lever. The hard dependency was.

## The same bug in unocss

`@rokkit/unocss` listed **unocss** and **@unocss/extractor-svelte** under
`dependencies`. It is a *preset* package — its presets are composed into the
consumer's unocss engine, so a second engine builds preset objects the first
cannot consume.

Demonstrated the same way, and the range matters:

| Consumer's unocss | Result |
| --- | --- |
| 66.7.0 (satisfies `^66.6.1`) | one copy, hoisted — fine |
| 66.0.0 (does **not** satisfy) | second engine at 66.10.5 nested under `@rokkit/unocss` |

Now peers at `^66.0.0` — the honest floor, since `presetWind3` is absent at
65.5.0 and present at 66.0.0 (probed against real installs, not recalled).

## The guard

`packages/core/spec/workspace-peers.spec.js` — no publishable package may list
`svelte`, `unocss` or `@sveltejs/kit` under `dependencies`. Nothing else
catches this: the manifest is valid either way and only misbehaves in a
consumer's tree.

It found two more on its first run — `@rokkit/chart` and `@rokkit/forms` peered
on svelte with no devDependency. Not breakage (workspace hoisting covers it at
build time) but an unpinned version, and nothing recorded what they were tested
against. Added; 7/7 consistent now.

Break-it verified: reintroducing `dependencies.svelte` on states fails the spec
by name.

## Left as dependencies, deliberately

- **d3-\***, **ramda**, **date-fns**, **marked**, **dompurify**, **@lukeed/uuid** —
  plain libraries, no process-wide identity. A duplicate wastes bytes, nothing more.
- **@vitest/expect**, **@vitest/spy** in `helpers` — checked rather than assumed:
  helpers never calls `expect.extend`, it exports matcher *functions* the consumer
  registers, and `equals` is pure. No registry, no singleton.
- **@unocss/preset-mini** in `core` — imports a colour data object, not engine state.
- **cli deps** — a CLI bundling its own tools is correct.
