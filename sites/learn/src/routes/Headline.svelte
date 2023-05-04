<script>
	import { Button } from '@rokkit/form'
	import { goto } from '$app/navigation'
	import { getContext } from 'svelte'
	import Background from './Background.svelte'

	const media = getContext('media')
</script>

<hero class="flex flex-col w-full relative">
	<Background />
	<!-- {/if} -->

	<div
		class="flex flex-col w-full p-12 md:w-1/2 md:p-10 lg:py-22 xl:p-25 2xl:p-40 gap-14 items-center z-1"
	>
		<span class="flex flex-col w-content items-right pt-10">
			<h1 class="font-serif text-4xl lg:text-5xl">Build Beyond Limits</h1>
			<h2 class="w-full text-right text-lg font-thin">
				Empowering your UI with Rokkit
			</h2>
		</span>

		<div
			class="flex flex-col gap-6 xl:gap-8 text-justify text-xl xl:text-2xl font-thin"
		>
			<p>
				Buckle up and get ready to create some truly incredible user experiences
				with Rokkit!
			</p>
			<p>
				Building amazing, interactive applications has never been simpler thanks
				to an extensive collection of composable components and a variety of
				utility functions, stores, actions, and themes.
			</p>
			<span class="flex text-xl">
				<Button
					on:click={() => goto('/tutorial/welcome/introduction')}
					type="primary"
				>
					Get Started
				</Button>
			</span>
		</div>
	</div>
</hero>
