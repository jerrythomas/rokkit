<script lang="ts">
	import GuidePage from '$lib/koan/components/GuidePage.svelte'
	const { data } = $props()
</script>

<svelte:head><title>{data.guide.title} — Rokkit Guides</title></svelte:head>

<GuidePage markdown={data.guide.content} />

<footer class="follow-up">
	Have a follow-up?
	<a href={`/app?q=${encodeURIComponent(data.guide.title)}`}>Ask Koan →</a>
</footer>

<style>
	.follow-up {
		margin: 48px 0 0;
		padding: 16px 0 0;
		border-top: 1px solid var(--paper-edge, #e0dccc);
		font: 400 13px var(--font-ui);
		color: var(--ink-soft, #666);
	}
	.follow-up a {
		color: var(--ink);
		text-decoration: underline;
	}
</style>
