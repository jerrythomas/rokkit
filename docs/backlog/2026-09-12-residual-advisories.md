# Residual advisories after the rokkit#156 sweep

**Raised:** 2026-09-12, closing out the rokkit#156 dependency sweep.
**Status:** open — one advisory left, blocked on a bun limitation rather than on effort.

`bun audit` went from **28 vulnerable packages to 1** over four commits. This
records the one that is left, why the obvious fix does not work, and two findings
worth keeping.

## Left open: `yaml`

| | |
| --- | --- |
| Advisories | `>=1.0.0 <1.10.3` and `>=2.0.0 <2.8.3` — stack overflow via deeply nested collections |
| Severity | moderate |
| Installed | `yaml@1.10.2` (via `eslint-plugin-svelte › postcss-load-config`) and `yaml@2.8.2` (hoisted, via `bumpp` and `vite`) |
| Patched | `1.10.3` and `2.8.3` — **both exist, and every parent range already permits them** |

So this is not a version-availability problem. `postcss-load-config` wants
`^1.10.2`, `bumpp` wants `^2.8.2`, `vite` wants `^2.4.2`; 1.10.3 and 2.8.3 satisfy
those respectively. The lockfile has simply pinned older resolutions.

**Why an override does not fix it.** Two majors are in the tree needing two
different patches, and bun ignores nested `overrides` — it prints
`warn: Bun currently does not support nested "overrides"`. One version must serve
every parent, and no single version satisfies both `^1.10.2` and `^2.4.2`.

**Why the lockfile was not simply re-resolved.** Deleting the two `yaml` entries
from `bun.lock` and reinstalling does fix it — yaml goes to 1.10.3 and 2.9.1 — but
bun re-resolves far more than the removed entries. Measured: **40 packages** moved
a major, including `shiki` 3.23.0 → 4.4.3, which violates `@rokkit/ui`'s declared
`shiki: ^3.23.0` peer range, plus `@inlang/sdk` 2.9.2 → 3.0.5, `@lix-js/sdk`
0.4.10 → 0.16.1, and two *downgrades* (`@types/node` 25.3.0 → 22.20.2,
`undici-types` 7.18.2 → 6.21.0). That is an unacceptable blast radius for a
moderate advisory in a dev-time YAML parser reading our own config files, so the
lockfile was restored.

**What would actually fix it**, in preference order:

1. `postcss-load-config` moving to yaml 2.x, which collapses the tree to one
   major and makes a plain override work. Not in our control.
2. `eslint-plugin-svelte` dropping `postcss-load-config`. Not in our control.
3. A deliberate, separately-verified full lockfile regeneration — re-resolve
   everything, then re-run the whole gate and re-baseline coverage. Viable, but it
   is its own piece of work, not a drive-by.

Exposure in the meantime is low: both copies are dev-time tooling parsing
repo-owned files, not user input.

## Two findings worth keeping

**The issue's esbuild entry pointed at a withdrawn advisory.** rokkit#156 cited
`GHSA-gv7w-rqvm-qjhr` as HIGH and proposed an override. That advisory was
**withdrawn on 2026-06-17** — it described esbuild's *Deno* distribution, a
different ecosystem. The live npm advisory is `GHSA-g7r4-m6w7-qqqr`, **low**, and
dev-server only. It was fixed anyway by declaring `wrangler` explicitly, which is
strictly better than the proposed override: an override at `^0.28.1` would have
pushed wrangler past its own exact `0.28.1` pin.

**`@rokkit/ui` declares a `shiki` peer with no dev counterpart.** Every other peer
in the repo has one — `packages/ui` lists `svelte` in both `peerDependencies` and
`devDependencies`, but `shiki` only in `peerDependencies`. bun auto-installs the
missing peer and, on a fresh resolve, picked 4.4.3 rather than honouring
`^3.23.0`. Today the lockfile pins 3.23.0 so nothing is broken, but any full
re-resolve will silently take shiki to 4.x again.

Adding `"shiki": "^3.23.0"` to `packages/ui` devDependencies would close this, and
is a precondition for option 3 above. Not done here because it changes resolution
and this sweep was already large; it wants its own red-green.
