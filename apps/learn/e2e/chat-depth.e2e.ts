import { test, expect, type Page, type Route } from '@playwright/test'
import { gotoHydrated } from './helpers'

/**
 * Deeper checks on the chat: that a change reaches the real component (not just the chat's
 * wrapper), that a reloaded conversation still knows its screen, and the browser side of the
 * server-backed modes — with `/api/chat/interpret` stubbed, since OpenRouter needs a key and
 * System One the visitor's own Ollama (both stubbed here).
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

test('System One mode: the browser asks the visitor’s own Ollama, only what it cannot place, never the data', async ({ page }) => {
	const choice = (c: string) => ({ type: 'choice', choice: c, confidence: 0.9, probabilities: { [c]: 0.9 } })
	const sent: Record<string, unknown>[] = []
	await page.route('http://localhost:11434/v1/systemone', async (route) => {
		const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' }
		if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
		sent.push(route.request().postDataJSON())
		return route.fulfill({ headers: cors, json: { answers: { intent: choice('modify'), demo: choice('list'), 'prop:size': choice('lg') } } })
	})
	await gotoHydrated(page, '/chat/systemone')
	await say(page, 'show me a list')
	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'list')

	await say(page, 'bigger rows please')
	await expect(lastDemo(page).locator('[data-size]').first()).toHaveAttribute('data-size', 'lg')
	expect(sent).toHaveLength(1)
	expect(sent[0]).toMatchObject({ model: 'nimble', state: { message: 'bigger rows please', recent: ['show me a list'] } })
	expect((sent[0].state as Record<string, Record<string, unknown>>).on_screen.data).toBeUndefined()
	expect(Object.keys(sent[0].questions as object)).toEqual(expect.arrayContaining(['intent', 'demo', 'prop:size']))
})

test('System One mode: an unreachable Ollama is explained, with the command for this site', async ({ page }) => {
	await page.route('http://localhost:11434/v1/systemone', (route) => route.abort('connectionrefused'))
	await gotoHydrated(page, '/chat/systemone')
	await say(page, 'something with nested folders')
	const note = page.locator('[data-block-kind="prose"]', { hasText: 'System One didn’t answer' })
	await expect(note).toContainText('OLLAMA_ORIGINS=http://localhost:4183 ollama serve')
	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'tree')
})

test('the picker offers System One, without probing the visitor’s localhost on load', async ({ page }) => {
	const probes: string[] = []
	page.on('request', (r) => {
		if (r.url().startsWith('http://localhost:11434')) probes.push(r.url())
	})
	await gotoHydrated(page, '/chat')
	await expect(page.locator('[data-mode-card] h2')).toHaveText(['Simulated', 'System One', 'OpenRouter', 'Web LLM'])
	expect(probes).toEqual([])
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

test('the System One page shows how to set up Ollama for this site, and checks it on request', async ({ page }) => {
	const probes: string[] = []
	page.on('request', (r) => {
		if (r.url().startsWith('http://localhost:11434')) probes.push(r.url())
	})
	await gotoHydrated(page, '/chat/systemone')
	const panel = page.locator('[data-ollama-setup]')
	await expect(panel).toBeVisible()
	await expect(panel).toContainText('ollama pull nimble')
	await expect(panel).toContainText('OLLAMA_ORIGINS=http://localhost:4183 ollama serve')
	await expect(panel).toContainText('local network')
	expect(probes).toEqual([]) // nothing contacts localhost until the visitor asks

	await page.route('http://localhost:11434/api/tags', (route) =>
		route.fulfill({ headers: { 'Access-Control-Allow-Origin': '*' }, json: { models: [{ name: 'nimble:latest' }] } })
	)
	await panel.getByRole('button', { name: /check connection/i }).click()
	// Connected: the panel folds to its summary, which says so, and stays folded next visit.
	await expect(page.locator('[data-ollama-status="ready"]')).toBeVisible()
	await expect(panel).not.toHaveAttribute('open')
	await page.reload()
	await expect(page.locator('body')).toHaveAttribute('data-hydrated', 'true')
	await expect(page.locator('[data-ollama-setup]')).not.toHaveAttribute('open')
	await expect(page.locator('[data-ollama-steps] > li').first()).toHaveCSS('list-style-type', 'decimal')
})

test('the setup panel says what is wrong when Ollama cannot be reached', async ({ page }) => {
	await page.route('http://localhost:11434/api/tags', (route) => route.abort('connectionrefused'))
	await gotoHydrated(page, '/chat/systemone')
	await page.locator('[data-ollama-setup]').getByRole('button', { name: /check connection/i }).click()
	await expect(page.locator('[data-ollama-status="unreachable"]')).toContainText('OLLAMA_ORIGINS')
})
