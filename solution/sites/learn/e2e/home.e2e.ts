import { test, expect } from '@playwright/test'
import { setMode, modes } from './helpers'

test.describe('Home page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')
	})

	// ─── Header ──────────────────────────────────────────────────────

	test('header logo is visible', async ({ page }) => {
		const header = page.locator('header').first()
		const logo = header.locator('img[alt="Rokkit Logo"]')
		await expect(logo).toBeVisible()
	})

	test('header shows a version string', async ({ page }) => {
		const version = page.locator('header small')
		await expect(version).toBeVisible()
		// version exists and is non-empty — do not assert exact value
		const text = await version.textContent()
		expect(text?.trim().length).toBeGreaterThan(0)
	})

	test('header theme switcher toggle is present', async ({ page }) => {
		const header = page.locator('header').first()
		// ThemeSwitcherToggle renders a button
		const toggle = header.locator('button').first()
		await expect(toggle).toBeVisible()
	})

	test('header GitHub link is present', async ({ page }) => {
		const header = page.locator('header').first()
		const githubLink = header.locator('a[href*="github.com/jerrythomas/rokkit"]')
		await expect(githubLink).toBeVisible()
	})

	test('header logo links to home', async ({ page }) => {
		const header = page.locator('header').first()
		const logoLink = header.locator('a[href="/"]')
		await expect(logoLink).toBeVisible()
	})

	// ─── Hero section ────────────────────────────────────────────────

	test('hero heading is visible', async ({ page }) => {
		await expect(page.locator('h1')).toContainText('Build Beyond Limits')
	})

	test('hero subheading is visible', async ({ page }) => {
		await expect(page.locator('h2').first()).toContainText('Empowering your UI with Rokkit')
	})

	test('hero introductory text is visible', async ({ page }) => {
		const intro = page.locator('main p').first()
		await expect(intro).toBeVisible()
		const text = await intro.textContent()
		expect(text?.trim().length).toBeGreaterThan(0)
	})

	// ─── CTAs ────────────────────────────────────────────────────────

	test('"Get Started" button is visible and links to introduction', async ({ page }) => {
		const btn = page.locator('a[href="/docs/getting-started/introduction"]')
		await expect(btn).toBeVisible()
		await expect(btn).toContainText('Get Started')
	})

	test('"llms" button is visible and links to llms.txt', async ({ page }) => {
		const btn = page.locator('a[href="/docs/llms.txt"]')
		await expect(btn).toBeVisible()
		await expect(btn).toContainText('llms')
	})

	test('"Get Started" navigates to the introduction page', async ({ page }) => {
		await page.locator('a[href="/docs/getting-started/introduction"]').click()
		await page.waitForLoadState('networkidle')
		await expect(page).toHaveURL('/docs/getting-started/introduction')
	})

	// ─── Why Rokkit section ──────────────────────────────────────────

	test('"Why Rokkit?" heading is visible', async ({ page }) => {
		await expect(page.locator('h2', { hasText: 'Why Rokkit?' })).toBeVisible()
	})

	test('renders all 6 feature cards', async ({ page }) => {
		const section = page.locator('section')
		// Each card wraps an h3 title
		const cards = section.locator('h3')
		await expect(cards).toHaveCount(6)
	})

	test('each feature card has a title and description', async ({ page }) => {
		const section = page.locator('section')
		const titles = section.locator('h3')
		const descriptions = section.locator('p')

		const titleCount = await titles.count()
		const descCount = await descriptions.count()

		expect(titleCount).toBe(6)
		expect(descCount).toBe(6)

		for (let i = 0; i < 6; i++) {
			const text = await titles.nth(i).textContent()
			expect(text?.trim().length).toBeGreaterThan(0)
		}
	})

	const expectedFeatures = [
		'Data-First Design',
		'Composable & Extensible',
		'Consistent & Predictable APIs',
		'Responsive & Themeable',
		'Accessible by Default',
		'Progressive Enhancement'
	]

	for (const title of expectedFeatures) {
		test(`feature card "${title}" is present`, async ({ page }) => {
			await expect(page.locator('h3', { hasText: title })).toBeVisible()
		})
	}

	test('feature card icons render with non-zero size', async ({ page }) => {
		// Icons are <span> elements with solar icon classes inside the section
		const section = page.locator('section')
		const iconSpans = section.locator('span[aria-hidden="true"]')
		const count = await iconSpans.count()
		expect(count).toBeGreaterThanOrEqual(6)

		for (let i = 0; i < count; i++) {
			const box = await iconSpans.nth(i).boundingBox()
			expect(box).not.toBeNull()
			expect(box!.width).toBeGreaterThan(0)
			expect(box!.height).toBeGreaterThan(0)
		}
	})

	// ─── Light / dark mode ───────────────────────────────────────────

	for (const mode of modes) {
		test(`page renders correctly in ${mode} mode`, async ({ page }) => {
			await setMode(page, mode)
			await expect(page.locator('h1')).toBeVisible()
			await expect(page.locator('h2', { hasText: 'Why Rokkit?' })).toBeVisible()
			// Verify the data-mode attribute was applied
			const bodyMode = await page.evaluate(() =>
				document.documentElement.getAttribute('data-mode')
			)
			expect(bodyMode).toBe(mode)
		})
	}
})
