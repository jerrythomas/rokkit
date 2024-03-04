<script>
	import { getContext } from 'svelte'
	import { goto } from '$app/navigation'
	import { Button } from '@rokkit/molecules'
	import Background from './Background.svelte'
	const site = getContext('site')

	export let data

	$: site.update((current) => ({ ...current, title: data.app.name, description: data.app.about }))
</script>

<main class="relative flex flex-col h-full w-full max-w-full bg-neutral-inset overflow-auto">
	<Background />
	<div
		class="z-1 w-full flex flex-col items-center gap-12 p-12 md:w-1/2 md:p-10 lg:py-22 xl:p-25 2xl:p-40"
	>
		<span class="items-right w-content flex flex-col">
			<h1 class="font-serif text-3xl lg:text-5xl">Build Beyond Limits</h1>
			<h2 class="w-full font-thin text-lg text-right">Empowering your UI with Rokkit</h2>
		</span>

		<div class="flex flex-col gap-6 font-thin text-justify text-xl xl:gap-8">
			<p>Buckle up and get ready to create some truly incredible user experiences with Rokkit!</p>
			<p>{data.app.about}</p>
			<span class="flex text-xl">
				<Button on:click={() => goto('/tutorial/welcome/introduction')} type="primary">
					Get Started
				</Button>
			</span>
		</div>
	</div>
</main>
