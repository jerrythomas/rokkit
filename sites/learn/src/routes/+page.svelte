<script>
	import { getContext } from 'svelte'
	// import { goto } from '$app/navigation'
	// import Button from './Button.svelte'
	import Background from './Background.svelte'
	const site = getContext('site')()

	let { data } = $props()

	// $effect(() => {
	// 	site.title = data.app.name ?? site.title
	// 	site.description = data.app.about ?? site.description
	// })
</script>

<main class="bg-neutral-inset relative flex h-full w-full max-w-full flex-col overflow-auto">
	<Background />
	<div
		class="z-1 lg:py-22 xl:p-25 flex w-full flex-col items-center gap-12 p-12 md:w-1/2 md:p-10 2xl:p-40"
	>
		<span class="items-right w-content flex flex-col">
			<h1 class="font-serif text-3xl lg:text-5xl">Build Beyond Limits</h1>
			<h2 class="w-full text-right text-lg font-thin">Empowering your UI with Rokkit</h2>
		</span>

		<div class="flex flex-col gap-6 text-justify text-xl font-thin xl:gap-8">
			<p>Buckle up and get ready to create some truly incredible user experiences with Rokkit!</p>
			<p>{data.app.about}</p>
			<span class="flex text-xl">
				<a class="button is-primary" href="/tutorial/welcome/introduction"> Get Started </a>
			</span>
		</div>
	</div>
</main>
