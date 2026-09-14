<script>
	import Card from '../src/components/Card.svelte'

	/** Wrapper so the spec can supply Card's header/children/footer snippets. */
	let { withHeader = false, withBody = false, withFooter = false, ...rest } = $props()
</script>

{#snippet headerSnippet()}
	<span data-test-header>Header</span>
{/snippet}
{#snippet bodySnippet()}
	<span data-test-body>Body</span>
{/snippet}
{#snippet footerSnippet()}
	<span data-test-footer>Footer</span>
{/snippet}

<Card
	{...rest}
	header={withHeader ? headerSnippet : undefined}
	children={withBody ? bodySnippet : undefined}
	footer={withFooter ? footerSnippet : undefined}
/>
