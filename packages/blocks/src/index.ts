import type { MarkdownPlugin } from '@rokkit/ui'
import PlotPluginComponent from './PlotPlugin.svelte'
import TablePluginComponent from './TablePlugin.svelte'
import SparklinePluginComponent from './SparklinePlugin.svelte'
import MermaidPluginComponent from './MermaidPlugin.svelte'
import FormPluginComponent from './FormPlugin.svelte'
import ListPluginComponent from './ListPlugin.svelte'
import StepperPluginComponent from './StepperPlugin.svelte'

export { pluginDisplay, configurePluginDisplay, type PluginDisplayConfig } from './config.svelte.js'

export const PlotPlugin: MarkdownPlugin = {
	language: 'plot',
	component: PlotPluginComponent
}

export const TablePlugin: MarkdownPlugin = {
	language: 'table',
	component: TablePluginComponent
}

export const SparklinePlugin: MarkdownPlugin = {
	language: 'sparkline',
	component: SparklinePluginComponent
}

export const MermaidPlugin: MarkdownPlugin = {
	language: 'mermaid',
	component: MermaidPluginComponent
}

export const FormPlugin: MarkdownPlugin = {
	language: 'form',
	component: FormPluginComponent
}

export const ListPlugin: MarkdownPlugin = {
	language: 'list',
	component: ListPluginComponent
}

export const StepperPlugin: MarkdownPlugin = {
	language: 'stepper',
	component: StepperPluginComponent
}
