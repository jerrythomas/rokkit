import './animate'
import { ResizeObserver } from './resize-observer'

// skipcq: JS-E1004 - Needed for exposing all functions
export * from './match-media'
// skipcq: JS-E1004 - Needed for exposing all functions
export * from './element'

global.ResizeObserver = ResizeObserver
