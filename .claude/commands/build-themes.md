---
description: Rebuild the themes package and verify CSS output. Run this after ANY change to packages/themes/src/**
---

$ARGUMENTS

Build the themes package and verify the output:

```bash
cd packages/themes && bun run build
```

Then check that the dist files were updated:
```bash
ls -la packages/themes/dist/
```

Expected output files:
- `base.css`
- `rokkit.css`
- `minimal.css`
- `material.css`
- `glass.css`

## When to Run

- After ANY change to `packages/themes/src/**/*.css`
- After adding a new CSS file and importing it in an index
- Before verifying theme styles in the browser

## Verify in Browser

After building, open:
- `http://localhost:5175/playground/components/<changed-component>`
- Use the toolbar Dropdown to cycle through all 4 themes
- Verify no gradient bleed-through from rokkit into minimal/material/glass
