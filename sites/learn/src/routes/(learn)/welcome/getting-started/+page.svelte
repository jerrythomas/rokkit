<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Getting Started - Welcome to Rokkit | Learn Rokkit</title>
	<meta
		name="description"
		content="Set up your first Rokkit project and start building data-driven applications"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>🚀</span>Getting Started</h1>
				<p>Set up your first Rokkit project and start building data-driven applications</p>
			</div>
		</div>
	</header>

	<!-- Prerequisites -->
	<section data-content-block class="border-amber-subtle bg-amber-inset">
		<div class="flex items-start space-x-3">
			<div class="text-2xl">ℹ️</div>
			<div>
				<h3>Prerequisites</h3>
				<p>
					You'll need to have basic familiarity with <strong>Svelte/SvelteKit</strong> to use Rokkit
					effectively.
				</p>
			</div>
		</div>
	</section>

	<!-- Rokkit Libraries -->
	<section>
		<h2>Rokkit Libraries</h2>
		<p>
			Rokkit consists of several focused libraries that work together to provide a complete
			development experience:
		</p>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div data-card>
				<h4>@rokkit/core</h4>
				<p>Core utilities and shared functionality</p>
			</div>
			<div data-card>
				<h4>@rokkit/icons</h4>
				<p>Unified icon system with UnoCSS</p>
			</div>
			<div data-card>
				<h4>@rokkit/actions</h4>
				<p>Svelte actions for enhanced functionality</p>
			</div>
			<div data-card>
				<h4>@rokkit/states</h4>
				<p>State management utilities</p>
			</div>
			<div data-card>
				<h4>@rokkit/ui</h4>
				<p>Data-driven UI components</p>
			</div>
			<div data-card>
				<h4>@rokkit/layout</h4>
				<p>Layout and structural components</p>
			</div>
			<div data-card>
				<h4>@rokkit/themes</h4>
				<p>Theming system and utilities</p>
			</div>
		</div>
	</section>

	<!-- Setup Instructions -->
	<section>
		<h2>Setup Instructions</h2>

		<div class="space-y-8">
			<!-- Step 1: UnoCSS -->
			<div>
				<h3>
					<span
						class="bg-primary-inset text-primary-overlay mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
						>1</span
					>
					Add UnoCSS to your SvelteKit project
				</h3>
				<p>
					Rokkit uses UnoCSS for styling. Follow the official UnoCSS integration guide for
					SvelteKit:
				</p>
				<span>
					<a
						href="https://unocss.dev/integrations/vite#sveltekit"
						target="_blank"
						class="button is-secondary"
					>
						UnoCSS SvelteKit Integration Guide
						<span class="ml-1">↗</span>
					</a>
				</span>
			</div>

			<!-- Step 2: Quick Start Template -->
			<div>
				<h3>
					<span
						class="bg-primary-inset text-primary-overlay mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
						>2</span
					>
					Clone the Quick Start Template
				</h3>
				<p>The fastest way to get started is to use our pre-configured template:</p>
				<Code {...storyBuilder.getFragment(0)} />
			</div>

			<!-- Step 3: Try a Component -->
			<div>
				<h3>
					<span
						class="bg-primary-inset text-primary-overlay mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
						>3</span
					>
					Try Your First Component
				</h3>
				<p>
					Add this code to your <code>+page.svelte</code> file:
				</p>
				<Code {...storyBuilder.getFragment(1)} />

				<p>Try it out:</p>
				<div class="bg-neutral-base border-neutral-subtle rounded-lg border p-6">
					<StoryViewer {...storyBuilder.getExample('example')} />
				</div>
			</div>
		</div>
	</section>

	<!-- What's Next -->
	<section data-card-cta>
		<h3>What's Next?</h3>
		<p>
			Now that you have Rokkit set up, explore the different types of components and learn how to
			build powerful data-driven applications:
		</p>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<a
				href="/tutorial/elements/list"
				class="bg-neutral-base border-primary-subtle rounded-lg border p-4 transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-2xl">📋</div>
				<h4>Elements</h4>
				<p>Core UI components like Lists, Tabs, and Tables</p>
			</a>

			<a
				href="/tutorial/primitives/icon"
				class="bg-neutral-base border-primary-subtle rounded-lg border p-4 transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-2xl">🧩</div>
				<h4>Primitives</h4>
				<p>Building blocks like Icons, Items, and Pills</p>
			</a>

			<a
				href="/tutorial/forms/inputs"
				class="bg-neutral-base border-primary-subtle rounded-lg border p-4 transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-2xl">📝</div>
				<h4>Forms</h4>
				<p>Form building, validation, and advanced features</p>
			</a>
		</div>
	</section>
</article>
