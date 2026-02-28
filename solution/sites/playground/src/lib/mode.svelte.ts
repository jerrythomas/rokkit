export type ColorMode = 'system' | 'light' | 'dark'

let mode = $state<ColorMode>('system')
let resolved = $state<'light' | 'dark'>('light')

function updateResolved() {
	if (mode === 'system') {
		resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	} else {
		resolved = mode
	}
	document.documentElement.setAttribute('data-mode', resolved)
}

export function initMode() {
	updateResolved()
	const mq = window.matchMedia('(prefers-color-scheme: dark)')
	mq.addEventListener('change', updateResolved)
}

export function getMode() {
	return mode
}

export function getResolved() {
	return resolved
}

export function setMode(value: ColorMode) {
	mode = value
	updateResolved()
}
