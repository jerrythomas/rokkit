<script>
	import { GroupedList } from '@rokkit/bits-ui'
	import { Icon } from '@rokkit/ui'

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
	 * @property {Object} fields - Field mapping object for GroupedList component
	 * @property {string} [currentSection] - Currently active section ID
	 * @property {function(string): void} [onNavigate] - Navigation callback function
	 */

	/** @type {SidebarProps} */
	let { sections, fields } = $props()
</script>

<nav class="flex w-full flex-1 pb-8" data-sidebar>
	<GroupedList items={sections} {fields}>
		{#snippet child(proxy)}
			<div class="flex items-center gap-3">
				<Icon name={proxy.get('icon')} data-sidebar-icon />
				<h3 class="text-sm font-medium">
					{proxy.get('text')}
				</h3>
			</div>
		{/snippet}
	</GroupedList>
</nav>
