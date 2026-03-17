# LLMs & Learn Site Gap Analysis

> Tracks what's done and what remains across the LLMs documentation and learn site sync work.
> Updated: 2026-03-16

---

## LLMs Documentation (`docs/llms/`)

### Infrastructure
| Item | Status | Notes |
|------|--------|-------|
| Move `site/static/llms` → `docs/llms` as source of truth | ✅ Done | Commit `12bab51f` |
| `site/.gitignore` — ignore generated `static/llms` | ✅ Done | Commit `b8247791` |
| `site/package.json` — `cp -r ../docs/llms ./static` in dev + build scripts | ✅ Done | Commit `3a2aa505` |

### Content — Core Files
| File | Status | Notes |
|------|--------|-------|
| `docs/llms/index.txt` — CLI-first setup, verify/fix, troubleshooting, correct theming | ✅ Done | All 4 doctor checks, `data-style` not `data-theme`, z-scale, utility classes |
| `docs/llms/cli.txt` — `rokkit init`, `rokkit doctor`, icon tools | ✅ Done | All prompts, checks, exit codes, manual fixes |

### Content — Package Docs (`docs/llms/packages/`)
| File | Status | Notes |
|------|--------|-------|
| `actions.txt` | ✅ Done | All actions including `fillable`, `navigable` keyup detail |
| `states.txt` | ✅ Done | All exports: ProxyItem, ListController, TableController, vibe, etc. |
| `core.txt` | ✅ Done | FieldMapper, theme utils, string utils |
| `data.txt` | ✅ Done | Dataset pipeline, filter, formatter, hierarchy |
| `themes.txt` | ✅ Done | Available themes, CSS imports, palette config |
| `unocss.txt` | ✅ Done | presetRokkit setup and all options |
| `app.txt` | ✅ Done | ThemeSwitcherToggle, TableOfContents + rescan() pattern |
| `forms.txt` | ✅ Done | Full depth: FormBuilder API, all 21 field types, 3 lookup modes, dynamic forms, end-to-end example |

### Content — Remaining
| Item | Status | Notes |
|------|--------|-------|
| Component `.txt` files for all 30+ UI components | ✅ Existing | 28 component files were in place before this work |
| Extract useful content from learn site pages into llms docs | ⬜ Todo | Sub-project B remainder — tutorials, usage patterns from learn pages that LLMs would benefit from |
| `@rokkit/chart` package docs | ⬜ Todo | Not included in Plan 2 — chart package needs `docs/llms/packages/chart.txt` |
| `@rokkit/icons` package docs | ⬜ Todo | Icons partially covered in `index.txt`; dedicated `packages/icons.txt` would be useful |
| `@rokkit/stories` package docs | ⬜ Low priority | Internal/testing utility; lower LLM relevance |
| `@rokkit/helpers` package docs | ⬜ Low priority | Testing helpers; lower LLM relevance |

---

## Learn Site (`site/src/routes/(learn)/docs/`)

### Fixes to Existing Pages
| Item | Status | File | Issue |
|------|--------|------|-------|
| Theming — fix `data-palette="rokkit"` → `data-style="rokkit"` in examples | ⬜ Todo | `theming/overview/+page.svelte` | Wrong attribute used in example |
| Theming — add UnoCSS utility class guidance (use utility classes, not CSS vars) | ⬜ Todo | `theming/` pages | No guidance on primary authoring model |
| Getting Started / Installation — add CLI setup path | ⬜ Todo | `getting-started/installation/+page.svelte` | Only manual install described; no mention of `npx @rokkit/cli@latest init` |
| CLI page — fill "Coming soon" with real content | ⬜ Todo | `toolchain/cli/+page.svelte` | Entire page is a placeholder |
| Select component — verify `items` vs `options` naming consistency | ⬜ Todo | `components/select/` | Learn site uses `items=`, LLMs docs use `options=` |

### New Pages — Package Reference (Style A: reference-style, no demos)
| Page | Status | Notes |
|------|--------|-------|
| `@rokkit/actions` reference page | ⬜ Todo | Coverage: navigable, all actions, events. No deep coverage exists on site. |
| `@rokkit/states` reference page | ⬜ Todo | `utilities/state-management` has some coverage; needs full API reference |
| `@rokkit/core` reference page | ⬜ Todo | Not covered anywhere on site |
| `@rokkit/data` reference page | ⬜ Todo | Not covered anywhere on site |
| `@rokkit/unocss` reference page | ⬜ Todo | Partially covered in theming; needs dedicated page |
| `@rokkit/app` reference page | ⬜ Todo | Not covered anywhere on site |

Navigation placement for new pages: **`utilities/` section** — add as sub-pages alongside existing controllers, navigator, state-management pages.

### New Pages — Full Learn Pages with Demos (Style B: future work)
| Page | Status | Notes |
|------|--------|-------|
| `@rokkit/actions` — interactive demos | ⬜ Future | Demos for navigable, draggable, reveal, ripple, etc. |
| `@rokkit/forms` — expand existing forms section | ⬜ Future | Current forms pages are minimal; needs lookup demos, dynamic form demos |
| `@rokkit/data` — interactive demos | ⬜ Future | Pipeline demos, filter demos |
| `@rokkit/chart` — (exists but could be expanded) | ⬜ Future | Already has chart pages; assess completeness separately |
| Getting Started / Quick Start | ⬜ Future | Currently "Coming soon" |
| Theming / Density | ⬜ Future | Currently "Coming soon" |
| Theming / Whitelabeling | ⬜ Future | Currently "Coming soon" |
| Toolchain / Overview — expand with CLI section | ⬜ Future | Currently brief |

### Consistency Checks (learn site ↔ llms docs)
| Item | Status | Notes |
|------|--------|-------|
| Component import statements match between site and llms | ✅ Verified | Spot-checked List, Select, Tabs, Tree — consistent |
| `@rokkit/states` exports accurate on site | ⬜ Todo | `utilities/state-management` may reference `NestedController` (doesn't exist) — verify |
| `data-style` attribute used consistently (not `data-theme`) | ⬜ Todo | Site theming pages need audit pass |
| z-scale token names consistent (z1–z10) | ✅ Consistent | Both site and llms docs use same token names |

---

## Specs & Plans
| Document | Status |
|----------|--------|
| `docs/superpowers/specs/2026-03-16-llms-infrastructure-design.md` | ✅ Done — superseded by implementation |
| `docs/superpowers/specs/2026-03-16-llms-content-expansion-design.md` | ✅ Done — implemented |
| `docs/superpowers/specs/2026-03-16-llms-txt-theming-docs.md` | ✅ Done — folded into content expansion |
| `docs/superpowers/plans/2026-03-16-llms-infrastructure.md` | ✅ Executed |
| `docs/superpowers/plans/2026-03-16-llms-entry-point-and-cli.md` | ✅ Executed |
| `docs/superpowers/plans/2026-03-16-llms-package-docs.md` | ✅ Executed |
| Learn site fixes spec + plan | ⬜ Todo — next |

---

## Next Priorities

1. **Learn site fixes** (targeted edits to existing pages) — highest value, addresses real errors
2. **New package reference pages** (Style A) — add to nav under TBD section
3. **`@rokkit/chart` and `@rokkit/icons` llms package docs** — small content files
4. **Learn page content extraction into llms** — audit learn pages for useful LLM-facing content
5. **Style B full learn pages** — longer-term content investment
