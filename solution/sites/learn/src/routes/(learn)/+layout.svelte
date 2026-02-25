<script>
	import { page } from '$app/state'
	import Header from './Header.svelte'
	import Sidebar from './Sidebar.svelte'
	import { findSection, findGroupForSection } from '$lib/stories.js'

	let { data, children } = $props()
	let sections = $derived(data.sections)
	let currentSection = $derived(findSection(sections, page.url.pathname))
	let { title, description, icon = '?' } = $derived(currentSection)

	let breadcrumbs = $derived.by(() => {
		const group = findGroupForSection(sections, page.url.pathname)
		if (!group) return []
		const crumbs = [{ label: 'Learn', href: '/' }]
		if (group.title) {
			crumbs.push({ label: group.title })
		}
		if (title && title !== group?.title) {
			crumbs.push({ label: title })
		}
		return crumbs
	})
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="tutorial" content={description} />
</svelte:head>

<Header {title} {description} {icon} {breadcrumbs} />
<div class="bg-surface-z1 grid w-full flex-1 grid-cols-1 overflow-hidden lg:grid-cols-4">
	<div class="border-surface-z2 overflow-y-auto border-r lg:col-span-1">
		<Sidebar {sections} fields={data.fields} />
	</div>

	<!-- Main Content -->
	<main class="h-full overflow-y-auto p-8 lg:col-span-3">
		{@render children?.()}
	</main>
</div>
