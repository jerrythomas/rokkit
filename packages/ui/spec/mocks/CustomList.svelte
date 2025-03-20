<script>
	import List from '../../src/List.svelte'
	let {
		items = $bindable([]),
		addheader = false,
		addfooter = false,
		addempty = false,
		mixed = false
	} = $props()
</script>

{#snippet header()}
	<h1>Custom header</h1>
{/snippet}
{#snippet empty()}
	<h1>Custom empty message</h1>
{/snippet}
{#snippet footer()}
	<h1>Custom footer</h1>
{/snippet}
{#snippet even(node)}
	<p>even:{node.get('text')}</p>
{/snippet}
{#snippet odd(node)}
	<p>odd:{node.get('text')}</p>
{/snippet}

{#if addheader}
	<List {items} {header} />
{/if}
{#if addfooter}
	<List {items} {footer} />
{/if}
{#if addempty}
	<List {items} {empty} />
{/if}
{#if mixed}
	<List {items} {odd} {even} />
{/if}
