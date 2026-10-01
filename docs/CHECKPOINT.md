# CHECKPOINT

**Graph messages + actions: DONE** (`3bf82cc2c`..`1ea3c0288` plus docs), pending the push and CI.
#165–#169 are closed. Journal 2026-10-01 (1).

**Next slices, in the order the user set:**
1. #156: dependency advisories (vitest, vite, esbuild, undici, devalue, dompurify, svelte,
   cookie) and the TypeScript 7 landmine in `upgrade:all`. Turning Dependabot alerts on is a
   repo setting, so that part is the user's.
2. Close every resolved issue: check #163, #164, #159 and #155 against their acceptance.

**Next command:** `gh issue view 156`.

**Open questions:**
- MultiSelect still lacks Select's fixed positioning and `maxRows`.
- Polymetric: a container's leaves are one row, so a big package is a wide strip at fit.
- `fill()` could move into `@rokkit/states` for every component; ui's Carousel hardcodes
  "Slide {n} of {count}" today.
- `stash@{0}` (an old develop WIP) is intact; it was accidentally popped and restored on 2026-09-30.

**Known broken:** nothing. The sensei MCP server is disconnected, so this file is the only record.
