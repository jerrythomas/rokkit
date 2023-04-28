<script>
	import RocketLaunch from './RocketLaunch.svelte'
	import Rokkit from './Rokkit.svelte'
	import { Button } from '@rokkit/form'
	import { goto } from '$app/navigation'
	import Clouds from './Clouds.svelte'
	import { layers } from './clouds'
</script>

<hero class="flex flex-col w-full items-center py-8 relative">
	<wrapper
		class="flex flex-col md:flex-row items-center max-w-150 sm:w-100 md:w-3/5"
	>
		<div class="flex flex-col w-full items-center">
			<h1 class="text-3xl">Build Beyond Limits</h1>
			<small>Empowering your UI with Rokkit</small>
			<div class="flex flex-col p-12 gap-6 text-center">
				<p class="">
					Buckle up and get ready to create some truly incredible user
					experiences with Rokkit!
				</p>
				<p>
					Building amazing, interactive applications has never been simpler
					thanks to an extensive collection of composable components and a
					variety of utility functions, stores, actions, and themes.
				</p>
			</div>
			<Button
				on:click={() => goto('/tutorial/welcome/introduction')}
				type="primary"
			>
				Get Started
			</Button>
		</div>
		<span
			class="flex w-full h-40 md:w-40 md:h-full justify-center items-center relative"
		>
			<Rokkit class="absolute -bottom-15 h-50 md:h-80 md:bottom-0" />
		</span>
	</wrapper>
	<Clouds {layers} />
</hero>
