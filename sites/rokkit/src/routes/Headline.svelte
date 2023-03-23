<script>
	import RocketLaunch from './RocketLaunch.svelte'
	import { Button } from '@rokkit/form'
	import { goto } from '$app/navigation'
</script>

<hero class="flex flex-col w-full items-center py-8 relative h-150">
	<RocketLaunch />
	<h1 class="text-3xl">Build Beyond Limits</h1>
	<small>Empowering your UI with Rokkit</small>
	<div class="flex flex-col p-12 gap-6 text-center max-w-150 sm:w-100 md:w-3/5">
		<p class="">
			Buckle up and get ready to create some truly incredible user experiences
			with Rokkit!
		</p>
		<p>
			Building amazing, interactive applications has never been simpler thanks
			to an extensive collection of composable components and a variety of
			utility functions, stores, actions, and themes.
		</p>
	</div>

	<!-- <a href="/guide/list" class="button is-primary cursor-pointer">Get Started</a> -->
	<Button on:click={() => goto('/guide/list')} type="primary">
		Get Started
	</Button>
</hero>
