<script>
	import { page } from '$app/state'
	import PlaceholderPage from '$lib/components/PlaceholderPage.svelte'

	const projectId = $derived(page.params.id)
	const name = $derived(projectId.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '))
</script>

<PlaceholderPage kanji="場" title={name} description="Project detail view — overview, graph, patterns, sessions, settings." />
