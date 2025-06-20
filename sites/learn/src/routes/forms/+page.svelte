<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'

	let currentSection = 'inputs'

	const sections = [
		{
			id: 'inputs',
			title: '1. Input Components',
			description: 'Explore different input types and their properties',
			icon: '📝'
		},
		{
			id: 'builder',
			title: '2. FormBuilder',
			description: 'Create forms from data with automatic schema derivation',
			icon: '🏗️'
		},
		{
			id: 'renderer',
			title: '3. FormRenderer',
			description: 'Render forms with snippet-based customization',
			icon: '📄'
		},
		{
			id: 'validation',
			title: '4. Validation',
			description: 'Add validation with real-time feedback',
			icon: '✅'
		},
		{
			id: 'advanced',
			title: '5. Advanced Features',
			description: 'Custom snippets, nested forms, and complex layouts',
			icon: '⚙️'
		}
	]

	/**
	 * @param {string} sectionId
	 */
	function navigateToSection(sectionId) {
		currentSection = sectionId
		goto(`/forms/${sectionId}`)
	}
</script>

<svelte:head>
	<title>Forms Tutorial - Progressive Enhancement | Rokkit</title>
	<meta
		name="description"
		content="Learn forms development from basic inputs to advanced form builders"
	/>
</svelte:head>

<div class="bg-neutral-50 dark:bg-neutral-900">
	<!-- Header -->
	<header class="border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Forms Tutorial</h1>
					<p class="mt-2 text-neutral-600 dark:text-neutral-400">
						Progressive enhancement from basic inputs to advanced form builders
					</p>
				</div>
				<div class="hidden sm:flex sm:items-center sm:space-x-4">
					<span class="text-sm text-neutral-500 dark:text-neutral-400">
						Built with @rokkit/forms
					</span>
				</div>
			</div>
		</div>
	</header>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
			<!-- Sidebar Navigation -->
			<aside class="lg:col-span-1">
				<nav class="sticky top-8">
					<h2 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
						Tutorial Sections
					</h2>
					<ul class="space-y-2">
						{#each sections as section, index (section.id)}
							<li>
								<button
									onclick={() => navigateToSection(section.id)}
									class="w-full rounded-lg p-4 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
									class:bg-primary-50={currentSection === section.id}
									class:border-primary-200={currentSection === section.id}
									class:border={currentSection === section.id}
									class:dark:bg-primary-900={currentSection === section.id}
									class:dark:opacity-20={currentSection === section.id}
									class:dark:border-primary-700={currentSection === section.id}
								>
									<div class="flex items-start space-x-3">
										<div class="flex-shrink-0">
											<div class="text-primary-600 dark:text-primary-400 text-xl">
												{section.icon}
											</div>
										</div>
										<div class="min-w-0 flex-1">
											<h3 class="text-sm font-medium text-neutral-900 dark:text-white">
												{section.title}
											</h3>
											<p class="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
												{section.description}
											</p>
										</div>
									</div>
								</button>
							</li>
						{/each}
					</ul>

					<!-- Progress Indicator -->
					<div class="mt-8 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
						<h3 class="mb-2 text-sm font-medium text-neutral-900 dark:text-white">Progress</h3>
						<div class="space-y-2">
							{#each sections as section, index (section.id)}
								<div class="flex items-center space-x-2">
									<div
										class="h-2 w-2 rounded-full"
										class:bg-primary-500={index === 0}
										class:bg-neutral-300={index > 0}
										class:dark:bg-neutral-600={index > 0}
									></div>
									<span class="text-xs text-neutral-600 dark:text-neutral-400">
										{section.title}
									</span>
								</div>
							{/each}
						</div>
					</div>
				</nav>
			</aside>

			<!-- Main Content -->
			<main class="lg:col-span-3">
				<div class="rounded-lg bg-white p-8 shadow-sm dark:bg-neutral-800">
					<!-- Welcome Content -->
					<div class="text-center">
						<div
							class="bg-primary-100 dark:bg-primary-900 mx-auto mb-6 h-24 w-24 rounded-full p-6 dark:opacity-20"
						>
							<div class="text-primary-600 dark:text-primary-400 text-4xl">📝</div>
						</div>

						<h2 class="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">
							Welcome to the Forms Tutorial
						</h2>

						<p class="mb-8 text-neutral-600 dark:text-neutral-400">
							This tutorial will guide you through building forms with the Rokkit Forms system, from
							basic input components to advanced form builders with validation and custom rendering.
						</p>

						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<!-- Quick Start -->
							<div class="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
								<div class="text-primary-600 dark:text-primary-400 mb-4">
									<div class="text-2xl">🚀</div>
								</div>
								<h3 class="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
									Quick Start
								</h3>
								<p class="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
									Jump right into building forms with our step-by-step guide.
								</p>
								<button
									onclick={() => navigateToSection('inputs')}
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
								<h3 class="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
									Key Features
								</h3>
								<ul class="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
									<li>• Universal Input components</li>
									<li>• Automatic schema derivation</li>
									<li>• Snippet-based rendering</li>
									<li>• Real-time validation</li>
									<li>• Custom form layouts</li>
								</ul>
							</div>
						</div>

						<!-- Learning Path -->
						<div class="mt-8 rounded-lg bg-neutral-50 p-6 dark:bg-neutral-700/50">
							<h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
								Learning Path
							</h3>
							<div class="grid grid-cols-1 gap-4 sm:grid-cols-5">
								{#each sections as section, index (section.id)}
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
										{#if index < sections.length - 1}
											<div
												class="mt-2 h-px w-full bg-neutral-200 sm:hidden dark:bg-neutral-600"
											></div>
										{/if}
									</div>
									{#if index < sections.length - 1}
										<div
											class="hidden h-px bg-neutral-200 sm:block sm:self-center dark:bg-neutral-600"
										></div>
									{/if}
								{/each}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	</div>
</div>

<style>
	/* Custom icon classes can be added here if needed */
</style>
