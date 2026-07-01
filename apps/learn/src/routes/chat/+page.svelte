<script lang="ts">
	import ModePicker from '$lib/chat-demo/components/ModePicker.svelte'
</script>

<svelte:head><title>Ask Rokkit</title></svelte:head>

<section data-ask-rokkit-hero>
	<h1>Ask Rokkit</h1>
	<p>Describe what you want — a chart, a table, a form — and pick an engine to build it.</p>
</section>
<ModePicker />

<style>
	[data-ask-rokkit-hero] {
		text-align: center;
		padding: 40px 32px 0;
		max-width: 1060px;
		margin: 0 auto;
	}
	[data-ask-rokkit-hero] h1 {
		font: 300 34px var(--font-display);
		color: var(--ink);
		margin: 0 0 6px;
	}
	[data-ask-rokkit-hero] p {
		color: var(--ink-mute);
		font-size: 14px;
		margin: 0;
	}
</style>
