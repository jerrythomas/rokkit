<script>
	import { Input } from '@rokkit/forms'
	import { Tabs } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'

	const palettes = ['default', 'vibrant', 'seaweed']
	let current = $state('default')
</script>

<section data-palette={current} class="flex p-10">
	<Tabs items={palettes} bind:value={current}>
		<div class="flex flex-col gap-4 p-10">
			<div
				class="bg-info-z4 border-info-z7 text-info-z9 flex gap-2 rounded-md border-2 px-8 py-4 text-center leading-loose"
			>
				<span class="i-rokkit:state-info text-4xl"></span>
				<p>Switching the tabs changes the color pallette or `skin` of the components.</p>
			</div>
			<h2>{current}</h2>
			<section class="flex flex-col gap-4">
				<Input type="text" />
				<a data-button-root data-primary href="/"> Hello </a>
				{#each ['primary', 'secondary'] as color (color)}
					<div class="flex items-center gap-2">
						<p>{color}</p>
						<div class="bg-{color}-500 flex h-10 w-10 rounded-full"></div>
						<div class="bg-{color}-500 flex h-10 w-10 rounded-full opacity-50"></div>
					</div>
				{/each}
			</section>
		</div>
	</Tabs>
</section>

<style>
	[data-palette='vibrant'] {
		@apply skin-vibrant;
	}
	[data-palette='seaweed'] {
		@apply skin-seaweed;
	}
</style>
