<script>
	import Toolbar from '../src/components/Toolbar.svelte'

	/**
	 * Wrapper for Toolbar's slot-based layout. Flags pick which of the four
	 * snippets are supplied, because the section/divider/spacer arrangement
	 * depends on exactly which combination is present.
	 */
	let {
		withStart = false,
		withCenter = false,
		withEnd = false,
		withChildren = false,
		...rest
	} = $props()
</script>

{#snippet startSnippet()}<span data-slot-start>start</span>{/snippet}
{#snippet centerSnippet()}<span data-slot-center>center</span>{/snippet}
{#snippet endSnippet()}<span data-slot-end>end</span>{/snippet}
{#snippet childrenSnippet()}<span data-slot-children>children</span>{/snippet}

<Toolbar
	{...rest}
	start={withStart ? startSnippet : undefined}
	center={withCenter ? centerSnippet : undefined}
	end={withEnd ? endSnippet : undefined}
	children={withChildren ? childrenSnippet : undefined}
/>
