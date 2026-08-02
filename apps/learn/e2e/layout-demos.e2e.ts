import { test, expect } from '@playwright/test'

// Guards the three layout-primitive demos added for the docs-sync pass:
// Frame, ResponsiveGrid, NavContent. Each demo route sets the shell response
// on mount; the Canvas then renders findById(id).load(), so the component's
// root data-attribute must appear.
const demos = [
	{ path: '/app/frame', attr: '[data-frame]', title: 'Frame' },
	{ path: '/app/responsive-grid', attr: '[data-responsive-grid]', title: 'Responsive Grid' },
	{ path: '/app/nav-content', attr: '[data-nav-content]', title: 'Nav + Content' }
]

for (const demo of demos) {
	test(`${demo.title} demo renders its component`, async ({ page }) => {
		await page.goto(demo.path)
		await expect(page.locator(demo.attr).first()).toBeVisible()
	})
}
