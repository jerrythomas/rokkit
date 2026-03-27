---
description: Finish a feature — run zero-errors checks, commit, update docs and journal. Usage: /feature-finish FeatureName
---

Finishing feature: **$ARGUMENTS**

## Step 1: Zero-Errors Policy — Full Suite

This is the gate. Nothing below happens until this is clean.

```bash
bun run test:ci        # ALL tests — zero failures
bun run lint           # zero errors (warnings acceptable)
```

If themes CSS was changed:

```bash
cd packages/themes && bun run build
bun run lint           # re-run after build
```

If there are errors: fix them. No exceptions. No "pre-existing" rationalizations.

## Step 2: Verify in Browser

For any UI/theme changes, open the playground and cycle all themes:

- `http://localhost:5175/playground/components/<changed-component>`
- Use toolbar Dropdown to switch: rokkit → minimal → material → glass
- Confirm no gradient bleed-through, no missing styles, no layout breaks

## Step 3: Update Docs (if applicable)

If the feature changed any component API, patterns, or architecture:

- [ ] `docs/design/07-priority.md` — mark feature complete (`✅`)
- [ ] `docs/design/NNN-<module>.md` — update if design changed
- [ ] `site/static/llms/components/<name>.txt` — update if component API changed
- [ ] Relevant backlog item in `docs/backlog/` — mark done

## Step 4: Commit

Stage and commit everything. One coherent commit per logical unit of work.

```bash
git status             # review what changed
git add -p             # stage selectively (not git add -A — avoid accidental staging)
git commit -m "$(cat <<'EOF'
feat|fix|style|refactor|test|chore: <what and why in one line>

<optional: 2-3 bullet points if the commit is large>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

**Commit type guide:**

- `feat:` — new component, new prop, new behavior
- `fix:` — bug fix
- `style:` — CSS/theme changes only
- `refactor:` — restructure without behavior change
- `test:` — test additions/fixes only
- `chore:` — build, config, docs-only changes

## Step 5: Update Journal

Append to `agents/journal.md`:

```markdown
### <Feature Name> (YYYY-MM-DD)

**What was done:**

- <bullet 1>
- <bullet 2>

**Key decisions:**

- <any design choices made>

**Tests:** <N> passing. 0 lint errors.

**Commits:** `<hash>` — <message>

**Files changed:** <list key files>
```

## Step 6: Confirm Clean State

```bash
git status             # working tree should be clean
git log --oneline -3   # confirm commit landed
```

---

Feature is done. The codebase is clean, committed, and documented.
