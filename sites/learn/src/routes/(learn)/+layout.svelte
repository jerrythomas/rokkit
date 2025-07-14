<script>
	import { page } from '$app/state'
	import Header from './Header.svelte'
	import Sidebar from './Sidebar.svelte'
	import { findSection } from '$lib/stories.js'

	let { data, children } = $props()
	let sections = $derived(data.sections)
	let { title, description, icon = '?' } = $derived(findSection(sections, page.url.pathname))
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="tutorial" content={description} />
</svelte:head>

<Header {title} {description} {icon} />
<div class="bg-neutral-inset grid w-full flex-1 grid-cols-1 overflow-hidden lg:grid-cols-4">
	<div class="border-neutral-subtle overflow-y-auto border-r lg:col-span-1">
		<Sidebar {sections} fields={data.fields} />
	</div>

	<!-- Main Content -->
	<main class="h-full overflow-y-auto p-8 lg:col-span-3">
		{@render children()}
	</main>
</div>
