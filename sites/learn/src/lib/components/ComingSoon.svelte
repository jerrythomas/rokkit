<script>
	/**
	 * Simple "Coming Soon" component for tutorial sections
	 * @typedef {Object} ComingSoonProps
	 * @property {string} title - The component/section title
	 * @property {string} description - Brief description of what this section will cover
	 * @property {string} icon - Emoji icon for the section
	 */

	let { title, description, icon } = $props()
</script>

<div class="flex min-h-96 items-center justify-center">
	<div class="text-center">
		<div class="mb-4 text-6xl">{icon}</div>
		<h1 class="text-neutral-overlay mb-2 text-3xl font-bold">{title}</h1>
		<p class="text-neutral-floating mb-6 text-lg">{description}</p>
		<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-6">
			<p class="text-neutral-elevated">
				This tutorial section is coming soon. The documentation and interactive examples will be
				available in a future update.
			</p>
		</div>
	</div>
</div>