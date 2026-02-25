/**
 * Scroll-triggered reveal action using IntersectionObserver.
 * Applies CSS transitions (opacity + translate) when element enters viewport.
 *
 * @param {HTMLElement} node
 * @param {RevealOptions} [options]
 *
 * @typedef {Object} RevealOptions
 * @property {'up' | 'down' | 'left' | 'right' | 'none'} [direction='up'] Slide direction
 * @property {string} [distance='1.5rem'] Slide distance (CSS unit)
 * @property {number} [duration=600] Animation duration (ms)
 * @property {number} [delay=0] Delay before animation starts (ms)
 * @property {boolean} [once=true] Only animate once
 * @property {number} [threshold=0.1] IntersectionObserver threshold (0–1)
 * @property {string} [easing='cubic-bezier(0.4, 0, 0.2, 1)'] CSS easing function
 */
export function reveal(node, options = {}) {
	$effect(() => {
		const opts = {
			direction: 'up',
			distance: '1.5rem',
			duration: 600,
			delay: 0,
			once: true,
			threshold: 0.1,
			easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
			...options
		}

		const reducedMotion =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches

		// Set CSS custom properties for the transition
		node.style.setProperty('--reveal-duration', `${opts.duration}ms`)
		node.style.setProperty('--reveal-distance', opts.distance)
		node.style.setProperty('--reveal-easing', opts.easing)

		// Apply direction attribute (CSS uses this for initial translate)
		node.setAttribute('data-reveal', opts.direction)

		if (opts.delay > 0) {
			node.style.transitionDelay = `${opts.delay}ms`
		}

		if (reducedMotion) {
			node.setAttribute('data-reveal-visible', '')
			node.dispatchEvent(new CustomEvent('reveal', { detail: { visible: true } }))
			return () => {
				node.removeAttribute('data-reveal')
				node.removeAttribute('data-reveal-visible')
				node.style.removeProperty('--reveal-duration')
				node.style.removeProperty('--reveal-distance')
				node.style.removeProperty('--reveal-easing')
			}
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						node.setAttribute('data-reveal-visible', '')
						node.dispatchEvent(new CustomEvent('reveal', { detail: { visible: true } }))
						if (opts.once) observer.unobserve(node)
					} else if (!opts.once) {
						node.removeAttribute('data-reveal-visible')
						node.dispatchEvent(new CustomEvent('reveal', { detail: { visible: false } }))
					}
				}
			},
			{ threshold: opts.threshold }
		)

		observer.observe(node)

		return () => {
			observer.disconnect()
			node.removeAttribute('data-reveal')
			node.removeAttribute('data-reveal-visible')
			node.style.removeProperty('--reveal-duration')
			node.style.removeProperty('--reveal-distance')
			node.style.removeProperty('--reveal-easing')
			if (opts.delay > 0) node.style.removeProperty('transition-delay')
		}
	})
}
