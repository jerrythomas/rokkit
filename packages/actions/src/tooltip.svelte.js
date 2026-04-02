/**
 * Tooltip action — attaches an accessible tooltip to any element.
 *
 * Triggers on mouseenter (with configurable delay) and focusin.
 * Hides on mouseleave, focusout, and Escape.
 * Auto-flips position when the preferred side overflows the viewport.
 *
 * @param {HTMLElement} node
 * @param {object} [options]
 * @param {string} [options.content=''] Tooltip text
 * @param {'top'|'bottom'|'left'|'right'} [options.position='top'] Preferred position
 * @param {number} [options.delay=300] Show delay in ms
 */

const GAP = 6

function uid() {
	return `tt-${Math.random().toString(36).slice(2, 9)}`
}

function getPositionedAncestor(el) {
	let parent = el.parentElement
	while (parent && parent !== document.body) {
		const pos = getComputedStyle(parent).position
		if (['relative', 'absolute', 'fixed', 'sticky'].includes(pos)) return parent
		parent = parent.parentElement
	}
	return document.body
}

function resolveFlip(triggerRect, tooltipRect, preferred) {
	const vw = window.innerWidth
	const vh = window.innerHeight
	const fits = {
		top: triggerRect.top >= tooltipRect.height + GAP,
		bottom: triggerRect.bottom + tooltipRect.height + GAP <= vh,
		left: triggerRect.left >= tooltipRect.width + GAP,
		right: triggerRect.right + tooltipRect.width + GAP <= vw
	}
	if (fits[preferred]) return preferred
	const flip = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }
	if (fits[flip[preferred]]) return flip[preferred]
	return Object.keys(fits).find((p) => fits[p]) ?? preferred
}

function positionTooltip(trigger, tooltipEl, preferred) {
	const triggerRect = trigger.getBoundingClientRect()
	const container = tooltipEl.parentElement
	const containerRect = container.getBoundingClientRect()

	// Measure tooltip without layout thrash
	tooltipEl.style.visibility = 'hidden'
	tooltipEl.style.position = 'absolute'
	const tooltipRect = tooltipEl.getBoundingClientRect()
	tooltipEl.style.visibility = ''

	const pos = resolveFlip(triggerRect, tooltipRect, preferred)
	tooltipEl.setAttribute('data-tooltip-position', pos)

	let top, left
	switch (pos) {
		case 'top':
			top = triggerRect.top - containerRect.top - tooltipRect.height - GAP
			left = triggerRect.left - containerRect.left + (triggerRect.width - tooltipRect.width) / 2
			break
		case 'bottom':
			top = triggerRect.bottom - containerRect.top + GAP
			left = triggerRect.left - containerRect.left + (triggerRect.width - tooltipRect.width) / 2
			break
		case 'left':
			top = triggerRect.top - containerRect.top + (triggerRect.height - tooltipRect.height) / 2
			left = triggerRect.left - containerRect.left - tooltipRect.width - GAP
			break
		case 'right':
			top = triggerRect.top - containerRect.top + (triggerRect.height - tooltipRect.height) / 2
			left = triggerRect.right - containerRect.left + GAP
			break
		default:
			top = 0
			left = 0
	}

	tooltipEl.style.top = `${top}px`
	tooltipEl.style.left = `${left}px`
}

export function tooltip(node, options = {}) {
	$effect(() => {
		const opts = { content: '', position: 'top', delay: 300, ...options }
		const id = uid()

		const el = document.createElement('div')
		el.setAttribute('data-tooltip-content', '')
		el.setAttribute('data-tooltip-position', opts.position)
		el.setAttribute('data-tooltip-visible', 'false')
		el.id = id
		el.setAttribute('role', 'tooltip')
		el.textContent = opts.content

		node.setAttribute('data-tooltip-trigger', '')
		node.setAttribute('aria-describedby', id)

		const container = getPositionedAncestor(node)
		container.appendChild(el)

		let timer = null

		function show() {
			positionTooltip(node, el, opts.position)
			el.setAttribute('data-tooltip-visible', 'true')
		}

		function hide() {
			clearTimeout(timer)
			el.setAttribute('data-tooltip-visible', 'false')
		}

		function onMouseEnter() {
			timer = setTimeout(show, opts.delay)
		}

		function onMouseLeave() {
			clearTimeout(timer)
			hide()
		}

		function onKeydown(e) {
			if (e.key === 'Escape') hide()
		}

		node.addEventListener('mouseenter', onMouseEnter)
		node.addEventListener('mouseleave', onMouseLeave)
		node.addEventListener('focusin', show)
		node.addEventListener('focusout', hide)
		node.addEventListener('keydown', onKeydown)

		return () => {
			clearTimeout(timer)
			node.removeAttribute('data-tooltip-trigger')
			node.removeAttribute('aria-describedby')
			node.removeEventListener('mouseenter', onMouseEnter)
			node.removeEventListener('mouseleave', onMouseLeave)
			node.removeEventListener('focusin', show)
			node.removeEventListener('focusout', hide)
			node.removeEventListener('keydown', onKeydown)
			el.remove()
		}
	})
}
