<script>
	import { page } from '$app/stores'
	import { findSection, findGroupForSection } from '../sections.js'

	let { data } = $props()
	let currentSegment = $derived($page.params.segment)
	let currentSection = $derived(findSection(currentSegment))
	let currentGroup = $derived(findGroupForSection(currentSegment))

	// Placeholder content for tutorial sections
	let content = $derived(() => {
		if (!currentSection) {
			return {
				title: 'Section Not Found',
				description: 'The requested tutorial section could not be found.',
				content: 'Please check the URL or navigate back to the main tutorial page.'
			}
		}

		return {
			title: currentSection.title,
			description: currentSection.description,
			content: `This is the ${currentSection.title} tutorial section. Content for this section is coming soon!`
		}
	})
</script>

<svelte:head>
	<title>{content.title} - {currentGroup?.title || 'Rokkit Tutorial'}</title>
	<meta name="description" content={content.description} />
</svelte:head>

<div class="space-y-6">
	<!-- Section Header -->
	<header class="border-b border-neutral-200 pb-6 dark:border-neutral-700">
		<div class="flex items-center space-x-3">
			{#if currentSection?.icon}
				<div class="text-3xl">{currentSection.icon}</div>
			{/if}
			<div>
				<h1 class="text-3xl font-bold text-neutral-900 dark:text-white">
					{content.title}
				</h1>
				<p class="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
					{content.description}
				</p>
			</div>
		</div>

		{#if currentGroup}
			<div class="mt-4">
				<span class="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200">
					{currentGroup.title}
				</span>
			</div>
		{/if}
	</header>

	<!-- Main Content -->
	<div class="prose prose-neutral max-w-none dark:prose-invert">
		<p class="lead text-xl text-neutral-600 dark:text-neutral-300">
			{content.content}
		</p>

		{#if currentSection}
			<div class="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
				<h2 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
					What you'll learn
				</h2>
				<ul class="space-y-2 text-neutral-700 dark:text-neutral-300">
					<li>• How to use {currentSection.title} effectively</li>
					<li>• Best practices and common patterns</li>
					<li>• Real-world examples and use cases</li>
					<li>• Advanced features and customization options</li>
				</ul>
			</div>

			<div class="mt-8">
				<h2 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
					Interactive Examples
				</h2>
				<div class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
					<div class="text-center text-neutral-500 dark:text-neutral-400">
						Interactive examples and code demos will be available here.
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Navigation -->
	{#if currentSection}
		<nav class="flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-700">
			<div class="flex-1">
				<!-- Previous section link would go here -->
			</div>
			<div class="flex-1 text-right">
				<!-- Next section link would go here -->
			</div>
		</nav>
	{/if}
</div>
