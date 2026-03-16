/**
 * Hover lift action — adds translateY + elevated shadow on hover.
 * Sets transition on mount, applies transform + box-shadow on mouseenter, resets on mouseleave.
 *
 * @param {HTMLElement} node
 * @param {HoverLiftOptions} [options]
 *
 * @typedef {Object} HoverLiftOptions
 * @property {string} [distance='-0.25rem'] Translate distance on hover (negative = up)
 * @property {string} [shadow='0 10px 25px -5px rgba(0,0,0,0.1)'] Box shadow on hover
 * @property {number} [duration=200] Transition duration (ms)
 */

function resolveHoverLiftOpts(options) {
	return {
		distance: '-0.25rem',
		shadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
		duration: 200,
		...options
	}
}

function isReducedMotion() {
	return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function applyHoverLift(node, opts) {
	const originalTransform = node.style.transform
	const originalBoxShadow = node.style.boxShadow
	const originalTransition = node.style.transition

	node.style.transition = `transform ${opts.duration}ms ease, box-shadow ${opts.duration}ms ease`

	function onEnter() {
		node.style.transform = `translateY(${opts.distance})`
		node.style.boxShadow = opts.shadow
	}

	function onLeave() {
		node.style.transform = originalTransform
		node.style.boxShadow = originalBoxShadow
	}

	node.addEventListener('mouseenter', onEnter)
	node.addEventListener('mouseleave', onLeave)

	return () => {
		node.removeEventListener('mouseenter', onEnter)
		node.removeEventListener('mouseleave', onLeave)
		node.style.transform = originalTransform
		node.style.boxShadow = originalBoxShadow
		node.style.transition = originalTransition
	}
}

export function hoverLift(node, options = {}) {
	$effect(() => {
		const opts = resolveHoverLiftOpts(options)
		if (isReducedMotion()) return
		return applyHoverLift(node, opts)
	})
}
