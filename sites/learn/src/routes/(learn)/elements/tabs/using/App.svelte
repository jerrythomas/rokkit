<script>
	import { Tabs } from '@rokkit/ui'
	import { options } from './data.js'
	import Custom from './Custom.svelte'

	let fields = { text: 'name', image: 'photo', url: 'artist' }
	let value = $state()
</script>

<div class="space-y-6">
	<div class="bg-neutral-subtle rounded-lg p-4">
		<h3 class="font-semibold mb-2">Using Custom Snippets</h3>
		<p class="text-sm text-neutral-floating">
			This example shows how to use custom snippets to render tab headers with images and text.
		</p>
	</div>

	<Tabs items={options} {fields} bind:value>
		{#snippet child(item)}
			<div class="flex items-center gap-2">
				<img src={item.get('image')} alt={item.get('text')} class="h-6 w-6 rounded-sm" />
				<span>{item.get('text')}</span>
			</div>
		{/snippet}
		
		<div class="p-6 space-y-4">
			{#if value}
				<div class="flex items-center gap-4">
					<img src={value.photo} alt={value.name} class="w-16 h-16 object-cover rounded-lg" />
					<div>
						<h3 class="text-lg font-semibold">{value.name}</h3>
						<p class="text-neutral-floating text-sm">
							Photo by <a href={value.artist} target={value.target} class="underline hover:text-neutral-overlay">photographer</a>
						</p>
					</div>
				</div>
				
				<div class="bg-neutral-subtle rounded-lg p-4">
					<h4 class="font-semibold mb-2">Selected Value</h4>
					<pre class="text-sm">{JSON.stringify(value, null, 2)}</pre>
				</div>
			{:else}
				<p class="text-neutral-floating">Select a tab to see the custom rendering</p>
			{/if}
		</div>
	</Tabs>
</div>
