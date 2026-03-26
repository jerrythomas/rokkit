import type { MarkdownPlugin } from '@rokkit/ui'
import PlotPluginComponent from './PlotPlugin.svelte'
import TablePluginComponent from './TablePlugin.svelte'
import SparklinePluginComponent from './SparklinePlugin.svelte'
import MermaidPluginComponent from './MermaidPlugin.svelte'

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
