<script>
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import Header from './Header.svelte'
	import Sidebar from './Sidebar.svelte'
	import { findGroupForSection, findSection } from './sections.js'

	let { data, children } = $props()
	let currentSection = $derived($page.params.segment || 'introduction')
	let currentGroup = $derived(findGroupForSection(currentSection) || data.sections[0])
	let currentSectionData = $derived(findSection(currentSection))

	/**
	 * @param {Object} section - Selected section object from GroupedList
	 */
	function navigateToSection(section) {
		goto(`/${section.slug}`)
	}
</script>

<svelte:head>
	<title>Rokkit Tutorial - {currentSectionData?.title || currentGroup.title} | Learn Rokkit</title>
	<meta
		name="description"
		content="Comprehensive Rokkit tutorial covering components, forms, layouts, theming, and data-driven application development"
	/>
</svelte:head>

<div class="flex h-full flex-col bg-neutral-50 dark:bg-neutral-900">
	<Header title={currentGroup.title} description={currentGroup.description} />

	<div class="flex h-full w-full max-w-7xl flex-1 overflow-hidden">
		<div class="grid h-full w-full grid-cols-1 lg:grid-cols-4">
			<div class="h-full overflow-y-auto lg:col-span-1">
				<Sidebar
					sections={data.sections}
					fields={data.fields}
					{currentSection}
					onNavigate={navigateToSection}
				/>
			</div>

			<!-- Main Content -->
			<main class="h-full overflow-y-auto py-8 lg:col-span-3">
				<div class="w-full rounded-lg p-4 shadow-sm">
					{@render children()}
				</div>
			</main>
		</div>
	</div>
</div>
