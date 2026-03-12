import './animate'
import { ResizeObserver } from './resize-observer'
import { IntersectionObserver } from './intersection-observer'

// skipcq: JS-E1004 - Needed for exposing all functions
export * from './match-media'
// skipcq: JS-E1004 - Needed for exposing all functions
export * from './element'

global.ResizeObserver = ResizeObserver
global.IntersectionObserver = IntersectionObserver

// JSDOM doesn't implement document.execCommand (used by Code.svelte clipboard)
if (typeof document !== 'undefined' && !document.execCommand) {
	document.execCommand = () => false
}
