/**
 * Plugin display config — app-level switch that governs whether the
 * plugins (PlotPlugin, TablePlugin, FormPlugin, …) expose developer
 * affordances around their rendered output.
 *
 * Just one flag: `codeVisible`. When true, plugins show:
 *   - a "View code" toggle that opens the source fence below the
 *     component (the component stays visible)
 *   - the copy / download / export-svg buttons inside CodeBlock and
 *     on the chart itself
 *
 * Default: false — end-user surfaces stay clean. Developer surfaces
 * (this demo's chat, docs sites) flip it at the app root:
 *
 *   import { configurePluginDisplay } from '@rokkit/blocks'
 *   configurePluginDisplay({ codeVisible: true })
 *
 * Or mutate directly:
 *
 *   import { pluginDisplay } from '@rokkit/blocks'
 *   pluginDisplay.codeVisible = true
 *
 * Plugins read this synchronously at render time. Changes propagate
 * to every mounted instance because the store is $state.
 */

export interface PluginDisplayConfig {
	codeVisible: boolean
}

export const pluginDisplay = $state<PluginDisplayConfig>({
	codeVisible: false
})

export function configurePluginDisplay(
	next: Partial<PluginDisplayConfig>
): void {
	for (const key of Object.keys(next) as Array<keyof PluginDisplayConfig>) {
		const value = next[key]
		if (value !== undefined) pluginDisplay[key] = value
	}
}
