---
description: List all Rokkit custom commands with usage examples
---

## Rokkit Custom Commands

### Feature Lifecycle

| Command           | Usage                                             | Purpose                                   |
| ----------------- | ------------------------------------------------- | ----------------------------------------- |
| `/feature-start`  | `/feature-start AlertBanner — toast-style alerts` | Load context, baseline tests, create plan |
| `/feature-finish` | `/feature-finish AlertBanner`                     | Zero-errors gate, commit, update journal  |

### Component Work

| Command           | Usage                                         | Purpose                                                             |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| `/new-component`  | `/new-component AlertBanner`                  | Full scaffold: component, themes, tests, playground, docs, llms.txt |
| `/edit-component` | `/edit-component Select — add clearable prop` | Edit with architecture invariants and zero-errors policy            |

### Theme Work

| Command         | Usage                            | Purpose                                                   |
| --------------- | -------------------------------- | --------------------------------------------------------- |
| `/edit-theme`   | `/edit-theme tabs style=minimal` | Theme-specific patterns for rokkit/minimal/material/glass |
| `/build-themes` | `/build-themes`                  | Rebuild `packages/themes/dist/` after CSS changes         |

### Backlog & Issues

| Command    | Usage                               | Purpose                                                   |
| ---------- | ----------------------------------- | --------------------------------------------------------- |
| `/backlog` | `/backlog` or `/backlog StatusList` | Browse priority checklist, pick an item, kick off work    |
| `/issue`   | `/issue` or `/issue 61`             | List/investigate/fix a GitHub issue, auto-close on commit |

### Reference

| Command | Usage                                               | Purpose                                                             |
| ------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| `/call` | `/call the hover callback` or `/call a select item` | Naming conventions: props, data attributes, CSS tokens, files, ARIA |
| `/help` | `/help`                                             | This cheat sheet                                                    |

---

**Tip:** Type `/` in Claude Code to see all commands with descriptions. Keep typing to filter — e.g. `/feature` shows only the feature commands.
