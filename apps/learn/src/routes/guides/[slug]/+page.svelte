<script lang="ts">
	import GuidePage from '$lib/koan/components/GuidePage.svelte'
	const { data } = $props()
</script>

<svelte:head><title>{data.guide.title} — Rokkit Guides</title></svelte:head>

<GuidePage markdown={data.guide.content} />

<footer class="follow-up">
	<div>
		Have a follow-up?
		<a href={`/app?q=${encodeURIComponent(data.guide.title)}`}>Ask Koan →</a>
	</div>
	<div class="llms-link">
		Or grab the LLM-ready specs at
		<a href={`/llms/guides/${data.guide.slug}.txt`} target="_blank" rel="noopener noreferrer">
			/llms/guides/{data.guide.slug}.txt
		</a>
		(<a href="/llms/index.txt" target="_blank" rel="noopener noreferrer">index</a>).
	</div>
</footer>

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
	.llms-link {
		font-size: 12px;
		color: var(--ink-mute);
	}
</style>
