import type { MarkdownPlugin } from '@rokkit/ui'
import {
	PlotPlugin,
	TablePlugin,
	FormPlugin,
	ListPlugin,
	StepperPlugin,
	SparklinePlugin,
	MermaidPlugin
} from '@rokkit/blocks'

/**
 * The block-plugin list shared by every live-markdown surface: the chat demo's
 * BlockList and the guides' GuidePage both render fenced ```plot / ```sparkline
 * / ```table / … blocks as live components from this single source.
 */
export const BLOCK_PLUGINS: MarkdownPlugin[] = [
	PlotPlugin,
	TablePlugin,
	FormPlugin,
	ListPlugin,
	StepperPlugin,
	SparklinePlugin,
	MermaidPlugin
]
