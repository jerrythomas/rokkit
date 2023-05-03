/**
 * Function to change the viewport height on mobile browsers to account for the address bar
 *
 * @param {boolean} [browser=false] indicates whether the device is a browser
 * @param {boolean} [small=false] indicates whether the device is a small mobile device
 */
export function adjustViewport(browser = false, small = false) {
	if (browser) {
		const viewportHeight =
			window.innerHeight != window.outerHeight && small
				? window.innerHeight + 'px'
				: '100vh'
		document.body.style.visibility = 'hidden'
		document.body.style.setProperty('--viewport-height', viewportHeight)
		document.body.style.visibility = 'visible'
	}
}

// Change the viewport height on mobile browsers to account for the address bar
