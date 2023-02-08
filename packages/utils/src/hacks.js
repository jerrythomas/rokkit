export function adjustViewport() {
	if (typeof window !== undefined) {
		const viewportHeight =
			window.innerHeight < window.outerHeight
				? window.innerHeight + 'px'
				: '100vh'
		document.body.style.visibility = 'hidden'
		document.body.style.setProperty('height', viewportHeight)
		document.body.style.visibility = 'visible'
	}
}
