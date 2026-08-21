# State-pattern migration plan (#153)

**Goal:** migrate components onto the 8-state vocabulary + surface/mark/affordance token
tiers defined in `docs/design/18-state-patterns.md`, so state styling lives once in `base`
and themes only retoken.

**Spec:** `docs/design/18-state-patterns.md` — vocabulary (§State Vocabulary), tiers
(§Token Tiers), group-vs-element (§Group context, §Element vs Group Tokens), the worked
List before/after (§Refactoring an existing component), and the 5-step plan
(§Migration plan).

**Status:** NOT STARTED. Planned 2026-08-21; survey below is measured, not estimated.

---

## Measured baseline

State-bearing rules (`data-active` / `data-selected` / `data-disabled` / `:hover` /
`:focus`) per component per theme, counted 2026-08-21:

| component | base | frosted | material | minimal | rokkit | zen-sumi | **theme total** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| list | 4 | 24 | 21 | 21 | 31 | 18 | **115** |
| tree | 1 | 16 | 23 | 23 | 27 | 23 | **112** |
| tabs | 6 | 4 | 11 | 17 | 9 | 7 | **48** |
| menu | 7 | 7 | 7 | 6 | 8 | 6 | **34** |
| toolbar | 2 | 6 | 6 | 6 | 6 | 6 | **30** |
| dropdown | 3 | 5 | 5 | 5 | 6 | 5 | **26** |

**365 theme-level state rules** across these six components. The doc's ~600-line
reduction estimate is consistent with this once multi-line rule bodies are counted, and
list + tree alone are 62% of the total — which is why the doc's ordering (List, then Tree)
is right: the two of them validate the token set against the hardest cases before the
long tail.

---

## Why this was not attempted in one pass

The hard constraint is the acceptance criterion **"no visual regression"** across 5 themes
× 2 modes. Each theme's list.css encodes a visually *distinct* treatment of the same
state (minimal: 2px inset bar; rokkit: gradient block fill; frosted: translucent
overlay), and the rules reach into sub-elements — `[data-item-icon]`,
`[data-item-icon-literal]`, `[data-item-description]`, `[data-item-badge]` — with
different colours per state. A token set that collapses those has to reproduce every
theme's look exactly, or it silently changes the design of shipped themes.

That is a design pass over ~790 lines of theme CSS, not a mechanical find-and-replace.

---

## Verification strategy (do this first, before touching CSS)

The repo has **no pixel-level visual-regression suite** — `packages/ui/browser/README.md`
is explicit that browser-mode tests are for layout/measurement, and theme appearance is
covered by `apps/learn/e2e/theme-contrast.e2e.ts`, a WCAG-contrast audit that ratchets
against a baseline. Contrast alone will NOT catch "the active mark changed from a bar to
a fill" — both can pass contrast.

So before migrating, establish a real before/after signal. In preference order:

1. **Computed-style snapshot harness.** For each theme × mode, render a List with an
   item in each of the 8 states and record the computed values that matter
   (`color`, `background-color`, `box-shadow`, `border-*`, `outline`) for the item and
   each sub-element. Commit as a baseline; assert equality after migration. This is the
   only check that actually proves "no visual regression" for a retokening exercise.
2. Keep `theme-contrast.e2e.ts` green as a secondary gate (it catches contrast
   regressions the snapshot might normalise away).
3. `/embed/gallery` scan (see the theme-contrast memory note) for a human look.

Building (1) is the first task, and it is genuinely reusable for Tree and the rest.

---

## Phases

### Phase 0 — the safety net
- [ ] Computed-style snapshot harness for List across 5 themes × 2 modes × 8 states.
- [ ] Commit the baseline generated from **current** CSS (pre-migration).
- Break-it: hand-edit one theme's active-mark colour → the snapshot test must fail.
  A baseline that cannot fail is worthless here.

### Phase 1 — the token set
- [ ] `packages/themes/src/base/state-tokens.css` with the default surface / mark /
      affordance tokens from §Token Tiers, plus the `-active`/`-passive` group-focus pair.
- [ ] Wire it into the base bundle (check `packages/themes/src/index.css` or the build's
      file list — `build.mjs` emits per-component `dist/<style>/*.css`, so confirm a new
      base file is picked up).
- [ ] Do NOT consume it yet. Landing tokens with no consumer is fine as one commit;
      landing a half-migrated component is not.

### Phase 2 — List (the doc's worked example)
- [ ] Per-theme `state-tokens.css` overrides reproducing each theme's current look.
- [ ] Rewrite `base/list.css` state rules to reference tokens only.
- [ ] Delete the now-redundant state rules from all 5 `<theme>/list.css`.
- [ ] Phase 0 snapshots must be **unchanged**. Any diff is a regression to fix or an
      intentional change to re-baseline with a stated reason.
- [ ] Update/add tests for the state hooks (acceptance criterion 3).

### Phase 3 — Tree
Shares the most with List; the token set either holds here or it is wrong. Expect to
revise Phase 1 tokens once — that is the point of doing Tree second, not sixth.

### Phase 4 — Menu / Dropdown / Tabs / Toolbar
The long tail (138 theme rules). Mechanical once Phases 2–3 settle the vocabulary.

### Phase 5 — measure and record
- [ ] Report the actual line reduction against the ~600 estimate (the doc's number is a
      proposal; publish the measured one).
- [ ] Journal + `docs/design/12-priority.md`; mark §Migration plan executed in
      `18-state-patterns.md` (it currently says "proposal — not yet executed").

---

## Out of scope (from the doc)

Animations/transitions on state change; form-field validity (`[data-field-state]`, already
covered by the named token set); compound states like "selected + hover + group-focused".

---

## Notes for whoever picks this up

- `18-state-patterns.md` §Refactoring shows the exact before/after for
  `minimal` + List — start from that snippet, it is the contract.
- **RESOLVED 2026-08-21 — divergent mark shapes get a scoped rule, not an overloaded
  token.** rokkit's current-mark is a gradient fill; minimal's is an inset bar. Rather
  than force `--state-current-mark` to serve as a `background-image` in one theme and a
  `box-shadow` colour in another, the theme targets the state's `data-` attribute
  directly and overrides the property it needs:

  ```css
  [data-style='rokkit'] [data-list-item][data-active='true'] {
    background-image: linear-gradient(to right, var(--primary), var(--accent));
    box-shadow: none;
  }
  ```

  A token that has to be reinterpreted per theme is worse than an explicit rule — it
  looks shared while behaving differently. Written up in `18-state-patterns.md`
  §Mark tier.

  **Consequence for the target:** the goal is "themes stop repeating the *same* state
  rules", not "zero per-theme component CSS". Report the measured reduction in Phase 5
  against that framing rather than the doc's original ~600-line figure, which assumed
  full collapse.
- Per the themes memory note: skin-role colours resolve as `@apply` gradient stops but
  named-token shortcuts silently drop — use raw `linear-gradient` + `color-mix` in theme
  CSS, not `@apply`.
