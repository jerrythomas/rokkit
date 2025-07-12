<script>
	import { GroupedList } from '@rokkit/bits-ui'

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
	let { sections, fields, currentSection, onNavigate } = $props()
</script>

<nav class="flex w-full flex-1">
	<GroupedList items={sections} {fields} onSelect={onNavigate}>
		{#snippet child(proxy)}
			<div class="flex w-full flex-col">
				<div class="flex items-center gap-3">
					<div class="text-primary-600 dark:text-primary-400 text-xl">
						{proxy.get('icon')}
					</div>
					<h3 class="text-neutral-overlay text-sm font-medium">
						{proxy.get('text')}
					</h3>
				</div>
			</div>
		{/snippet}
	</GroupedList>
</nav>
