<script>
	import { List } from '@rokkit/ui'

	/**
	 * @typedef {Object} Section
	 * @property {string} id - Unique identifier for the section
	 * @property {string} title - Display title of the section
	 * @property {string} description - Description of the section
	 * @property {string} icon - Icon emoji for the section
	 * @property {number} [number] - Optional section number
	 * @property {string} [slug] - Optional URL slug
	 */

	/**
	 * @typedef {Object} SidebarProps
	 * @property {Section[]} sections - Array of tutorial sections
	 * @property {Object} fields - Field mapping object for List component
	 * @property {string} [currentSection] - Currently active section ID
	 * @property {function(string): void} [onNavigate] - Navigation callback function
	 */

	/** @type {SidebarProps} */
	let { sections, fields } = $props()
</script>

<nav class="flex w-full flex-1 pb-8" data-sidebar>
	<List items={sections} {fields} collapsible>
		{#snippet item(data, fieldMap, _handlers, _active)}
			<div class="flex items-center gap-3">
				<span class="{data[fieldMap.icon ?? 'icon']} text-lg" aria-hidden="true"></span>
				<h3 class="text-sm font-medium">
					{data[fieldMap.text ?? 'text']}
				</h3>
			</div>
		{/snippet}
	</List>
</nav>
