import './animate'
import { ResizeObserver } from './resize-observer'

export * from './match-media'
export * from './element'

global.ResizeObserver = ResizeObserver
