<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} component - The component name for the llms.txt link
	 */
	/** @type {Props} */
	let { component } = $props()

	let href = $derived(`/docs/components/${component}/llms.txt`)
</script>

<a
	{href}
	target="_blank"
	rel="noopener"
	data-button-root
	class="absolute top-0 right-0 z-10 inline-flex items-center gap-1.5 px-2 text-xs"
	title="View LLM API Documentation"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path
			d="M12 3v5m0 8v5m9-9h-5m-8 0H3m15.364-6.364l-3.536 3.536m-7.656 7.656l-3.536 3.536m14.728 0l-3.536-3.536M7.172 7.172L3.636 3.636"
		/>
	</svg>
	<span>llms.txt</span>
</a>
