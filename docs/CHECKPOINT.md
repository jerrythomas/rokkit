# CHECKPOINT

**Released v1.8.2** (2026-10-01): `179cde8c5`, all 15 packages on npm, `main` fast-forwarded,
CI green, GitHub release created. Shipped-artifact repros pass. Journal 2026-10-01 (1)–(8).

**v1.8.1 is deprecated** on npm (all 15, 2026-10-02) via the new `deprecate.yml` workflow; 1.8.2
is `latest`. The release now guards against the stale-pin regression (the bump refreshes
bun.lock; the lockfile spec runs in check and publish; check-pins runs per tarball).

**Open issues:** none.

**Next command:** `gh issue list --state open`.

**Open questions:**
- Semver: 1.8.2 includes the removal of the `--text-*` scale and the preset's
  `typography.ratio/base/levels` (marked `refactor!`). The user asked for a patch; nothing
  consumed them.
- MultiSelect lacks Select's fixed positioning and `maxRows`. Polymetric's wide strip for big
  packages. `fill()` could move into `@rokkit/states`. `stash@{0}` (old develop WIP) is intact.

**Known broken:** nothing. (@rokkit/*@1.8.1 is deprecated in favour of 1.8.2.) The sensei MCP server is
disconnected, so this file is the only record.
