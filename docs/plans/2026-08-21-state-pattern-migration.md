# State-pattern migration plan (#153)

**Goal:** migrate components onto the 8-state vocabulary + surface/mark/affordance token
tiers defined in `docs/design/18-state-patterns.md`, so state styling lives once in `base`
and themes only retoken.

**Spec:** `docs/design/18-state-patterns.md` — vocabulary (§State Vocabulary), tiers
(§Token Tiers), group-vs-element (§Group context, §Element vs Group Tokens), the worked
List before/after (§Refactoring an existing component), and the 5-step plan
(§Migration plan).

**Status:** Phase 0 DONE (2026-08-21). Phases 1–5 not started. Survey below is measured,
not estimated.

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
   → **Built. See Phase 0 below** for what the matrix actually became (skins matter;
   `background-image` and `::before`/`::after` are load-bearing) and for the three
   findings that came out of building it.
2. Keep `theme-contrast.e2e.ts` green as a secondary gate (it catches contrast
   regressions the snapshot might normalise away).
3. `/embed/gallery` scan (see the theme-contrast memory note) for a human look.

Building (1) is the first task, and it is genuinely reusable for Tree and the rest.

---

## Phases

### Phase 0 — the safety net ✅ DONE 2026-08-21
- [x] Computed-style snapshot harness. Three files:
      `apps/learn/src/routes/embed/states/+page.svelte` (fixture — owns the case
      matrix), `apps/learn/e2e/state-snapshot-collector.mjs` (driver + in-page
      collectors), `apps/learn/e2e/state-snapshot.e2e.ts` (the gate).
- [x] Baseline committed from **current** CSS: `e2e/state-snapshot.baseline.json`,
      3872 keys / 540 KB, exact-match (not a ratchet). Re-baseline with
      `UPDATE_STATE_BASELINE=1 npx playwright test state-snapshot`.
- [x] Break-it verified — twice, and the first attempt **failed to break anything**,
      which is the finding (see below).

**Matrix as built: 5 styles × 2 modes × 2 skins × 14 cases × 2 icon kinds** = 560 case
instances. Wider than the plan's "8 states" on purpose:

- **14 cases, not 8.** The doc's 8-state vocabulary minus `read-only` (scoped to form
  fields; List has no such concept, a case would assert nothing) plus the group-focus
  variants — `current-passive` / `current-groupfocus` / `current-focus` / `current-hover`
  and the `selected-*` trio. Those variants are where the five themes diverge most and
  where a retokening is most likely to break, so they are the whole point.
- **2 icon kinds.** `[data-item-icon]` and `[data-item-icon-literal]` are separate
  selectors, and rokkit + frosted give the literal its own `:focus-within`/hover rules.
  Covering only the cases that differentiate the literal *today* would bake current CSS
  into the safety net.
- **`pressed` kept though unstyled.** No theme's `list.css` has a `:active` rule; the case
  pins that fact so adding one shows up as a diff.

**Self-verifying, because a check that cannot fail is worth nothing.** Every interaction
asserts the pseudo-class actually matched (`el.matches(':hover' | ':focus' | ':active')`)
and throws if not, so a selector typo cannot leave a case silently measuring idle styles.
A second test asserts the baseline is non-trivial (key count, exactly 560 cases, marks
like `inset` and `linear-gradient` present). Transitions are killed on the fixture —
`base/list.css` animates background-color/color over 150ms, so an unguarded read after
`hover()` would capture a mid-transition value and flake.

#### Finding 1 — `skin=default` alone makes the gate blind, and it fooled the first break-it

The plan said to hand-edit an active-mark colour. Done: minimal's
`box-shadow: inset 2px 0 0 0 var(--accent)` → `var(--primary)`, themes rebuilt.
**The gate passed.** Not a harness bug — `apps/learn/rokkit.config.js` maps the default
skin's `primary` AND `accent` both to `shu`, so the two tokens compute to the same colour
and the edit was a value-level no-op.

That is exactly the substitution this migration will be tempted into
(`--state-current-mark: var(--primary)` where the theme said `var(--accent)`), and a
default-only snapshot waves it through. Fixed by adding the `ocean` skin, which maps
primary/secondary/accent to three distinct palettes (teal/emerald/sky). Re-running the
same sabotage then produced **8 diffs, all in `ocean`, zero in `default`** — the blindness
demonstrated rather than argued.

#### Finding 2 — the mark-shape change is caught, which is the whole justification

Second sabotage: minimal's group-focused active mark from `inset` bar → gradient block
fill (rokkit's shape). **16 diffs**, `box-shadow: … inset` → `background-image:
linear-gradient(…)`. Worth noting *why* this one matters: in the default skin the gradient
renders `linear-gradient(…, oklch(0.641 0.19 36), oklch(0.641 0.19 36))` — the same colour
twice, i.e. a flat fill with identical text contrast to the bar it replaced.
`theme-contrast.e2e.ts` cannot see that change by construction. This gate can.

#### Finding 3 — the List `[data-selected]` theme rules are dead code (Phase 2 input)

While building the fixture: **no component emits `[data-list-item][data-selected='true']`.**
`data-selected` is emitted by Toggle / Swatch / Tabs / Select / MultiSelect / Table /
TreeTable on their own hooks, and by ItemToggle on `[data-item-toggle-option]` — never on
a list item. `List.svelte` is single-value (`data-active` from `value`) and has no
`multiselect` prop, though `base/list.css` still carries
`[data-list][data-multiselect='true']`.

So the ~20 multi-selection rules across the five `<theme>/list.css` files are unreachable.
**Phase 2 should delete them, not port them** — but confirm that with the owner first,
since the alternative reading is that List is *missing* a multi-select feature the themes
were written for. Either way the harness covers them: the fixture sets the attribute
directly on the real component DOM via the case spec's `set` clause, so the rules are
snapshotted and cannot change silently while the question is open.

**Cost:** ~31s for the snapshot test; full learn e2e suite 36 tests / 55s (was 34).

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
- [ ] **Decide the `[data-selected]` question first** (Phase 0 finding 3): those ~20 rules
      are unreachable today. Deleting them is a one-line change per theme; porting them
      is real work for a feature that does not exist. Needs an owner call, because the
      answer might be "List should support multi-select".
- [ ] Phase 0 snapshots must be **unchanged**:
      `cd apps/learn && npx playwright test state-snapshot`. Any diff is a regression to
      fix or an intentional change to re-baseline (`UPDATE_STATE_BASELINE=1`) with the
      reason in the commit message. Never re-baseline to make a migration commit green.
- [ ] Update/add tests for the state hooks (acceptance criterion 3).

### Phase 3 — Tree
Shares the most with List; the token set either holds here or it is wrong. Expect to
revise Phase 1 tokens once — that is the point of doing Tree second, not sixth.

Extending the Phase 0 harness to Tree is additive and cheap: the fixture owns the case
matrix and the collector discovers cases from the DOM, so covering Tree means adding
Tree cases to `embed/states/+page.svelte` (each declaring its own `measure` selector) and
re-baselining. No collector change.

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
