<script>
	import { getContext } from 'svelte'
	import Background from './Background.svelte'
	// import Features from './Features.svelte'
	import WhyRokkit from './WhyRokkit.svelte'
	const site = getContext('site')()

	let { data } = $props()
</script>

<main
	class="bg-neutral-subtle text-neutral-overlay relative flex h-full w-full max-w-full flex-col overflow-auto p-4"
>
	<Background />
	<div
		class="z-1 xl:p-30 flex w-full flex-col items-center gap-12 p-12 md:w-1/2 md:p-10 lg:py-24 2xl:p-40"
	>
		<span class="items-right w-content flex flex-col">
			<h1 class="font-serif text-3xl lg:text-5xl">Build Beyond Limits</h1>
			<h2 class="w-full text-right text-lg font-thin">Empowering your UI with Rokkit</h2>
		</span>
		<div class="text-md flex flex-col gap-6 text-justify font-thin xl:gap-8">
			<p>Buckle up and get ready to create some truly incredible user experiences with Rokkit!</p>
			<p>{data.app.about}</p>
			<span class="flex text-xl">
				<a class="button is-primary" href="/tutorial/introduction"> Get Started </a>
			</span>
		</div>
	</div>
	<!-- <Features /> -->
	<!-- Feature highlight cards section -->
	<WhyRokkit />
</main>
