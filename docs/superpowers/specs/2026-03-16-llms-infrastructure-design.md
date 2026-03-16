# LLMs Docs Infrastructure Design

## Goal

Make `docs/llms/` the source of truth for all LLM-facing documentation — committed to git and visible on GitHub — with a copy step that delivers the files to `site/static/llms/` for serving.

## Problem

Currently the 29 `.txt` files in `site/static/llms/` are the only copy. They are:
- Not visible on GitHub (inside `site/static/`, buried in the site package)
- Easy to accidentally overwrite or lose during site rebuilds
- Not co-located with the rest of the project documentation

## Design

### Source location

```
docs/llms/           ← source of truth (committed)
  index.txt
  breadcrumbs.txt
  button.txt
  ... (all 29 current files)
```

### Generated location

```
site/static/llms/    ← copy, gitignored
```

### Copy step

In `site/package.json`:

```json
"dev": "cp -r ../docs/llms ./static && vite dev",
"build": "cp -r ../docs/llms ./static && bun run build:themes && paraglide-js compile --project ./project.inlang --outdir ./src/paraglide && vite build"
```

- `dev` prepends the copy directly — bun does not run `pre<script>` hooks automatically
- `build` prepends the copy so production builds include the latest docs

### Gitignore

Add to `site/.gitignore`:
```
/static/llms
```

This prevents the generated copy from being committed while keeping the source in `docs/llms/`.

### Migration

1. Create `docs/llms/`
2. Move all 29 files from `site/static/llms/` → `docs/llms/`
3. Add `/static/llms` to `site/.gitignore`
4. Update `site/package.json` scripts
5. Run `bun run predev` to verify the copy works
6. Commit

## What this enables

- `docs/llms/` is browseable on GitHub alongside `docs/features/` and `docs/design/`
- Future content additions go in `docs/llms/` — no need to touch the site package
- The copy step is a one-liner — no build tooling complexity
