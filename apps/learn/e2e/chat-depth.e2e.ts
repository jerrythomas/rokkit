import { test, expect, type Page, type Route } from '@playwright/test'
import { gotoHydrated } from './helpers'

/**
 * Deeper checks on the chat: that a change reaches the real component (not just the chat's
 * wrapper), that a reloaded conversation still knows its screen, and the browser side of the
 * server-backed modes — with `/api/chat/interpret` stubbed, since OpenRouter needs a key and
 * System One a local Ollama.
 */
const say = async (page: Page, text: string) => {
	const box = page.locator('[data-chat-composer] textarea')
	await box.fill(text)
	await box.press('Enter')
}
const lastDemo = (page: Page) => page.locator('[data-block-kind="demo"]').last()
const demos = (page: Page) => page.locator('[data-block-kind="demo"]')

/** Answer POST /api/chat/interpret with `reply` (a status, or a reading), recording each body. */
async function stubInterpret(page: Page, reply: (body: Record<string, unknown>) => number | Record<string, unknown>) {
	const bodies: Record<string, unknown>[] = []
	await page.route('**/api/chat/interpret', async (route: Route) => {
		if (route.request().method() !== 'POST') return route.fallback()
		const body = route.request().postDataJSON()
		bodies.push(body)
		const r = reply(body)
		if (typeof r === 'number') return route.fulfill({ status: r, json: { message: `upstream ${r}` } })
		return route.fulfill({ json: { interpretation: r } })
	})
	return bodies
}

test('a variant chip and a live control change the real component, not just the chat’s frame', async ({ page }) => {
	await gotoHydrated(page, '/chat/simulated')
	await say(page, 'show me tabs')
	await expect(lastDemo(page).locator('[data-tabs]').first()).toHaveAttribute('data-orientation', 'horizontal')

	await page.locator('[data-block-suggestion]', { hasText: 'Vertical orientation' }).last().click()
	await expect(demos(page)).toHaveCount(2)
	await expect(lastDemo(page).locator('[data-tabs]').first()).toHaveAttribute('data-orientation', 'vertical')

	await say(page, 'align them to the end')
	await expect(demos(page)).toHaveCount(3)
	const tabs = lastDemo(page).locator('[data-tabs]').first()
	await expect(tabs).toHaveAttribute('data-orientation', 'vertical')
	await expect(tabs).toHaveAttribute('data-align', 'end')
})

test('a reloaded conversation still knows what is on screen', async ({ page }) => {
	await gotoHydrated(page, '/chat/simulated')
	await say(page, 'show me a sortable table')
	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'table')
	await say(page, 'make the rows striped')
	await expect(lastDemo(page).locator('table')).toHaveAttribute('data-table-striped', 'true')

	await page.reload()
	await expect(page.locator('body')).toHaveAttribute('data-hydrated', 'true')
	await expect(lastDemo(page).locator('table')).toHaveAttribute('data-table-striped', 'true')

	// The follow-up acts on the restored screen: the same six products, charted.
	await say(page, 'show the same data as a bar chart')
	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'chart')
	await expect(lastDemo(page)).toContainText('rows [6]')
	await expect(lastDemo(page)).toContainText('Laptop')
})

test('OpenRouter mode: the server’s reading is acted on, and generated data is charted', async ({ page }) => {
	const rows = [
		{ quarter: 'Q1', sales: 120 },
		{ quarter: 'Q2', sales: 150 },
		{ quarter: 'Q3', sales: 170 }
	]
	const bodies = await stubInterpret(page, () => ({ intent: 'show', demo: 'chart', data: rows, confidence: 0.9 }))
	await gotoHydrated(page, '/chat/openrouter')
	await say(page, 'Generate a Q3 sales scenario and chart it')

	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'chart')
	await expect(lastDemo(page)).toContainText('rows [3]')
	await expect(lastDemo(page)).toContainText('x quarter')
	await expect(lastDemo(page).locator('svg').first()).toBeVisible()
	expect(bodies[0]).toMatchObject({ message: 'Generate a Q3 sales scenario and chart it', backend: 'openrouter' })
	expect(typeof bodies[0].model).toBe('string')
})

test('OpenRouter mode: a failure is said, and the local reading answers', async ({ page }) => {
	await stubInterpret(page, () => 429)
	await gotoHydrated(page, '/chat/openrouter')
	await say(page, 'something with nested folders')

	await expect(page.locator('[data-block-kind="prose"]', { hasText: 'OpenRouter didn’t answer' })).toContainText('rate-limited')
	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'tree')
})

test('System One mode: only what the local reader cannot place goes to the server, without the screen’s data', async ({ page }) => {
	const bodies = await stubInterpret(page, () => ({ intent: 'modify', demo: 'list', props: { size: 'lg' }, confidence: 0.9 }))
	await gotoHydrated(page, '/chat/systemone')
	await say(page, 'show me a list')
	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'list')

	await say(page, 'bigger rows please')
	await expect(lastDemo(page).locator('[data-size]').first()).toHaveAttribute('data-size', 'lg')
	expect(bodies).toHaveLength(1)
	expect(bodies[0]).toMatchObject({ message: 'bigger rows please', backend: 'systemone', recent: ['show me a list'] })
	expect((bodies[0].screen as Record<string, unknown>).data).toBeUndefined()
})

test('the picker shows System One only when the server reports it', async ({ page }) => {
	await page.route('**/api/chat/interpret', (route) =>
		route.request().method() === 'GET' ? route.fulfill({ json: { systemone: true, openrouter: true } }) : route.fallback()
	)
	await gotoHydrated(page, '/chat')
	await expect(page.locator('[data-mode-card] h2')).toHaveText(['Simulated', 'System One', 'OpenRouter', 'Web LLM'])
})

test('a message typed while a reply is pending is kept, then sent once the reply lands', async ({ page }) => {
	await gotoHydrated(page, '/chat/simulated')
	await say(page, 'show me a sortable table')
	await say(page, 'make the rows striped') // the composer is busy: this must not be lost or misread
	const box = page.locator('[data-chat-composer] textarea')
	await expect(demos(page)).toHaveCount(1)
	await expect(box).toHaveValue('make the rows striped')

	await box.press('Enter')
	await expect(demos(page)).toHaveCount(2)
	await expect(lastDemo(page).locator('table')).toHaveAttribute('data-table-striped', 'true')
})

test('a variant only the full demo builds is linked, not claimed as a change', async ({ page }) => {
	await gotoHydrated(page, '/chat/simulated')
	await say(page, 'show me tabs')
	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'tabs')
	await expect(page.locator('[data-block-suggestion]', { hasText: 'With icons' })).toHaveCount(0)

	await say(page, 'with icons please')
	await expect(page.locator('[data-block-kind="prose"]').last()).toContainText('built on the full Tabs demo page')
	await expect(lastDemo(page).locator('[data-demo-open]')).toHaveAttribute('href', '/app/tabs?variant=with-icons')
})
