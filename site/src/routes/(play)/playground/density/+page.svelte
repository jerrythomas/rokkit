<script>
	// @ts-nocheck
	import { Tabs } from '@rokkit/ui'
	let density = $state('cozy')
	let items = ['base', 'compact', 'cozy']
</script>

<section data-density={density} class="flex flex-col items-center justify-center p-8">
	<Tabs {items} bind:value={density} class="[&>[data-tab-content]]:bg-surface-z9"></Tabs>
	<div data-card-root>
		<div data-card-header></div>
		<div data-card-body>
			<h1 data-card-title>Lorem Ipsum!</h1>
			<p data-card-text>
				Spacing is everything in UX design. It plays a crucial role in creating a visually appealing
				and user-friendly interface.
			</p>
		</div>
		<div data-card-footer>
			<button data-button-root data-primary>Learn More</button>
		</div>
	</div>
</section>

<style>
	[data-card-root] {
		@apply bg-surface-z3 flex w-80 flex-col rounded-lg text-white shadow-md transition-all duration-300;
	}
	[data-card-root] h1 {
		@apply border-surface-z5 m-0 border-b px-0 py-2 text-2xl font-bold leading-tight;
	}
	[data-card-root] h1,
	[data-card-root] p {
		@apply p-4;
	}
	[data-card-header] {
		@apply bg-gradient-to-rb from-primary-z5 to-secondary-z5 min-h-30 text-on-primary flex flex-col justify-end rounded-t-lg;
	}
	[data-card-body] {
		@apply flex flex-col p-4;
	}
	[data-card-footer] {
		@apply bg-surface-z2 flex rounded-b-lg p-4;
	}
	[data-density='compact'] h1 {
		@apply lext-lg p-2;
	}
	[data-density='compact'] p {
		@apply p-2 text-sm;
	}
	[data-density='cozy'] h1,
	[data-density='cozy'] p {
		@apply py-4;
	}
	[data-density='compact'] [data-card-body],
	[data-density='compact'] [data-card-footer] {
		@apply p-2;
	}
	[data-density='cozy'] [data-card-body],
	[data-density='cozy'] [data-card-footer] {
		@apply p-6;
	}
	[data-card-root] [data-button-root] {
		@apply px-5 py-1 leading-loose;
	}
	[data-density='compact'] [data-button-root] {
		@apply min-h-6 px-3 py-0 text-sm uppercase leading-loose;
	}
	[data-density='cozy'] [data-button-root] {
		@apply px-4 py-0 text-lg;
	}
</style>
