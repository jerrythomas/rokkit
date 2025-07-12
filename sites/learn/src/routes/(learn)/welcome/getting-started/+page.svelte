<script>
	import { StoryViewer } from '$lib/components/Story'
	import { stories } from './stories.js'
</script>

<svelte:head>
	<title>Getting Started - Welcome to Rokkit | Learn Rokkit</title>
	<meta
		name="description"
		content="Set up your first Rokkit project and start building data-driven applications"
	/>
</svelte:head>

<div class="w-full space-y-8">
	<!-- Header -->
	<header class="border-neutral-subtle border-b pb-8">
		<div class="flex items-center space-x-3">
			<div class="text-4xl">🚀</div>
			<div>
				<h1 class="text-neutral-overlay text-4xl font-bold">Getting Started</h1>
				<p class="text-neutral-elevated mt-2 text-xl">
					Set up your first Rokkit project and start building data-driven applications
				</p>
			</div>
		</div>
	</header>

	<!-- Prerequisites -->
	<section class="border-amber-subtle bg-amber-inset rounded-lg border p-6">
		<div class="flex items-start space-x-3">
			<div class="text-2xl">ℹ️</div>
			<div>
				<h3 class="text-amber-overlay mb-2 text-lg font-semibold">Prerequisites</h3>
				<p class="text-amber-floating">
					You'll need to have basic familiarity with <strong>Svelte/SvelteKit</strong> to use Rokkit
					effectively.
				</p>
			</div>
		</div>
	</section>

	<!-- Rokkit Libraries -->
	<section>
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Rokkit Libraries</h2>
		<p class="text-neutral-floating mb-6 text-lg">
			Rokkit consists of several focused libraries that work together to provide a complete
			development experience:
		</p>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="space-y-3">
				<div class="border-neutral-subtle rounded-lg border p-4">
					<h3 class="text-primary-overlay font-semibold">@rokkit/core</h3>
					<p class="text-neutral-floating text-sm">Core utilities and shared functionality</p>
				</div>
				<div class="border-neutral-subtle rounded-lg border p-4">
					<h3 class="text-primary-overlay font-semibold">@rokkit/icons</h3>
					<p class="text-neutral-floating text-sm">Unified icon system with UnoCSS</p>
				</div>
				<div class="border-neutral-subtle rounded-lg border p-4">
					<h3 class="text-primary-overlay font-semibold">@rokkit/actions</h3>
					<p class="text-neutral-floating text-sm">Svelte actions for enhanced functionality</p>
				</div>
				<div class="border-neutral-subtle rounded-lg border p-4">
					<h3 class="text-primary-overlay font-semibold">@rokkit/states</h3>
					<p class="text-neutral-floating text-sm">State management utilities</p>
				</div>
			</div>
			<div class="space-y-3">
				<div class="border-neutral-subtle rounded-lg border p-4">
					<h3 class="text-primary-overlay font-semibold">@rokkit/ui</h3>
					<p class="text-neutral-floating text-sm">Data-driven UI components</p>
				</div>
				<div class="border-neutral-subtle rounded-lg border p-4">
					<h3 class="text-primary-overlay font-semibold">@rokkit/layout</h3>
					<p class="text-neutral-floating text-sm">Layout and structural components</p>
				</div>
				<div class="border-neutral-subtle rounded-lg border p-4">
					<h3 class="text-primary-overlay font-semibold">@rokkit/themes</h3>
					<p class="text-neutral-floating text-sm">Theming system and utilities</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Setup Instructions -->
	<section>
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Setup Instructions</h2>

		<div class="space-y-8">
			<!-- Step 1: UnoCSS -->
			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">
					<span
						class="bg-primary-inset text-primary-overlay mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
						>1</span
					>
					Add UnoCSS to your SvelteKit project
				</h3>
				<p class="text-neutral-floating mb-4">
					Rokkit uses UnoCSS for styling. Follow the official UnoCSS integration guide for
					SvelteKit:
				</p>
				<a
					href="https://unocss.dev/integrations/vite#sveltekit"
					target="_blank"
					class="text-primary-overlay hover:text-primary-hover inline-flex items-center"
				>
					UnoCSS SvelteKit Integration Guide
					<span class="ml-1">↗</span>
				</a>
			</div>

			<!-- Step 2: Quick Start Template -->
			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">
					<span
						class="bg-primary-inset text-primary-overlay mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
						>2</span
					>
					Clone the Quick Start Template
				</h3>
				<p class="text-neutral-floating mb-4">
					The fastest way to get started is to use our pre-configured template:
				</p>
				<div class="bg-neutral-elevated rounded-md p-4">
					<code class="text-sm text-green-400">
						<div>npx degit jerrythomas/rokkit/sites/quick-start my-app</div>
						<div>cd my-app</div>
						<div>pnpm i</div>
					</code>
				</div>
			</div>

			<!-- Step 3: Try a Component -->
			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">
					<span
						class="bg-primary-inset text-primary-overlay mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
						>3</span
					>
					Try Your First Component
				</h3>
				<p class="text-neutral-floating mb-4">
					Add this code to your <code class="bg-neutral-subtle rounded px-2 py-1 text-sm"
						>+page.svelte</code
					> file:
				</p>
				<div class="bg-neutral-elevated mb-4 rounded-md">
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

				<p class="text-neutral-floating mb-4">Try it out:</p>
				<div class="bg-neutral-base border-neutral-subtle rounded-lg border p-6">
					{#await stories}
						<p>Loading...</p>
					{:then groupedStories}
						<StoryViewer {...groupedStories.example} />
					{/await}
				</div>
			</div>
		</div>
	</section>

	<!-- What's Next -->
	<section class="bg-primary-inset rounded-lg p-6">
		<h3 class="text-primary-overlay mb-3 text-xl font-semibold">What's Next?</h3>
		<p class="text-primary-floating mb-6">
			Now that you have Rokkit set up, explore the different types of components and learn how to
			build powerful data-driven applications:
		</p>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<a
				href="/tutorial/elements/list"
				class="bg-neutral-base border-primary-subtle rounded-lg border p-4 transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-2xl">📋</div>
				<h4 class="text-primary-overlay font-semibold">Elements</h4>
				<p class="text-primary-floating text-sm">Core UI components like Lists, Tabs, and Tables</p>
			</a>

			<a
				href="/tutorial/primitives/icon"
				class="bg-neutral-base border-primary-subtle rounded-lg border p-4 transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-2xl">🧩</div>
				<h4 class="text-primary-overlay font-semibold">Primitives</h4>
				<p class="text-primary-floating text-sm">Building blocks like Icons, Items, and Pills</p>
			</a>

			<a
				href="/tutorial/forms/inputs"
				class="bg-neutral-base border-primary-subtle rounded-lg border p-4 transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-2xl">📝</div>
				<h4 class="text-primary-overlay font-semibold">Forms</h4>
				<p class="text-primary-floating text-sm">
					Form building, validation, and advanced features
				</p>
			</a>
		</div>
	</section>
</div>
