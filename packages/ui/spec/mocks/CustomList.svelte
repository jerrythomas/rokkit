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
	<List bind:items {header} />
	<!-- A composable implementation of this would look like
	<List bind:items >
	{#snippet header()}
      <h1>Custom header</h1>
    {/snippet}
	</List>
	-->
{/if}
{#if addfooter}
	<List bind:items {footer} />
	<!-- A composable implementation of this would look like comments
	<List bind:items >

  	{#snippet footer()}
  		<h1>Custom footer</h1>
  {/snippet}

	</List>
	-->
{/if}
{#if addempty}
	<List bind:items {empty} />
	<!-- A composable implementation of this would look like comments
	<List bind:items >

	{#snippet empty()}
		<h1>Custom empty message</h1>
{/snippet}

	</List>
	-->
{/if}
{#if mixed}
	<List bind:items {odd} {even} />
	<!-- A composable implementation of this would look like comments
	<List bind:items >

	{#snippet even(node)}
		<p>even:{node.get('text')}</p>
{/snippet}
{#snippet odd(node)}
		<p>odd:{node.get('text')}</p>
{/snippet}

	</List>
	-->
{/if}
