<script>
	import { getAllSections } from './sections.js'

	let allSections = getAllSections()

	/**
	 * @param {string} sectionId
	 */
	function navigateToSection(sectionId) {
		window.location.href = `/${sectionId}`
	}
</script>

<!-- Welcome Content -->
<div class="text-center">
	<div
		class="bg-primary-100 dark:bg-primary-900 mx-auto mb-6 h-24 w-24 rounded-full p-6 dark:opacity-20"
	>
		<div class="text-primary-600 dark:text-primary-400 text-4xl">📝</div>
	</div>

	<h2 class="mb-4 text-2xl font-bold">Welcome to the Rokkit Tutorial</h2>

	<p class="mb-8 text-neutral-600 dark:text-neutral-400">
		This comprehensive tutorial will guide you through the entire Rokkit ecosystem, from basic
		components to advanced forms, layouts, and theming. Learn to build data-driven applications with
		ease and flexibility.
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Quick Start -->
		<div class="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
			<div class="text-primary-600 dark:text-primary-400 mb-4">
				<div class="text-2xl">🚀</div>
			</div>
			<h3 class="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">Quick Start</h3>
			<p class="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
				Begin your Rokkit journey with our comprehensive introduction.
			</p>
			<button
				onclick={() => navigateToSection('introduction')}
				class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
			>
				Start Tutorial
				<span class="ml-2">→</span>
			</button>
		</div>

		<!-- Key Features -->
		<div class="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
			<div class="text-primary-600 dark:text-primary-400 mb-4">
				<div class="text-2xl">🛠️</div>
			</div>
			<h3 class="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">Key Features</h3>
			<ul class="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
				<li>• Data-driven components</li>
				<li>• Flexible field mapping</li>
				<li>• Snippet-based customization</li>
				<li>• Built-in accessibility</li>
				<li>• Comprehensive theming</li>
			</ul>
		</div>
	</div>

	<!-- Learning Path -->
	<div class="mt-8 rounded-lg bg-neutral-50 p-6 dark:bg-neutral-700/50">
		<h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Learning Path</h3>
		<div class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-5">
			{#each allSections as section, index (section.id)}
				<div class="flex flex-col items-center text-center">
					<div
						class="mb-2 flex h-10 w-10 items-center justify-center rounded-full"
						class:bg-primary-100={index === 0}
						class:text-primary-600={index === 0}
						class:dark:bg-primary-900={index === 0}
						class:dark:opacity-20={index === 0}
						class:dark:text-primary-400={index === 0}
						class:bg-neutral-200={index > 0}
						class:text-neutral-500={index > 0}
						class:dark:bg-neutral-600={index > 0}
						class:dark:text-neutral-400={index > 0}
					>
						{section.icon}
					</div>
					<span class="text-xs font-medium text-neutral-700 dark:text-neutral-300">
						{section.title.split(' ')[0]}
					</span>
					{#if index < allSections.length - 1}
						<div class="mt-2 h-px w-full bg-neutral-200 sm:hidden dark:bg-neutral-600"></div>
					{/if}
				</div>
				{#if index < allSections.length - 1}
					<div class="hidden h-px bg-neutral-200 sm:block sm:self-center dark:bg-neutral-600"></div>
				{/if}
			{/each}
		</div>
	</div>
</div>
