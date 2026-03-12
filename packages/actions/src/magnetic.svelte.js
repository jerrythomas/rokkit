/**
 * Magnetic action — element shifts subtly toward the cursor on hover.
 * Calculates cursor offset from element center and translates proportionally.
 *
 * @param {HTMLElement} node
 * @param {MagneticOptions} [options]
 *
 * @typedef {Object} MagneticOptions
 * @property {number} [strength=0.3] Maximum displacement as fraction of element size (0–1)
 * @property {number} [duration=300] Transition duration for return to center (ms)
 */
export function magnetic(node, options = {}) {
	$effect(() => {
		const opts = {
			strength: 0.3,
			duration: 300,
			...options
		}

		const reducedMotion =
			typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

		if (reducedMotion) return

		const originalTransform = node.style.transform
		const originalTransition = node.style.transition

		node.style.transition = `transform ${opts.duration}ms ease`

		function onMove(e) {
			const rect = node.getBoundingClientRect()
			const centerX = rect.left + rect.width / 2
			const centerY = rect.top + rect.height / 2

			const offsetX = (e.clientX - centerX) * opts.strength
			const offsetY = (e.clientY - centerY) * opts.strength

			node.style.transition = 'none'
			node.style.transform = `translate(${offsetX}px, ${offsetY}px)`
		}

		function onLeave() {
			node.style.transition = `transform ${opts.duration}ms ease`
			node.style.transform = originalTransform
		}

		node.addEventListener('mousemove', onMove)
		node.addEventListener('mouseleave', onLeave)

		return () => {
			node.removeEventListener('mousemove', onMove)
			node.removeEventListener('mouseleave', onLeave)
			node.style.transform = originalTransform
			node.style.transition = originalTransition
		}
	})
}
