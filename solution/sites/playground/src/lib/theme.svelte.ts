import { themes, type Theme } from './components'

let theme = $state<Theme>('rokkit')

export function getTheme(): Theme {
	return theme
}

export function setTheme(value: Theme) {
	theme = value
}

export { themes, type Theme }
