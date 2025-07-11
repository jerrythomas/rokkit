<script>
	import { List } from '@rokkit/ui'

	let items = ['Fruits', 'Vegetables', 'Nuts', 'Spices']
	let value = $state(null)
</script>

<div class="space-y-8">
	<!-- Header -->
	<header class="border-b border-neutral-200 pb-8 dark:border-neutral-700">
		<div class="flex items-center space-x-3">
			<div class="text-4xl">🚀</div>
			<div>
				<h1 class="text-4xl font-bold text-neutral-900 dark:text-white">Getting Started</h1>
				<p class="mt-2 text-xl text-neutral-600 dark:text-neutral-400">
					Set up your first Rokkit project and start building data-driven applications
				</p>
			</div>
		</div>
	</header>

	<!-- Prerequisites -->
	<section
		class="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20"
	>
		<div class="flex items-start space-x-3">
			<div class="text-2xl">ℹ️</div>
			<div>
				<h3 class="mb-2 text-lg font-semibold text-amber-900 dark:text-amber-100">Prerequisites</h3>
				<p class="text-amber-800 dark:text-amber-200">
					You'll need to have basic familiarity with <strong>Svelte/SvelteKit</strong> to use Rokkit
					effectively.
				</p>
			</div>
		</div>
	</section>

	<!-- Rokkit Libraries -->
	<section>
		<h2 class="mb-6 text-3xl font-bold text-neutral-900 dark:text-white">Rokkit Libraries</h2>
		<p class="mb-6 text-lg text-neutral-700 dark:text-neutral-300">
			Rokkit consists of several focused libraries that work together to provide a complete
			development experience:
		</p>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="space-y-3">
				<div class="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 font-semibold">@rokkit/core</h3>
					<p class="text-sm text-neutral-600 dark:text-neutral-400">
						Core utilities and shared functionality
					</p>
				</div>
				<div class="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 font-semibold">@rokkit/icons</h3>
					<p class="text-sm text-neutral-600 dark:text-neutral-400">
						Unified icon system with UnoCSS
					</p>
				</div>
				<div class="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 font-semibold">@rokkit/actions</h3>
					<p class="text-sm text-neutral-600 dark:text-neutral-400">
						Svelte actions for enhanced functionality
					</p>
				</div>
				<div class="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 font-semibold">@rokkit/states</h3>
					<p class="text-sm text-neutral-600 dark:text-neutral-400">State management utilities</p>
				</div>
			</div>
			<div class="space-y-3">
				<div class="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 font-semibold">@rokkit/ui</h3>
					<p class="text-sm text-neutral-600 dark:text-neutral-400">Data-driven UI components</p>
				</div>
				<div class="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 font-semibold">@rokkit/layout</h3>
					<p class="text-sm text-neutral-600 dark:text-neutral-400">
						Layout and structural components
					</p>
				</div>
				<div class="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 font-semibold">@rokkit/themes</h3>
					<p class="text-sm text-neutral-600 dark:text-neutral-400">Theming system and utilities</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Setup Instructions -->
	<section>
		<h2 class="mb-6 text-3xl font-bold text-neutral-900 dark:text-white">Setup Instructions</h2>

		<div class="space-y-8">
			<!-- Step 1: UnoCSS -->
			<div class="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
				<h3 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
					<span
						class="bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400 mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
						>1</span
					>
					Add UnoCSS to your SvelteKit project
				</h3>
				<p class="mb-4 text-neutral-700 dark:text-neutral-300">
					Rokkit uses UnoCSS for styling. Follow the official UnoCSS integration guide for
					SvelteKit:
				</p>
				<a
					href="https://unocss.dev/integrations/vite#sveltekit"
					target="_blank"
					class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 inline-flex items-center"
				>
					UnoCSS SvelteKit Integration Guide
					<span class="ml-1">↗</span>
				</a>
			</div>

			<!-- Step 2: Quick Start Template -->
			<div class="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
				<h3 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
					<span
						class="bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400 mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
						>2</span
					>
					Clone the Quick Start Template
				</h3>
				<p class="mb-4 text-neutral-700 dark:text-neutral-300">
					The fastest way to get started is to use our pre-configured template:
				</p>
				<div class="rounded-md bg-neutral-900 p-4 dark:bg-neutral-800">
					<code class="text-sm text-green-400">
						<div>npx degit jerrythomas/rokkit/sites/quick-start my-app</div>
						<div>cd my-app</div>
						<div>pnpm i</div>
					</code>
				</div>
			</div>

			<!-- Step 3: Try a Component -->
			<div class="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
				<h3 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
					<span
						class="bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400 mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
						>3</span
					>
					Try Your First Component
				</h3>
				<p class="mb-4 text-neutral-700 dark:text-neutral-300">
					Add this code to your <code
						class="rounded bg-neutral-200 px-2 py-1 text-sm dark:bg-neutral-700">+page.svelte</code
					> file:
				</p>
				<div class="mb-4 rounded-md bg-neutral-900 dark:bg-neutral-800">
					<code class="text-sm">
						<div class="text-blue-400">&lt;script&gt;</div>
						<div class="ml-4 text-yellow-300">import</div>
						<div class="ml-4">
							{'{ List }'} <span class="text-yellow-300">from</span>
							<span class="text-green-400">'@rokkit/ui'</span>
						</div>
						<div></div>
						<div class="ml-4">
							<span class="text-yellow-300">let</span> items = [<span class="text-green-400"
								>'Fruits'</span
							>, <span class="text-green-400">'Vegetables'</span>,
							<span class="text-green-400">'Nuts'</span>,
							<span class="text-green-400">'Spices'</span>]
						</div>
						<div class="ml-4"><span class="text-yellow-300">let</span> value</div>
						<div class="text-blue-400">&lt;/script&gt;</div>
						<div></div>
						<div class="text-blue-400">&lt;List {'{items}'} bind:value /&gt;</div>
						<div class="text-blue-400">&lt;p&gt;</div>
						<div class="ml-4">
							Selected Value: <span class="text-blue-400">&lt;b&gt;</span>{'{value}'}<span
								class="text-blue-400">&lt;/b&gt;</span
							>
						</div>
						<div class="text-blue-400">&lt;/p&gt;</div>
					</code>
				</div>

				<p class="mb-4 text-neutral-700 dark:text-neutral-300">Try it out:</p>
				<div
					class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900"
				>
					<List {items} bind:value />
					<p class="mt-4 text-neutral-700 dark:text-neutral-300">
						Selected Value: <strong class="text-neutral-900 dark:text-white"
							>{value || 'None'}</strong
						>
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- What's Next -->
	<section class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
		<h3 class="text-primary-900 dark:text-primary-100 mb-3 text-xl font-semibold">What's Next?</h3>
		<p class="text-primary-800 dark:text-primary-200 mb-6">
			Now that you have Rokkit set up, explore the different types of components and learn how to
			build powerful data-driven applications:
		</p>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<a
				href="/tutorial/elements/list"
				class="border-primary-200 dark:border-primary-800 dark:bg-primary-900/10 rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-2xl">📋</div>
				<h4 class="text-primary-900 dark:text-primary-100 font-semibold">Elements</h4>
				<p class="text-primary-700 dark:text-primary-300 text-sm">
					Core UI components like Lists, Tabs, and Tables
				</p>
			</a>

			<a
				href="/tutorial/primitives/icon"
				class="border-primary-200 dark:border-primary-800 dark:bg-primary-900/10 rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-2xl">🧩</div>
				<h4 class="text-primary-900 dark:text-primary-100 font-semibold">Primitives</h4>
				<p class="text-primary-700 dark:text-primary-300 text-sm">
					Building blocks like Icons, Items, and Pills
				</p>
			</a>

			<a
				href="/tutorial/forms/inputs"
				class="border-primary-200 dark:border-primary-800 dark:bg-primary-900/10 rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-2xl">📝</div>
				<h4 class="text-primary-900 dark:text-primary-100 font-semibold">Forms</h4>
				<p class="text-primary-700 dark:text-primary-300 text-sm">
					Form building, validation, and advanced features
				</p>
			</a>
		</div>
	</section>
</div>