<script>
	import { getContext } from 'svelte'
	import { goto } from '$app/navigation'
	import { Button } from '@rokkit/molecules'
	import Background from './Background.svelte'
	const site = getContext('site')

	export let data

	$: site.update((current) => ({ ...current, title: data.app.name, description: data.app.about }))
</script>

<main class="relative w-full flex flex-col bg-neutral-subtle h-full">
	<Background />
	<div
		class="z-1 w-full flex flex-col items-center gap-14 p-12 md:w-1/2 md:p-10 lg:py-22 xl:p-25 2xl:p-40"
	>
		<span class="items-right w-content flex flex-col pt-10">
			<h1 class="font-serif text-4xl lg:text-5xl">Build Beyond Limits</h1>
			<h2 class="w-full font-thin text-lg text-right">Empowering your UI with Rokkit</h2>
		</span>

		<div class="flex flex-col gap-6 font-thin text-justify text-xl xl:gap-8">
			<p>Buckle up and get ready to create some truly incredible user experiences with Rokkit!</p>
			<p>{data.app.about}</p>
			<code class="rounded-lg overflow-clip">
				<pre class="language-bash"> degit jerrythomas/rokkit/sites/quick-start my-app</pre>
			</code>
			<span class="flex text-xl">
				<Button on:click={() => goto('/tutorial/welcome/introduction')} type="primary">
					Get Started
				</Button>
			</span>
		</div>
	</div>
</main>
