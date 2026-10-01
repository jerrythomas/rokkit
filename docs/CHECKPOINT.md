# CHECKPOINT

**Closed 2026-10-01:** #156, #163, #159, #155, #164, and (pending CI) #170, #171, #172.
#152's test gaps are fixed. Journal 2026-10-01 (1)–(4).

**Next slice: List multi-select (#153, the user's decision: add it rather than delete the dead
rules).** Wrapper already has `multiselect` with extend and range (`84b42070d`), and the
navigator already emits `extend` / `range` on ctrl/⌘ and shift. List needs a `multiselect`
prop, a bindable `values` array, `data-selected` per item, and an `onchange` for the set. The
themes' `[data-list-item][data-selected]` rules then become live. After that, #153 Phase 2
(List onto the state tokens) can proceed.

**Next command:** read `packages/states/src/wrapper.svelte.js` (multiselect API) and
`packages/ui/src/components/List.svelte`, then write the failing List multiselect spec.

**Open questions:**
- #152's heading-levels phase: which heading set adopts the type scale. (a) Retune it to the
  guides' scale (recommended), (b) restyle the guides, or (c) leave the tokens unconsumed.
- dbd's preview server was killed by mistake on 2026-10-01. Restart it in `dbd/site` if needed;
  rokkit's e2e now uses 4183, so there is no clash.
- MultiSelect lacks Select's fixed positioning and `maxRows`. Polymetric's wide strip for big
  packages. `fill()` could move into `@rokkit/states`. `stash@{0}` is intact.

**Known broken:** nothing. The sensei MCP server is disconnected, so this file is the only record.
