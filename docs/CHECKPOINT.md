# CHECKPOINT

**Released v1.8.2** (2026-10-01): `179cde8c5`, all 15 packages on npm, `main` fast-forwarded,
CI green, GitHub release created. Shipped-artifact repros pass. Journal 2026-10-01 (1)–(8).

**v1.8.1 is broken on npm.** ui, graph and app pin their siblings to 1.8.0, so graph crashes
on labels and List multiselect throws. 1.8.2 fixes it, and the release now guards it (bump
refreshes bun.lock; lockfile spec in check and publish; check-pins per tarball). Deprecating 1.8.1
is the user's decision: `npm deprecate @rokkit/<pkg>@1.8.1 "..."` for ui, graph and app (or all
15).

**Open issues:** none.

**Next command:** `gh issue list --state open`.

**Open questions:**
- Deprecate @rokkit/*@1.8.1?
- Semver: 1.8.2 includes the removal of the `--text-*` scale and the preset's
  `typography.ratio/base/levels` (marked `refactor!`). The user asked for a patch; nothing
  consumed them.
- MultiSelect lacks Select's fixed positioning and `maxRows`. Polymetric's wide strip for big
  packages. `fill()` could move into `@rokkit/states`. `stash@{0}` (old develop WIP) is intact.

**Known broken:** @rokkit/*@1.8.1 on npm (superseded by 1.8.2). The sensei MCP server is
disconnected, so this file is the only record.
