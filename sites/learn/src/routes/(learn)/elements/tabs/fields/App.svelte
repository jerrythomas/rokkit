<script>
	import { Tabs } from '@rokkit/ui'
	import { options } from './data.js'

	let fields = { text: 'name', image: 'photo' }
	let value = $state()
</script>

<div class="space-y-6">
	<div class="bg-neutral-subtle rounded-lg p-4">
		<h3 class="font-semibold mb-2">Field Mapping Configuration</h3>
		<pre class="text-sm"><code>{JSON.stringify(fields, null, 2)}</code></pre>
	</div>

	<Tabs items={options} {fields} bind:value>
		<div class="p-6 space-y-4">
			{#if value}
				<div class="flex items-center gap-4">
					<img src={value.photo} alt={value.name} class="w-16 h-16 object-cover rounded-lg" />
					<div>
						<h3 class="text-lg font-semibold">{value.name}</h3>
						<p class="text-neutral-floating text-sm">
							Photo by <a href={value.artist} target="_blank" class="underline hover:text-neutral-overlay">photographer</a>
						</p>
					</div>
				</div>
				
				<div class="bg-neutral-subtle rounded-lg p-4">
					<h4 class="font-semibold mb-2">Selected Value</h4>
					<pre class="text-sm">{JSON.stringify(value, null, 2)}</pre>
				</div>
			{:else}
				<p class="text-neutral-floating">Select a tab to see the mapped field values</p>
			{/if}
		</div>
	</Tabs>
</div>
