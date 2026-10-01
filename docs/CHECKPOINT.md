# CHECKPOINT

**Closed 2026-10-01:** #156, #163, #159, #155, #164, #170, #171, #172.
#152's test gaps are fixed. Journal 2026-10-01 (1)–(4).

**List multi-select: DONE** (journal 2026-10-01 (5)). The `[data-selected]` rules are live.

**#153 closed** (2026-10-01, owner decision): the data attributes are the state vocabulary,
with no token tier.

**#152 done** (heading levels as `[data-heading]` rules), pending CI and closing.

**Open issues:** none from this batch once #152 closes. Next is `gh issue list --state open`.

**Next command:** `gh issue list --state open`.

**Open questions:**
- The tree-table demo reads `--text-md` / `--text-sm`, which never existed, so its font-size falls back to inherited. Give it a `data-heading` or a real size.
- #152's heading-levels phase: which heading set adopts the type scale. (a) Retune it to the
  guides' scale (recommended), (b) restyle the guides, or (c) leave the tokens unconsumed.
- dbd's preview server was killed by mistake on 2026-10-01. Restart it in `dbd/site` if needed;
  rokkit's e2e now uses 4183, so there is no clash.
- MultiSelect lacks Select's fixed positioning and `maxRows`. Polymetric's wide strip for big
  packages. `fill()` could move into `@rokkit/states`. `stash@{0}` is intact.

**Known broken:** nothing. The sensei MCP server is disconnected, so this file is the only record.
