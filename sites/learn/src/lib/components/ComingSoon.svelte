<script>
	import { Icon } from '@rokkit/ui'
	/**
	 * Simple "Coming Soon" component for tutorial sections
	 * @typedef {Object} ComingSoonProps
	 * @property {string} title - The component/section title
	 * @property {string} description - Brief description of what this section will cover
	 * @property {string} icon - Emoji icon for the section
	 */

	let { title, description, icon = '🚧' } = $props()
</script>

<article data-article-root>
	<section data-card>
		<h1 class="text-neutral-overlay mb-2 text-3xl font-bold">
			<Icon name={icon}></Icon>{title}
		</h1>
		<p class="text-neutral-floating mb-6 text-lg">{description}</p>

		<p class="text-neutral-elevated italic">
			This tutorial section is coming soon. The documentation and interactive examples will be
			available in a future update.
		</p>
	</section>
</article>
