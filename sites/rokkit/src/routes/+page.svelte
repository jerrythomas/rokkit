<script>
	import Rocket from './rokkit.svelte'
	export let data
</script>

<section
	class="flex flex-col h-full w-full font-light px-2 py-4 sm:p-8 gap-4 items-center overflow-auto"
>
	<headline class="flex flex-col items-center">
		<h1 class="text-3xl">Build Beyond Limits</h1>
		<h2 class="text-sm">Empowering Your UI with Rokkit</h2>
	</headline>
	<segment
		class="flex items-center bg-skin-100 rounded-xl shadow-xl p-4 md:min-w-140 md:w-2/3 sm:p-8"
	>
		<span class="flex flex-col gap-4 min-w-2/3">
			<p>
				Buckle up and get ready to create some truly incredible user experiences
				with Rokkit!
			</p>
			<p>
				Building amazing, interactive applications has never been simpler thanks
				to an extensive collection of composable components and a variety of
				utility functions, stores, actions, and themes.
			</p>
		</span>
		<div
			class="flex flex-col flex-shrink flex-grow h-full items-center justify-center"
		>
			<Rocket />
		</div>
	</segment>
	<a
		href="/guide/list"
		class="shadow px-4 py-2 rounded bg-gradient-to-r from-primary to-secondary text-white"
	>
		Get Started
	</a>
</section>
