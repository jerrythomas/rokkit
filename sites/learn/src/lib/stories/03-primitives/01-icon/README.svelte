<script>
	import { StoryRoot } from '$lib/components/Story'
</script>

<div class="w-full space-y-8">
	<!-- Header -->
	<header class="border-neutral-subtle border-b pb-8">
		<div class="flex items-center space-x-3">
			<div class="text-4xl">🎨</div>
			<div>
				<h1 class="text-neutral-overlay text-4xl font-bold">Icon Component</h1>
				<p class="text-neutral-elevated mt-2 text-xl">
					Display icons with customizable sizes and styles
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Introduction</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			The Icon component provides a consistent way to display icons throughout your application
			with support for different icon libraries and customizable styling.
		</p>

		<StoryRoot
			slug="primitives/icon"
			title="Icon Demo"
			description="Basic icon usage with different sizes and styles"
		/>
	</section>

	<!-- Usage -->
	<section>
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Usage</h2>
		<p class="text-neutral-floating mb-4">
			Icons can be used with different libraries and icon sets. The component automatically handles
			sizing and styling based on your theme configuration.
		</p>

		<div class="rounded-md bg-neutral-900 p-4 dark:bg-neutral-800">
			<code class="text-sm">
				<div class="text-blue-400">&lt;script&gt;</div>
				<div class="ml-4 text-yellow-300">import</div>
				<div class="ml-4">{'{ Icon }'} <span class="text-yellow-300">from</span> <span class="text-green-400">'@rokkit/ui'</span></div>
				<div class="text-blue-400">&lt;/script&gt;</div>
				<div></div>
				<div class="text-blue-400">&lt;Icon name="star" size="lg" /&gt;</div>
			</code>
		</div>
	</section>

	<!-- Next Steps -->
	<section class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
		<h3 class="text-primary-overlay mb-3 text-xl font-semibold">Continue learning</h3>
		<p class="text-primary-floating mb-4">
			Icons are often used with other primitive components like Items and Pills.
		</p>
		<div class="flex flex-wrap gap-3">
			<a
				href="/tutorial/primitives/item"
				class="bg-primary-overlay hover:bg-primary-hover focus:ring-primary-subtle inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
			>
				Item Component
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</div>