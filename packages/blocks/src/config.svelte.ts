/**
 * Plugin display config — app-level switches that govern what affordances
 * the plugins (PlotPlugin, TablePlugin, FormPlugin, …) expose around their
 * rendered output.
 *
 * The defaults are **end-user** safe: no code toggle, no copy, no download,
 * no export. A product aimed at developers (docs, playgrounds) enables the
 * affordances at the app root:
 *
 *   import { configurePluginDisplay } from '@rokkit/blocks'
 *   configurePluginDisplay({ codeVisible: true, allowCopy: true })
 *
 * Or directly mutate the reactive state:
 *
 *   import { pluginDisplay } from '@rokkit/blocks'
 *   pluginDisplay.codeVisible = true
 *
 * Plugins read this store synchronously at render time. Changes propagate
 * to every mounted plugin instance because the store is $state.
 */

export interface PluginDisplayConfig {
	/**
	 * Show a "view code" toggle next to the rendered component. When true,
	 * the user can click to reveal the source fence below the component
	 * (the component stays visible). Default: false — end-user mode hides
	 * the toggle entirely.
	 */
	codeVisible: boolean
	/** Show a "copy code" button in the CodeBlock chrome. Default: false. */
	allowCopy: boolean
	/** Show a "download as file" button in the CodeBlock chrome. Default: false. */
	allowDownload: boolean
	/** Show "Export SVG" / "Export PNG" actions on rendered charts. Default: false. */
	allowExport: boolean
}

export const pluginDisplay = $state<PluginDisplayConfig>({
	codeVisible: false,
	allowCopy: false,
	allowDownload: false,
	allowExport: false
})

export function configurePluginDisplay(
	next: Partial<PluginDisplayConfig>
): void {
	for (const key of Object.keys(next) as Array<keyof PluginDisplayConfig>) {
		const value = next[key]
		if (value !== undefined) pluginDisplay[key] = value
	}
}
