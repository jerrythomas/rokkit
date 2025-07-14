<script>
	import Tabs from '../../src/Tabs.svelte'

	let {
		items = [],
		addheader = false,
		addcontent = false,
		addempty = false,
		...props
	} = $props()
</script>

{#snippet customChild(item)}
	<div class="custom-tab-header">
		Custom: {item.get('text') || item.get('label') || item.get('name')}
	</div>
{/snippet}

{#snippet customChildren(item)}
	<div class="custom-tab-content">
		<h3>Custom Content</h3>
		<p>{item.get('content') || item.get('body')}</p>
	</div>
{/snippet}

{#snippet customEmpty()}
	<div class="custom-empty-state">
		Custom empty state - No tabs available here!
	</div>
{/snippet}

{#if addheader}
	<Tabs {items} child={customChild} {...props} />
{/if}

{#if addcontent}
	<Tabs {items} children={customChildren} {...props} />
{/if}

{#if addempty}
	<Tabs {items} empty={customEmpty} {...props} />
{/if}

{#if !addheader && !addcontent && !addempty}
	<Tabs {items} {...props} />
{/if}