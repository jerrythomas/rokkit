# CHECKPOINT

**Closed 2026-10-01:** #156, #163, #159, #155, #164. Journal 2026-10-01 (1)–(3).

**Open issues: both need the user's input.**
- **#153 (state-pattern migration):** Phase 0 only. Phase 2 needs a decision: delete List's
  dead `[data-selected]` rules, or support multi-select in List.
- **#152 (theme wizard typography):** font picking is done. The heading-levels phase is
  blocked on which heading set adopts the type scale (retune to the guides' scale, which is
  recommended; restyle the guides; or leave the tokens unconsumed). Test gaps that need no
  input: the vacuous preview e2e (`theme-wizard-fonts.e2e.ts:63-79`), `--font-display` not
  shown in step 04, no layout-shift check, and stale docs (`12-priority.md:121`, the plan
  header, a `store.svelte.ts:16-20` comment, the step 03 copy).

**Next command:** discuss #153 and #152 with the user.

**Open questions:**
- **e2e port:** rokkit's Playwright and dbd's `vite preview` both use :4173, and
  `reuseExistingServer` makes a rokkit run silently test whatever holds the port. Give
  rokkit's preview its own port.
- dbd's preview server (PID 41073) was killed by mistake on 2026-10-01. Restart it in
  `dbd/site` with `vite preview --port 4173 --strictPort`.
- MultiSelect lacks Select's fixed positioning and `maxRows`. Polymetric's wide strip for big
  packages. `fill()` could move into `@rokkit/states`. `stash@{0}` is intact.

**Known broken:** nothing. The sensei MCP server is disconnected, so this file is the only record.
