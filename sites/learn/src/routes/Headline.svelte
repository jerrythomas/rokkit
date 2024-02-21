<script>
	import { Button } from '@rokkit/molecules'
	import { goto } from '$app/navigation'
	import Background from './Background.svelte'
</script>

<hero class="relative w-full flex flex-col">
	<Background />
	<div
		class="z-1 w-full flex flex-col items-center gap-14 p-12 md:w-1/2 md:p-10 lg:py-22 xl:p-25 2xl:p-40"
	>
		<span class="items-right w-content flex flex-col pt-10">
			<h1 class="font-serif text-4xl lg:text-5xl">Build Beyond Limits</h1>
			<h2 class="w-full font-thin text-lg text-right">Empowering your UI with Rokkit</h2>
		</span>

		<div class="flex flex-col gap-6 font-thin text-justify text-xl xl:gap-8 xl:text-2xl">
			<p>Buckle up and get ready to create some truly incredible user experiences with Rokkit!</p>
			<p>
				Building amazing, interactive applications has never been simpler thanks to an extensive
				collection of composable components and a variety of utility functions, stores, actions, and
				themes.
			</p>
			<span class="flex text-xl">
				<Button on:click={() => goto('/tutorial/welcome/introduction')} type="primary">
					Get Started
				</Button>
			</span>
		</div>
	</div>
</hero>
