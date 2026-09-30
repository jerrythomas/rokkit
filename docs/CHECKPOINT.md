# CHECKPOINT

**Last slice: #165 (graph drill events). DONE.** Plan: `docs/plans/2026-09-30-graph-drill-events.md`; journal 2026-09-30 (12).

- `ondrill` / `ondrillup` with a promise contract, pending and rollback.
- `DrillBar` and drill gestures.
- The data-path addressing, with the focus chain kept unfolded.
- A lazy demo, and 4 drill e2e tests.
- Real-browser fixes: pointer capture, key collisions, setters undone by `apply()`, and a
  caller's state.

Every #165 acceptance item is covered by a spec or an e2e test.

**Not done:** the issue is still open on GitHub. Closing it or commenting is outward-facing, so
it waits for the user.

**Next slice:** #166 [graph] P1, a collapsed group node (SCC condensation) that expands to its members.

**Next command:** `gh issue view 166`, then plan it.

**Open questions:**

- Close #165 with a summary comment?
- MultiSelect still lacks Select's fixed positioning and `maxRows`. Noted, not fixed.

**Known broken:** nothing. The sensei MCP server is disconnected, so this file is the only record.
