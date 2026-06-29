<script lang="ts">
	import NavContent from '../src/components/NavContent.svelte'

	const {
		orientation = 'horizontal',
		navSize = '280px',
		collapsible = true,
		class: className = ''
	}: {
		orientation?: 'horizontal' | 'vertical'
		navSize?: string
		collapsible?: boolean
		class?: string
	} = $props()
</script>

<NavContent {orientation} {navSize} {collapsible} class={className}>
	{#snippet nav()}
		<nav data-test-nav>Navigation</nav>
	{/snippet}
	{#snippet content()}
		<main data-test-content>Content</main>
	{/snippet}
</NavContent>
