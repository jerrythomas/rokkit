import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import base from '../dist/base.css?raw'
import rokkit from '../dist/rokkit.css?raw'
import minimal from '../dist/minimal.css?raw'
import material from '../dist/material.css?raw'
import frosted from '../dist/frosted.css?raw'
import zenSumi from '../dist/zen-sumi.css?raw'

/**
 * #174 — a switch's thumb travel belongs to its SIZE, under every style.
 *
 * Base sets the travel per size; a style that restated one travel on
 * `[data-style] [data-switch] [data-switch-thumb]` (same specificity, loaded later) won for
 * every size, so the sm thumb overshot its track and the lg one stopped short.
 *
 * This runs over the BUILT css (dist/, `bun run build` in packages/themes) because the build
 * is what consumers load, and only a real browser resolves the cascade and measures the box.
 * The geometry is written out independently of the css: a thumb inset by `gap` on every side
 * of the track has `track width − thumb − 2·gap` to travel.
 */
const STYLES = {
	rokkit,
	minimal,
	material,
	frosted,
	'zen-sumi': zenSumi
}

/** The consumer's reset (UnoCSS/Tailwind preflight): border-box, solid zero borders. */
const PREFLIGHT = '*,::before,::after{box-sizing:border-box;border:0 solid}'

const SIZES = [
	{ size: 'sm', travel: '0.75rem', track: 28, thumb: 12, gap: 2 },
	{ size: 'md', travel: '1.25rem', track: 44, thumb: 18, gap: 3 },
	{ size: 'lg', travel: '1.5rem', track: 56, thumb: 24, gap: 4 }
] as const

const sheet = document.createElement('style')

beforeAll(() => {
	document.head.appendChild(sheet)
	const still = document.createElement('style')
	still.textContent = '*{transition:none!important}'
	document.head.appendChild(still)
})

afterEach(() => {
	document.body.replaceChildren()
})

/** The Switch component's markup: button[data-switch] > track > thumb. */
function mount(style: string, size: string, checked: boolean) {
	document.body.dataset.style = style
	const button = document.createElement('button')
	button.type = 'button'
	button.setAttribute('role', 'switch')
	button.setAttribute('data-switch', '')
	button.setAttribute('data-switch-size', size)
	button.setAttribute('aria-checked', String(checked))
	const track = document.createElement('span')
	track.setAttribute('data-switch-track', '')
	const thumb = document.createElement('span')
	thumb.setAttribute('data-switch-thumb', '')
	track.append(thumb)
	button.append(track)
	document.body.replaceChildren(button)
	return { track: track.getBoundingClientRect(), thumb: thumb.getBoundingClientRect(), el: thumb }
}

describe.each(Object.entries(STYLES))('%s switch', (style, css) => {
	beforeAll(() => {
		sheet.textContent = `${PREFLIGHT}\n${base}\n${css}`
	})

	it.each(SIZES)('$size travels $travel', ({ size, travel }) => {
		const { el } = mount(style, size, false)
		expect(getComputedStyle(el).getPropertyValue('--switch-thumb-travel').trim()).toBe(travel)
	})

	it.each(SIZES)('$size thumb sits $gap px inside the track, off and on', ({ size, track, thumb, gap }) => {
		const off = mount(style, size, false)
		expect(off.track.width).toBeCloseTo(track, 1)
		expect(off.thumb.width).toBeCloseTo(thumb, 1)
		expect(off.thumb.left - off.track.left).toBeCloseTo(gap, 1)
		expect(off.thumb.top - off.track.top).toBeCloseTo(gap, 1)

		const on = mount(style, size, true)
		expect(on.track.right - on.thumb.right).toBeCloseTo(gap, 1)
		expect(on.thumb.top - on.track.top).toBeCloseTo(gap, 1)
	})
})
