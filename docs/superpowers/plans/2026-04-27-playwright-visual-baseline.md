# Phase 3: Playwright Visual Baseline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture Playwright visual regression snapshots of every demo app screen as the reference baseline for Phase 5+ theme work.

**Architecture:** Install Playwright in `demo/`, create test helpers for navigation/mode/locale switching, write snapshot tests for each screen (observatory, sessions, setup wizard) across light/dark modes and all three locales (en, es, ar). Tests use `toHaveScreenshot()` for pixel-level regression. The dev server is built+previewed before tests run (same pattern as `site/`).

**Tech Stack:** Playwright, SvelteKit (build+preview), Bun

---

## File Structure

```
demo/
├── playwright.config.ts          — Create: test config (Chrome + Firefox, 1440x900)
├── e2e/
│   ├── helpers.ts                — Create: navigation, mode/locale switching, font wait
│   ├── observatory.e2e.ts        — Create: observatory screen snapshots
│   ├── sessions.e2e.ts           — Create: sessions screen snapshots
│   └── setup-wizard.e2e.ts       — Create: setup wizard screen snapshots
└── package.json                  — Modify: add Playwright devDep + test:e2e script
```

---

### Task 1: Install Playwright and Configure

**Files:**
- Modify: `demo/package.json`
- Create: `demo/playwright.config.ts`

- [ ] **Step 1: Install Playwright**

```bash
cd demo && bun add -d @playwright/test
```

Then install browsers:

```bash
cd demo && bunx playwright install chromium firefox
```

- [ ] **Step 2: Add test script to package.json**

In `demo/package.json`, add to `"scripts"`:

```json
"test:e2e": "playwright test",
"test:e2e:update": "playwright test --update-snapshots"
```

- [ ] **Step 3: Create playwright.config.ts**

Create `demo/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: 'e2e',
	testMatch: /.*\.e2e\.ts/,
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	timeout: 30_000,
	expect: {
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.01
		}
	},
	webServer: {
		command: 'bun run build && bun run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	use: {
		baseURL: 'http://localhost:4173'
	},
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1440, height: 900 }
			}
		},
		{
			name: 'firefox',
			use: {
				...devices['Desktop Firefox'],
				viewport: { width: 1440, height: 900 }
			}
		}
	]
})
```

- [ ] **Step 4: Verify config loads**

```bash
cd demo && bunx playwright test --list
```

Expected: "No tests found" (no test files yet), no config errors.

- [ ] **Step 5: Commit**

```bash
git add demo/package.json demo/bun.lock demo/playwright.config.ts
git commit -m "chore(demo): add Playwright with Chrome + Firefox at 1440x900"
```

---

### Task 2: Test Helpers

**Files:**
- Create: `demo/e2e/helpers.ts`

- [ ] **Step 1: Create helpers.ts**

Create `demo/e2e/helpers.ts`:

```typescript
import type { Page } from '@playwright/test'

export type Locale = 'en' | 'es' | 'ar'
export type Mode = 'light' | 'dark'

const localePrefix: Record<Locale, string> = {
	en: '',
	es: '/es',
	ar: '/ar'
}

/**
 * Navigate to a demo app page in the given locale.
 * English has no URL prefix; Spanish uses /es; Arabic uses /ar.
 */
export async function goTo(page: Page, path: string, locale: Locale = 'en') {
	const prefix = localePrefix[locale]
	await page.goto(`${prefix}${path}`)
	await page.waitForLoadState('networkidle')
	await waitForFonts(page)
}

/** Set color mode via data-mode attribute on <html> */
export async function setMode(page: Page, mode: Mode) {
	await page.evaluate((m) => document.documentElement.setAttribute('data-mode', m), mode)
	// Let CSS transitions settle
	await page.waitForTimeout(300)
}

/**
 * Wait for custom fonts to be loaded.
 * Prevents snapshots from capturing fallback fonts.
 */
async function waitForFonts(page: Page) {
	await page.evaluate(() => document.fonts.ready)
}

/**
 * Get the text direction for a locale.
 * Arabic is RTL, all others are LTR.
 */
export function textDirection(locale: Locale): 'ltr' | 'rtl' {
	return locale === 'ar' ? 'rtl' : 'ltr'
}
```

- [ ] **Step 2: Verify file is valid TypeScript**

```bash
cd demo && bunx tsc --noEmit e2e/helpers.ts --skipLibCheck --esModuleInterop --module nodenext --moduleResolution nodenext 2>&1 || echo "TS check done (warnings OK, Playwright types resolve at runtime)"
```

No blocking errors expected. (Playwright types resolve when tests actually run.)

- [ ] **Step 3: Commit**

```bash
git add demo/e2e/helpers.ts
git commit -m "test(demo): add Playwright helpers — navigation, mode, locale, fonts"
```

---

### Task 3: Observatory Snapshots

**Files:**
- Create: `demo/e2e/observatory.e2e.ts`

The observatory is the main dashboard at `/observatory`. It has: greeting strip, FTR hero, koan card, insights section, recent sessions table, adopted teachings.

- [ ] **Step 1: Create observatory.e2e.ts**

Create `demo/e2e/observatory.e2e.ts`:

```typescript
import { test, expect } from '@playwright/test'
import { goTo, setMode } from './helpers'
import type { Locale, Mode } from './helpers'

test.describe('Observatory', () => {
	// ─── Smoke ──────────────────────────────────────────────────────

	test('page loads and shows greeting', async ({ page }) => {
		await goTo(page, '/observatory')
		await expect(page.locator('.greeting')).toBeVisible()
	})

	test('page shows FTR score', async ({ page }) => {
		await goTo(page, '/observatory')
		await expect(page.locator('.ftr-score')).toBeVisible()
	})

	test('page shows koan card', async ({ page }) => {
		await goTo(page, '/observatory')
		await expect(page.locator('.koan')).toBeVisible()
	})

	test('page shows insights section', async ({ page }) => {
		await goTo(page, '/observatory')
		await expect(page.locator('.insights')).toBeVisible()
	})

	test('page shows sessions table', async ({ page }) => {
		await goTo(page, '/observatory')
		await expect(page.locator('.sessions')).toBeVisible()
	})

	// ─── Full-page snapshots ────────────────────────────────────────

	const matrix: Array<{ locale: Locale; mode: Mode; tag: string }> = [
		{ locale: 'en', mode: 'light', tag: 'en-light' },
		{ locale: 'en', mode: 'dark', tag: 'en-dark' },
		{ locale: 'es', mode: 'light', tag: 'es-light' },
		{ locale: 'ar', mode: 'light', tag: 'ar-rtl-light' },
		{ locale: 'ar', mode: 'dark', tag: 'ar-rtl-dark' }
	]

	for (const { locale, mode, tag } of matrix) {
		test(`full page — ${tag}`, async ({ page }) => {
			await goTo(page, '/observatory', locale)
			await setMode(page, mode)
			await expect(page).toHaveScreenshot(`observatory-${tag}.png`, {
				fullPage: true
			})
		})
	}

	// ─── Section-level snapshots (English, light mode) ──────────────

	test('section: sidebar', async ({ page }) => {
		await goTo(page, '/observatory')
		await setMode(page, 'light')
		const sidebar = page.locator('.sidebar')
		await expect(sidebar).toHaveScreenshot('observatory-sidebar.png')
	})

	test('section: FTR hero', async ({ page }) => {
		await goTo(page, '/observatory')
		await setMode(page, 'light')
		const hero = page.locator('.ftr-hero')
		await expect(hero).toHaveScreenshot('observatory-ftr-hero.png')
	})

	test('section: koan', async ({ page }) => {
		await goTo(page, '/observatory')
		await setMode(page, 'light')
		const koan = page.locator('.koan')
		await expect(koan).toHaveScreenshot('observatory-koan.png')
	})

	test('section: insights', async ({ page }) => {
		await goTo(page, '/observatory')
		await setMode(page, 'light')
		const insights = page.locator('.insights')
		await expect(insights).toHaveScreenshot('observatory-insights.png')
	})

	test('section: sessions table', async ({ page }) => {
		await goTo(page, '/observatory')
		await setMode(page, 'light')
		const sessions = page.locator('.sessions')
		await expect(sessions).toHaveScreenshot('observatory-sessions.png')
	})
})
```

- [ ] **Step 2: Run to discover CSS selectors and fix them**

```bash
cd demo && bunx playwright test e2e/observatory.e2e.ts --project=chromium 2>&1 | head -40
```

The smoke tests will reveal which CSS class names actually exist in the rendered DOM. Read the observatory page source to find the actual selectors:

```bash
# Read the observatory page to find actual class names / selectors
```

Read `demo/src/routes/(app)/observatory/+page.svelte` and `demo/src/routes/(app)/+layout.svelte`. Update the locators in the test to match the actual DOM structure (class names, data attributes, or structural selectors like `main > section:nth-of-type(N)`).

- [ ] **Step 3: Run again — smoke tests pass, snapshots are created**

```bash
cd demo && bunx playwright test e2e/observatory.e2e.ts --project=chromium --update-snapshots
```

Expected: All tests pass. Snapshot PNGs created under `demo/e2e/observatory.e2e.ts-snapshots/`.

- [ ] **Step 4: Run Firefox project too**

```bash
cd demo && bunx playwright test e2e/observatory.e2e.ts --project=firefox --update-snapshots
```

Expected: Firefox snapshots created in the same directory (different suffix per project).

- [ ] **Step 5: Verify snapshot files exist**

```bash
ls demo/e2e/observatory.e2e.ts-snapshots/ | head -20
```

Expected: PNG files named like `observatory-en-light-chromium.png`, `observatory-sidebar-chromium.png`, etc.

- [ ] **Step 6: Commit**

```bash
git add demo/e2e/observatory.e2e.ts demo/e2e/observatory.e2e.ts-snapshots/
git commit -m "test(demo): add observatory visual regression baseline — 5 full-page + 5 section snapshots"
```

---

### Task 4: Sessions Snapshots

**Files:**
- Create: `demo/e2e/sessions.e2e.ts`

The sessions page at `/sessions` has: retro digest cards (going well / not going well / insights), filter tabs, and a sessions table.

- [ ] **Step 1: Read sessions page to find selectors**

Read `demo/src/routes/(app)/sessions/+page.svelte` to identify the actual DOM structure and class names used for:
- The retro digest section (cards)
- The filter bar / tabs
- The sessions table/list

- [ ] **Step 2: Create sessions.e2e.ts**

Create `demo/e2e/sessions.e2e.ts`:

```typescript
import { test, expect } from '@playwright/test'
import { goTo, setMode } from './helpers'

test.describe('Sessions', () => {
	// ─── Smoke ──────────────────────────────────────────────────────

	test('page loads and shows retro cards', async ({ page }) => {
		await goTo(page, '/sessions')
		// Use the actual selector discovered in Step 1
		await expect(page.locator('.retro')).toBeVisible()
	})

	test('page shows sessions list', async ({ page }) => {
		await goTo(page, '/sessions')
		await expect(page.locator('.sessions-list')).toBeVisible()
	})

	// ─── Full-page snapshots ────────────────────────────────────────

	test('full page — light', async ({ page }) => {
		await goTo(page, '/sessions')
		await setMode(page, 'light')
		await expect(page).toHaveScreenshot('sessions-en-light.png', { fullPage: true })
	})

	test('full page — dark', async ({ page }) => {
		await goTo(page, '/sessions')
		await setMode(page, 'dark')
		await expect(page).toHaveScreenshot('sessions-en-dark.png', { fullPage: true })
	})

	test('full page — ar RTL light', async ({ page }) => {
		await goTo(page, '/sessions', 'ar')
		await setMode(page, 'light')
		await expect(page).toHaveScreenshot('sessions-ar-rtl-light.png', { fullPage: true })
	})

	// ─── Section snapshots ──────────────────────────────────────────

	test('section: retro digest', async ({ page }) => {
		await goTo(page, '/sessions')
		await setMode(page, 'light')
		// Use actual selector discovered in Step 1
		const retro = page.locator('.retro')
		await expect(retro).toHaveScreenshot('sessions-retro.png')
	})

	test('section: sessions table', async ({ page }) => {
		await goTo(page, '/sessions')
		await setMode(page, 'light')
		const table = page.locator('.sessions-list')
		await expect(table).toHaveScreenshot('sessions-table.png')
	})

	// ─── Filter interaction ─────────────────────────────────────────

	test('filter tabs change visible sessions', async ({ page }) => {
		await goTo(page, '/sessions')
		// Click a filter tab (e.g. a specific project or language)
		// Use actual selector discovered in Step 1
		const filterTab = page.locator('.filters button').nth(1)
		await filterTab.click()
		// Snapshot the filtered state
		await expect(page).toHaveScreenshot('sessions-filtered.png', { fullPage: true })
	})
})
```

- [ ] **Step 3: Fix selectors to match actual DOM**

After reading the page source in Step 1, update all placeholder selectors (`.retro`, `.sessions-list`, `.filters`) to match the real class names or data attributes.

- [ ] **Step 4: Run and capture baselines**

```bash
cd demo && bunx playwright test e2e/sessions.e2e.ts --update-snapshots
```

Expected: All tests pass. Snapshot PNGs created for both Chromium and Firefox.

- [ ] **Step 5: Commit**

```bash
git add demo/e2e/sessions.e2e.ts demo/e2e/sessions.e2e.ts-snapshots/
git commit -m "test(demo): add sessions visual regression baseline — full-page + section + filtered snapshots"
```

---

### Task 5: Setup Wizard Snapshots

**Files:**
- Create: `demo/e2e/setup-wizard.e2e.ts`

The setup wizard lives at `/setup` (outside the `(app)` layout — no sidebar). It has a left-rail stepper, step content area, and bottom progress bar. The wizard has multiple steps: Welcome, Folders, Projects, etc.

- [ ] **Step 1: Read setup page to find selectors and step navigation**

Read `demo/src/routes/setup/+page.svelte` to identify:
- The stepper rail selector
- The step content area
- How navigation between steps works (Next/Back buttons, stepper clicks)
- Which steps exist and their indices

- [ ] **Step 2: Create setup-wizard.e2e.ts**

Create `demo/e2e/setup-wizard.e2e.ts`:

```typescript
import { test, expect } from '@playwright/test'
import { goTo, setMode } from './helpers'

test.describe('Setup Wizard', () => {
	// ─── Smoke ──────────────────────────────────────────────────────

	test('wizard loads with stepper visible', async ({ page }) => {
		await goTo(page, '/setup')
		// Use actual selector from Step 1
		await expect(page.locator('.stepper')).toBeVisible()
	})

	test('wizard shows first step content', async ({ page }) => {
		await goTo(page, '/setup')
		await expect(page.locator('.step-content')).toBeVisible()
	})

	// ─── Step 1: Welcome ────────────────────────────────────────────

	test('step 1 welcome — light', async ({ page }) => {
		await goTo(page, '/setup')
		await setMode(page, 'light')
		await expect(page).toHaveScreenshot('setup-welcome-light.png', { fullPage: true })
	})

	test('step 1 welcome — dark', async ({ page }) => {
		await goTo(page, '/setup')
		await setMode(page, 'dark')
		await expect(page).toHaveScreenshot('setup-welcome-dark.png', { fullPage: true })
	})

	test('step 1 welcome — ar RTL', async ({ page }) => {
		await goTo(page, '/setup', 'ar')
		await setMode(page, 'light')
		await expect(page).toHaveScreenshot('setup-welcome-ar-rtl.png', { fullPage: true })
	})

	// ─── Step navigation snapshots ──────────────────────────────────
	// Navigate to specific steps and capture their state.
	// The button selector is discovered in Step 1.

	test('step 2 — folders', async ({ page }) => {
		await goTo(page, '/setup')
		await setMode(page, 'light')
		// Click Next to advance to step 2 — use actual button selector from Step 1
		const nextBtn = page.locator('button').filter({ hasText: /continue|next/i })
		await nextBtn.click()
		await expect(page).toHaveScreenshot('setup-folders-light.png', { fullPage: true })
	})

	test('step 3 — projects', async ({ page }) => {
		await goTo(page, '/setup')
		await setMode(page, 'light')
		const nextBtn = page.locator('button').filter({ hasText: /continue|next/i })
		// Advance twice to reach step 3
		await nextBtn.click()
		await nextBtn.click()
		await expect(page).toHaveScreenshot('setup-projects-light.png', { fullPage: true })
	})

	// ─── Section snapshots ──────────────────────────────────────────

	test('section: stepper rail', async ({ page }) => {
		await goTo(page, '/setup')
		await setMode(page, 'light')
		const stepper = page.locator('.stepper')
		await expect(stepper).toHaveScreenshot('setup-stepper-rail.png')
	})

	test('section: stepper rail — mid-wizard', async ({ page }) => {
		await goTo(page, '/setup')
		await setMode(page, 'light')
		const nextBtn = page.locator('button').filter({ hasText: /continue|next/i })
		await nextBtn.click()
		await nextBtn.click()
		// Stepper should show completed + current + pending states
		const stepper = page.locator('.stepper')
		await expect(stepper).toHaveScreenshot('setup-stepper-mid.png')
	})
})
```

- [ ] **Step 3: Fix selectors to match actual DOM**

After reading the page source in Step 1, update all placeholder selectors (`.stepper`, `.step-content`, button text matchers) to match the real class names, data attributes, or text content.

- [ ] **Step 4: Run and capture baselines**

```bash
cd demo && bunx playwright test e2e/setup-wizard.e2e.ts --update-snapshots
```

Expected: All tests pass. Snapshot PNGs created for both Chromium and Firefox.

- [ ] **Step 5: Commit**

```bash
git add demo/e2e/setup-wizard.e2e.ts demo/e2e/setup-wizard.e2e.ts-snapshots/
git commit -m "test(demo): add setup wizard visual regression baseline — welcome, folders, projects, stepper snapshots"
```

---

### Task 6: Full Suite Verification

**Files:**
- No new files. Verification pass.

- [ ] **Step 1: Run the full suite — both browsers**

```bash
cd demo && bunx playwright test
```

Expected: All tests pass across both Chromium and Firefox projects. No snapshot mismatches (this is the baseline run).

- [ ] **Step 2: Count tests and snapshots**

```bash
echo "Test files:" && ls demo/e2e/*.e2e.ts | wc -l
echo "Snapshot dirs:" && ls -d demo/e2e/*.e2e.ts-snapshots/ | wc -l
echo "Total PNGs:" && find demo/e2e -name "*.png" | wc -l
```

Expected: 3 test files, 3 snapshot dirs, ~30+ PNG files (full-page + section snapshots x 2 browsers).

- [ ] **Step 3: Run suite a second time — verify no flaky diffs**

```bash
cd demo && bunx playwright test
```

Expected: All tests pass with zero diffs. If any test fails with a pixel diff, investigate the cause (animation, timestamp, etc.) and add a `waitForTimeout` or mask the dynamic region.

- [ ] **Step 4: If flaky tests found, fix them**

Common fixes:
- Dynamic timestamps: mask with `mask: [page.locator('.date-display')]` in `toHaveScreenshot` options
- CSS transitions: increase `waitForTimeout` in `setMode`
- Animations: add `animations: 'disabled'` to `toHaveScreenshot` options

Re-run and re-capture baselines after fixes:

```bash
cd demo && bunx playwright test --update-snapshots
```

- [ ] **Step 5: Final commit with any stability fixes**

```bash
git add demo/e2e/
git commit -m "test(demo): stabilize visual regression suite — fix flaky snapshots"
```

(Skip this commit if no fixes were needed.)

- [ ] **Step 6: Update journal**

Add entry to `agents/journal.md`:

```markdown
### Phase 3: Playwright Visual Baseline — complete (YYYY-MM-DD)

**What was done:**

- Installed Playwright in `demo/` with Chrome + Firefox at 1440x900
- Created test helpers (`e2e/helpers.ts`): locale navigation, mode switching, font wait
- Observatory snapshots: 5 full-page (en light/dark, es light, ar light/dark) + 5 section-level
- Sessions snapshots: 3 full-page (en light/dark, ar RTL) + 2 section + 1 filtered state
- Setup wizard snapshots: 3 full-page (welcome light/dark, ar RTL) + step navigation + stepper rail
- All tests pass on both Chromium and Firefox with zero flaky diffs

**Tests:** ~30 visual regression tests, ~XX snapshot PNGs

**Commits:** see git log for individual commits
```
