---
description: List, investigate, and fix a GitHub issue. Usage: /issue [issue-number or description — optional]
---

Working with GitHub issues. Request: **$ARGUMENTS**

## Step 1: List Open Issues

```bash
gh issue list --limit 20
```

If a specific issue number was given in `$ARGUMENTS` (e.g. `/issue 61`), jump directly to Step 2 with that number.

Otherwise, present the open issues and ask the user which one to tackle.

## Step 2: Read the Issue

```bash
gh issue view <number> --json number,title,body,labels,comments
```

Parse the issue:

- **Title** — what the problem is
- **Body** — detail, links to external tools (Qlty, etc.), code locations
- **Labels** — classify: bug, code-quality, accessibility, performance, etc.
- **Comments** — any prior discussion or decisions

If the body links to an external tool (e.g. Qlty), note the link. The actual code locations must be found by searching the codebase — do not rely solely on external links.

## Step 3: Find the Code

Search the codebase to find what the issue refers to. Use Grep/Glob to locate:

- Duplicate/similar code (for Qlty code-quality issues)
- The buggy code path (for bug issues)
- The affected component (for feature/UX issues)

For **Qlty duplicate/similar code issues**, the strategy is:

1. Search for the repeated pattern (grep for a distinctive line from the duplicated block)
2. Read both locations to understand what they do
3. Determine if extraction is safe (shared utility, no side-effects, same semantics)
4. Design the minimal abstraction that removes the duplication

## Step 4: Classify the Fix

**Surgical fix** — 1-3 files, clear scope:
→ Confirm approach with user, implement, zero-errors-policy, commit, close issue

**Broader refactor** — touches multiple files, needs a plan:
→ Use `/feature-start <IssueN> — <description>` to set up properly

## Step 5: Implement

Follow the appropriate workflow based on classification. Always apply:

### Zero-Errors Policy

Before touching code:

```bash
bun run test:ci && bun run lint   # record baseline
```

After fixing:

```bash
bun run test:ci && bun run lint   # must be zero errors
```

No "pre-existing", no "unrelated files", no "no new errors" rationalizations. Zero means zero.

## Step 6: Commit and Close

When tests and lint are clean:

```bash
git add -p
git commit -m "$(cat <<'EOF'
fix|refactor: <what was fixed and why>

Closes #<issue-number>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

The `Closes #N` in the commit message auto-closes the issue when merged to main. If you want to close it immediately:

```bash
gh issue close <number> --comment "Fixed in <commit-hash> — <one-line explanation>"
```

## Step 7: Update Docs (if needed)

- `agents/journal.md` — append a brief entry with commit hash
- `docs/issues.md` — update if this file is being maintained manually

---

## Common Issue Patterns in This Repo

### Qlty: Duplicate / Similar Code

These come from the [Qlty](https://qlty.sh) code quality tool scanning the repo. They flag:

- **Identical code** — exact copy-paste that should be extracted
- **Similar code** — near-duplicate with minor variations, candidate for parameterized extraction

Resolution approach:

1. Read both locations and confirm they have the same semantics
2. Check which package each lives in — if both are in the same package, extract a shared util/helper; if cross-package, be careful about circular dependencies
3. Extract the minimal shared abstraction: a function, a constant, a derived utility
4. Replace both locations with the shared version
5. Confirm tests still pass — the refactor must be behavior-neutral

### Bug Reports

1. Reproduce first (playground page, unit test, or Playwright)
2. Identify root cause before touching code
3. Write a failing test that captures the bug
4. Fix the code until the test passes
5. Confirm no regressions

### Feature Requests / UX Issues

Cross-reference with `docs/design/12-priority.md`. If it's already tracked, link them. If not, consider whether to add it to the priority checklist.
