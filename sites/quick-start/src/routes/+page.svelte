<script>
	import Switch from './Switch.svelte'
	let { data } = $props()
	let value = $state(false)
</script>

<main class="h-full w-full flex flex-col p-8">
	<!-- <h1>Welcome to SvelteKit using <a href="https://rokkit/vercel.app">Rokkit</a></h1> -->
	<demo class="flex flex-col w-100 p-10 gap-4 mx-auto">
		<!-- <p>Here is a demo using a list component</p> -->
		<!-- <List items={data.items} bind:value /> -->
		<Switch bind:value />
		<p>Selected Value: <b>{value}</b></p>
	</demo>
</main>
