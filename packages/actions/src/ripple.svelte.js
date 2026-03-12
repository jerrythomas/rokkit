/**
 * Ripple action — material-design inspired click ripple effect.
 * Appends a circular expanding span at click coordinates that scales and fades out.
 *
 * @param {HTMLElement} node
 * @param {RippleOptions} [options]
 *
 * @typedef {Object} RippleOptions
 * @property {string} [color='currentColor'] Ripple color
 * @property {number} [opacity=0.15] Ripple opacity
 * @property {number} [duration=500] Ripple animation duration (ms)
 */
export function ripple(node, options = {}) {
	$effect(() => {
		const opts = {
			color: 'currentColor',
			opacity: 0.15,
			duration: 500,
			...options
		}

		const reducedMotion =
			typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

		if (reducedMotion) return

		// Ensure host can contain the ripple
		const originalOverflow = node.style.overflow
		const originalPosition = node.style.position
		const computed = getComputedStyle(node).position
		if (!computed || computed === 'static') {
			node.style.position = 'relative'
		}
		node.style.overflow = 'hidden'

		function onClick(e) {
			const rect = node.getBoundingClientRect()
			const size = Math.max(rect.width, rect.height) * 2
			const x = e.clientX - rect.left - size / 2
			const y = e.clientY - rect.top - size / 2

			const span = document.createElement('span')
			span.style.position = 'absolute'
			span.style.left = `${x}px`
			span.style.top = `${y}px`
			span.style.width = `${size}px`
			span.style.height = `${size}px`
			span.style.borderRadius = '50%'
			span.style.background = opts.color
			span.style.opacity = String(opts.opacity)
			span.style.transform = 'scale(0)'
			span.style.pointerEvents = 'none'
			span.style.animation = `rokkit-ripple ${opts.duration}ms ease-out forwards`

			node.appendChild(span)
			span.addEventListener('animationend', () => span.remove(), { once: true })

			// Fallback removal in case animationend doesn't fire (JSDOM)
			setTimeout(() => {
				if (span.parentNode) span.remove()
			}, opts.duration + 100)
		}

		// Inject keyframes if not already present
		if (!document.querySelector('#rokkit-ripple-keyframes')) {
			const style = document.createElement('style')
			style.id = 'rokkit-ripple-keyframes'
			style.textContent = `
				@keyframes rokkit-ripple {
					to {
						transform: scale(1);
						opacity: 0;
					}
				}
			`
			document.head.appendChild(style)
		}

		node.addEventListener('click', onClick)

		return () => {
			node.removeEventListener('click', onClick)
			node.style.overflow = originalOverflow
			node.style.position = originalPosition
		}
	})
}
