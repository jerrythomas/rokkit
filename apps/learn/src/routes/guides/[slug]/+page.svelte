<script lang="ts">
	import GuidePage from '$lib/koan/components/GuidePage.svelte'
	import LlmsBookmark from '$lib/components/LlmsBookmark.svelte'
	const { data } = $props()
</script>

<GuidePage markdown={data.guide.content} />

<footer class="follow-up">
	<div>
		Have a follow-up?
		<a href={`/app?q=${encodeURIComponent(data.guide.title)}`}>Ask Koan →</a>
	</div>
</footer>

<LlmsBookmark
	href={`/llms/guides/${data.guide.slug}.txt`}
	title="LLM-ready spec for {data.guide.title}"
/>

<style>
	.follow-up {
		margin: 48px 0 0;
		padding: 16px 0 0;
		border-top: 1px solid var(--paper-edge, #e0dccc);
		font: 400 13px var(--font-ui);
		color: var(--ink-soft, #666);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.follow-up a {
		color: var(--ink);
		text-decoration: underline;
	}
</style>
