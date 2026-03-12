/**
 * Scroll-triggered reveal action using IntersectionObserver.
 * Applies CSS transitions (opacity + translate) when element enters viewport.
 * When stagger > 0, applies reveal to each child element independently.
 *
 * @param {HTMLElement} node
 * @param {RevealOptions} [options]
 *
 * @typedef {Object} RevealOptions
 * @property {'up' | 'down' | 'left' | 'right' | 'none'} [direction='up'] Slide direction
 * @property {string} [distance='1.5rem'] Slide distance (CSS unit)
 * @property {number} [duration=600] Animation duration (ms)
 * @property {number} [delay=0] Delay before animation starts (ms)
 * @property {number} [stagger=0] Delay increment per child in ms (0 = disabled)
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
			stagger: 0,
			once: true,
			threshold: 0.1,
			easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
			...options
		}

		const reducedMotion =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches

		const isStagger = opts.stagger > 0

		function applyReveal(el) {
			el.style.setProperty('--reveal-duration', `${opts.duration}ms`)
			el.style.setProperty('--reveal-distance', opts.distance)
			el.style.setProperty('--reveal-easing', opts.easing)
			el.setAttribute('data-reveal', opts.direction)
		}

		function cleanReveal(el) {
			el.removeAttribute('data-reveal')
			el.removeAttribute('data-reveal-visible')
			el.style.removeProperty('--reveal-duration')
			el.style.removeProperty('--reveal-distance')
			el.style.removeProperty('--reveal-easing')
			el.style.removeProperty('transition-delay')
		}

		if (isStagger) {
			Array.from(node.children).forEach((child) => applyReveal(child))
		} else {
			applyReveal(node)
			if (opts.delay > 0) {
				node.style.transitionDelay = `${opts.delay}ms`
			}
		}

		if (reducedMotion) {
			if (isStagger) {
				Array.from(node.children).forEach((child) => child.setAttribute('data-reveal-visible', ''))
			} else {
				node.setAttribute('data-reveal-visible', '')
			}
			node.dispatchEvent(new CustomEvent('reveal', { detail: { visible: true } }))
			return () => {
				if (isStagger) {
					Array.from(node.children).forEach((child) => cleanReveal(child))
				} else {
					cleanReveal(node)
				}
			}
		}

		let timers = []

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						if (isStagger) {
							timers.forEach((t) => clearTimeout(t))
							const kids = Array.from(node.children)
							timers = kids.map((child, i) => {
								if (!child.hasAttribute('data-reveal')) applyReveal(child)
								return setTimeout(
									() => child.setAttribute('data-reveal-visible', ''),
									opts.delay + i * opts.stagger
								)
							})
						} else {
							node.setAttribute('data-reveal-visible', '')
						}
						node.dispatchEvent(new CustomEvent('reveal', { detail: { visible: true } }))
						if (opts.once) observer.unobserve(node)
					} else if (!opts.once) {
						if (isStagger) {
							timers.forEach((t) => clearTimeout(t))
							timers = []
							Array.from(node.children).forEach((child) =>
								child.removeAttribute('data-reveal-visible')
							)
						} else {
							node.removeAttribute('data-reveal-visible')
						}
						node.dispatchEvent(new CustomEvent('reveal', { detail: { visible: false } }))
					}
				}
			},
			{ threshold: opts.threshold }
		)

		observer.observe(node)

		return () => {
			timers.forEach((t) => clearTimeout(t))
			observer.disconnect()
			if (isStagger) {
				Array.from(node.children).forEach((child) => cleanReveal(child))
			} else {
				cleanReveal(node)
			}
		}
	})
}
