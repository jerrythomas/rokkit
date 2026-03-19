# LLMs Docs Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `site/static/llms/` to `docs/llms/` as the committed source of truth, with a copy step in `site/package.json` that delivers files to `site/static/llms/` for serving.

**Architecture:** The 29 LLM documentation files (1 index + 28 components in a subdirectory) move to `docs/llms/` so they are visible on GitHub alongside other docs. A one-line `cp -r` prepended to both `dev` and `build` scripts keeps `site/static/llms/` populated. The generated copy is gitignored.

**Tech Stack:** Bun, SvelteKit, shell `cp`

---

## Chunk 1: Migrate files and update config

### Task 1: Move files to docs/llms

**Files:**

- Create: `docs/llms/` (move from `site/static/llms/`)

- [ ] **Step 1: Move the directory**

  Run from repo root `/Users/Jerry/Developer/rokkit`:

  ```bash
  mv site/static/llms docs/llms
  ```

- [ ] **Step 2: Verify the structure**

  ```bash
  ls docs/llms/
  ls docs/llms/components/ | wc -l
  ```

  Expected:

  ```
  components  index.txt
  28
  ```

- [ ] **Step 3: Commit the move**

  ```bash
  git add docs/llms
  git add site/static/llms
  git commit -m "chore: move llms docs to docs/llms as source of truth"
  ```

  Git will detect this as a rename/move.

---

### Task 2: Add /static/llms to site gitignore

**Files:**

- Modify: `site/.gitignore`

- [ ] **Step 1: Append to site/.gitignore**

  Add this line to `site/.gitignore`:

  ```
  /static/llms
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add site/.gitignore
  git commit -m "chore: gitignore generated site/static/llms"
  ```

---

### Task 3: Update site/package.json scripts

**Files:**

- Modify: `site/package.json`

Current scripts (relevant lines):

```json
"dev": "vite dev",
"build": "bun run build:themes && paraglide-js compile --project ./project.inlang --outdir ./src/paraglide && vite build"
```

- [ ] **Step 1: Update both scripts**

  Change `"dev"` to:

  ```json
  "dev": "cp -r ../docs/llms ./static && vite dev",
  ```

  Change `"build"` to:

  ```json
  "build": "cp -r ../docs/llms ./static && bun run build:themes && paraglide-js compile --project ./project.inlang --outdir ./src/paraglide && vite build",
  ```

- [ ] **Step 2: Verify the copy works**

  Run from `site/`:

  ```bash
  cd site && cp -r ../docs/llms ./static && ls static/llms/
  ```

  Expected: `components  index.txt`

- [ ] **Step 3: Verify site/static/llms is now ignored by git**

  ```bash
  git status
  ```

  Expected: `site/static/llms/` should NOT appear as an untracked or modified file.

- [ ] **Step 4: Run full tests to confirm nothing broken**

  From repo root:

  ```bash
  bun run test:ci
  ```

  Expected: all tests pass.

- [ ] **Step 5: Run lint**

  ```bash
  bun run lint
  ```

  Expected: 0 errors (pre-existing warnings are acceptable).

- [ ] **Step 6: Commit**

  ```bash
  git add site/package.json
  git commit -m "chore: copy docs/llms to static in dev and build scripts"
  ```

---

## Final Verification

- [ ] `docs/llms/index.txt` exists and has content
- [ ] `docs/llms/components/` has 28 files
- [ ] `site/static/llms/` is listed in `site/.gitignore`
- [ ] `bun run dev` (from `site/`) would populate `site/static/llms/` before starting vite
- [ ] `git status` shows `site/static/llms/` as ignored
