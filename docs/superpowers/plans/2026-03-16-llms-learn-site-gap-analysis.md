# LLMs & Learn Site Gap Analysis

> Tracks what's done and what remains across the LLMs documentation and learn site sync work.
> Updated: 2026-03-16

---

## LLMs Documentation (`docs/llms/`)

### Infrastructure

| Item                                                                       | Status  | Notes             |
| -------------------------------------------------------------------------- | ------- | ----------------- |
| Move `site/static/llms` → `docs/llms` as source of truth                   | ✅ Done | Commit `12bab51f` |
| `site/.gitignore` — ignore generated `static/llms`                         | ✅ Done | Commit `b8247791` |
| `site/package.json` — `cp -r ../docs/llms ./static` in dev + build scripts | ✅ Done | Commit `3a2aa505` |

### Content — Core Files

| File                                                                                  | Status  | Notes                                                                        |
| ------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| `docs/llms/index.txt` — CLI-first setup, verify/fix, troubleshooting, correct theming | ✅ Done | All 4 doctor checks, `data-style` not `data-theme`, z-scale, utility classes |
| `docs/llms/cli.txt` — `rokkit init`, `rokkit doctor`, icon tools                      | ✅ Done | All prompts, checks, exit codes, manual fixes                                |

### Content — Package Docs (`docs/llms/packages/`)

| File          | Status  | Notes                                                                                              |
| ------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `actions.txt` | ✅ Done | All actions including `fillable`, `navigable` keyup detail                                         |
| `states.txt`  | ✅ Done | All exports: ProxyItem, ListController, TableController, vibe, etc.                                |
| `core.txt`    | ✅ Done | FieldMapper, theme utils, string utils                                                             |
| `data.txt`    | ✅ Done | Dataset pipeline, filter, formatter, hierarchy                                                     |
| `themes.txt`  | ✅ Done | Available themes, CSS imports, palette config                                                      |
| `unocss.txt`  | ✅ Done | presetRokkit setup and all options                                                                 |
| `app.txt`     | ✅ Done | ThemeSwitcherToggle, TableOfContents + rescan() pattern                                            |
| `forms.txt`   | ✅ Done | Full depth: FormBuilder API, all 21 field types, 3 lookup modes, dynamic forms, end-to-end example |

### Content — Remaining

| Item                                                        | Status          | Notes                                                                                                                                                                                  |
| ----------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component `.txt` files for all 30+ UI components            | ✅ Existing     | 28 component files were in place before this work                                                                                                                                      |
| Extract useful content from learn site pages into llms docs | ✅ Done         | `composability.txt` (ProxyItem API, per-item routing, stopPropagation), `themes.txt` expanded (data-attr hooks, custom theme, skins), `index.txt` field roles table + primitive arrays |
| `@rokkit/chart` package docs                                | ⬜ Todo         | Not included in Plan 2 — chart package needs `docs/llms/packages/chart.txt`                                                                                                            |
| `@rokkit/icons` package docs                                | ⬜ Todo         | Icons partially covered in `index.txt`; dedicated `packages/icons.txt` would be useful                                                                                                 |
| `@rokkit/stories` package docs                              | ⬜ Low priority | Internal/testing utility; lower LLM relevance                                                                                                                                          |
| `@rokkit/helpers` package docs                              | ⬜ Low priority | Testing helpers; lower LLM relevance                                                                                                                                                   |

---

## Learn Site (`site/src/routes/(learn)/docs/`)

### Fixes to Existing Pages

| Item                                                                            | Status  | File                                                     | Issue                                                           |
| ------------------------------------------------------------------------------- | ------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| Theming — fix `data-palette="rokkit"` → `data-style="rokkit"` in examples       | ✅ Done | `theming/+page.svelte` + `theming/overview/+page.svelte` | Commit `137d2af0`, `766ff536`                                   |
| Theming — add UnoCSS utility class guidance (use utility classes, not CSS vars) | ✅ Done | `theming/overview/+page.svelte`                          | Expanded from stub to full page; commit `766ff536`              |
| Getting Started / Installation — add CLI setup path                             | ✅ Done | `getting-started/installation/+page.svelte`              | Added CLI section; commit `e7664625`                            |
| CLI page — fill "Coming soon" with real content                                 | ✅ Done | `toolchain/cli/+page.svelte`                             | Full reference with init, doctor, icon tools; commit `a4daae0d` |
| Select component — verify `items` vs `options` naming consistency               | ✅ Done | `docs/llms/components/select.txt`                        | Learn site was correct; llms doc fixed; commit `b8cdb4b5`       |
| `@rokkit/states` exports accurate on site                                       | ✅ Done | `utilities/controllers/+page.svelte`                     | Removed non-existent `NestedController`; commit `07a29998`      |
| `data-style` attribute used consistently (not `data-theme`)                     | ✅ Done | `theming/` pages                                         | Both theming pages audited and fixed                            |

### New Pages — Package Reference (Style A: reference-style, no demos)

| Page                             | Status  | Notes                                                                                    |
| -------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `@rokkit/actions` reference page | ✅ Done | `utilities/actions/` — navigable, all 14 actions, events table; commit `15b3dbf6`        |
| `@rokkit/states` reference page  | ✅ Done | `utilities/states/` — ProxyItem, ProxyTree, controllers, vibe; commit `65aa8ed9`         |
| `@rokkit/core` reference page    | ✅ Done | `utilities/core/` — FieldMapper, BASE_FIELDS, string utils; commit `96fdec41`            |
| `@rokkit/data` reference page    | ✅ Done | `utilities/data/` — dataset pipeline, filtering, formatter, hierarchy; commit `96fdec41` |
| `@rokkit/unocss` reference page  | ✅ Done | `utilities/unocss/` — presetRokkit, all options; commit `96fdec41`                       |
| `@rokkit/app` reference page     | ✅ Done | `utilities/app/` — ThemeSwitcherToggle, TableOfContents; commit `96fdec41`               |

### New Pages — Full Learn Pages with Demos (Style B: future work)

| Page                                             | Status    | Notes                                                                   |
| ------------------------------------------------ | --------- | ----------------------------------------------------------------------- |
| `@rokkit/actions` — interactive demos            | ⬜ Future | Demos for navigable, draggable, reveal, ripple, etc.                    |
| `@rokkit/forms` — expand existing forms section  | ⬜ Future | Current forms pages are minimal; needs lookup demos, dynamic form demos |
| `@rokkit/data` — interactive demos               | ⬜ Future | Pipeline demos, filter demos                                            |
| `@rokkit/chart` — (exists but could be expanded) | ⬜ Future | Already has chart pages; assess completeness separately                 |
| Getting Started / Quick Start                    | ⬜ Future | Currently "Coming soon"                                                 |
| Theming / Density                                | ⬜ Future | Currently "Coming soon"                                                 |
| Theming / Whitelabeling                          | ⬜ Future | Currently "Coming soon"                                                 |
| Toolchain / Overview — expand with CLI section   | ⬜ Future | Currently brief                                                         |

### Consistency Checks (learn site ↔ llms docs)

| Item                                                        | Status        | Notes                                                               |
| ----------------------------------------------------------- | ------------- | ------------------------------------------------------------------- |
| Component import statements match between site and llms     | ✅ Verified   | Spot-checked List, Select, Tabs, Tree — consistent                  |
| `@rokkit/states` exports accurate on site                   | ✅ Done       | Removed `NestedController` from controllers page; commit `07a29998` |
| `data-style` attribute used consistently (not `data-theme`) | ✅ Done       | Theming pages audited and corrected                                 |
| z-scale token names consistent (z1–z10)                     | ✅ Consistent | Both site and llms docs use same token names                        |

---

## Specs & Plans

| Document                                                             | Status                                  |
| -------------------------------------------------------------------- | --------------------------------------- |
| `docs/superpowers/specs/2026-03-16-llms-infrastructure-design.md`    | ✅ Done — superseded by implementation  |
| `docs/superpowers/specs/2026-03-16-llms-content-expansion-design.md` | ✅ Done — implemented                   |
| `docs/superpowers/specs/2026-03-16-llms-txt-theming-docs.md`         | ✅ Done — folded into content expansion |
| `docs/superpowers/plans/2026-03-16-llms-infrastructure.md`           | ✅ Executed                             |
| `docs/superpowers/plans/2026-03-16-llms-entry-point-and-cli.md`      | ✅ Executed                             |
| `docs/superpowers/plans/2026-03-16-llms-package-docs.md`             | ✅ Executed                             |
| `docs/superpowers/specs/2026-03-16-learn-site-sync-design.md`        | ✅ Done — implemented                   |
| `docs/superpowers/plans/2026-03-16-learn-site-sync.md`               | ✅ Executed — all 12 tasks complete     |

---

## Next Priorities

1. **Style B full learn pages** — longer-term content investment (demos, interactive examples for actions, forms, data packages)
