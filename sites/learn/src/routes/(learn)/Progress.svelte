<script>
	/**
	 * @typedef {Object} Section
	 * @property {string} id - Unique identifier for the section
	 * @property {string} title - Display title of the section
	 * @property {string} description - Description of the section
	 * @property {string} icon - Icon emoji for the section
	 */

	/**
	 * @typedef {Object} ProgressProps
	 * @property {Section[]} sections - Array of tutorial sections (can be grouped or flat)
	 * @property {string} [currentSection] - Currently active section ID
	 */

	/** @type {ProgressProps} */
	let { sections, currentSection } = $props()

	// Flatten sections if they are grouped
	const flatSections = $derived(
		Array.isArray(sections) && sections[0]?.children
			? sections.flatMap((group) => group.children)
			: sections
	)
</script>

<div class="mt-8 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
	<h3 class="mb-2 text-sm font-medium text-neutral-900 dark:text-white">Progress</h3>
	<div class="space-y-2">
		{#each flatSections as section, index (section.id)}
			<div class="flex items-center space-x-2">
				<div
					class="h-2 w-2 rounded-full"
					class:bg-primary-500={currentSection === section.id || index === 0}
					class:bg-neutral-300={currentSection !== section.id && index > 0}
					class:dark:bg-neutral-600={currentSection !== section.id && index > 0}
				></div>
				<span class="text-xs text-neutral-600 dark:text-neutral-400">
					{section.title}
				</span>
			</div>
		{/each}
	</div>
</div>
