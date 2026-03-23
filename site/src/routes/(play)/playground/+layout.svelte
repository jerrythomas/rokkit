<script>
	// @ts-nocheck
	import { page } from '$app/state'
	import { List } from '@rokkit/ui'

	let { data, children } = $props()

	let slug = $derived(page.url.pathname.split('/').pop())
	let isComponent = $derived(page.url.pathname.includes('/playground/components/'))
	let isEffect = $derived(page.url.pathname.includes('/playground/effects/'))
	const docsHref = $derived(
		isComponent ? `/docs/components/${slug}` : isEffect ? `/docs/effects/${slug}` : null
	)
	const llmsHref = $derived(isComponent ? `/llms/components/${slug}.txt` : null)
</script>

<div class="flex min-h-0 flex-1 overflow-hidden">
	<aside class="border-surface-z2 bg-surface-z1 w-64 flex-shrink-0 overflow-y-auto border-r">
		<div class="p-3">
			<List items={data.sections} fields={data.fields} value={page.url.pathname} collapsible />
		</div>
	</aside>

	<main
		data-playground-content
		class="bg-surface-z1 text-surface-z8 flex min-w-0 flex-1 flex-col overflow-hidden"
	>
		{@render children()}
	</main>
</div>
