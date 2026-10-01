# CHECKPOINT

**Closed 2026-10-01:** #156, #163, #159, #155, #164, #170, #171, #172.
#152's test gaps are fixed. Journal 2026-10-01 (1)–(4).

**List multi-select: DONE** (journal 2026-10-01 (5)). The `[data-selected]` rules are live.

**#153 closed** (2026-10-01, owner decision): the data attributes are the state vocabulary,
with no token tier.

**Open issues:** #152 only. Its heading-scale phase waits on the user's choice: (a) retune the
scale to the guides' headings (recommended), (b) restyle the guides, or (c) leave the tokens
unconsumed.

**Next command:** ask about #152's option; otherwise `gh issue list --state open`.

**Open questions:**
- #152's heading-levels phase: which heading set adopts the type scale. (a) Retune it to the
  guides' scale (recommended), (b) restyle the guides, or (c) leave the tokens unconsumed.
- dbd's preview server was killed by mistake on 2026-10-01. Restart it in `dbd/site` if needed;
  rokkit's e2e now uses 4183, so there is no clash.
- MultiSelect lacks Select's fixed positioning and `maxRows`. Polymetric's wide strip for big
  packages. `fill()` could move into `@rokkit/states`. `stash@{0}` is intact.

**Known broken:** nothing. The sensei MCP server is disconnected, so this file is the only record.
