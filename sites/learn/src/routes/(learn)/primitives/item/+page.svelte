<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Item - Primitives | Learn Rokkit</title>
	<meta
		name="description"
		content="Versatile component for rendering text, icons, and images with field mapping support"
	/>
</svelte:head>

<div class="w-full space-y-8">
	<!-- Header -->
	<header class="border-neutral-subtle border-b pb-8">
		<div class="flex items-center space-x-3">
			<div class="text-4xl">🧩</div>
			<div>
				<h1 class="text-neutral-overlay text-4xl font-bold">Item Component</h1>
				<p class="text-neutral-elevated mt-2 text-xl">
					Versatile component for rendering text, icons, and images with field mapping support
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Introduction</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			We will learn about the versatile `Item` component that can render various content types, including text, icon, state-based icon, or an image along with text. This component accepts a string or an object as a value and an optional `mapping` prop for field mapping.
		</p>

		<!-- Basic Usage Demo -->
		<div class="mb-8">
			<h3 class="mb-4 text-2xl font-bold">Basic Usage</h3>
			<p class="mb-4">
				To render different types of content, pass various data structures to the `value` prop:
			</p>

			<StoryViewer {...storyBuilder.getExample('intro')} />
		</div>

		<div class="bg-neutral-subtle rounded-lg p-6 mb-6">
			<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">Rendering Different Content Types:</h3>
			<div class="space-y-4">
				<div class="bg-neutral-elevated rounded-md p-4">
					<h4 class="mb-2 font-semibold">Simple Text</h4>
					<Code {...storyBuilder.getFragment(0)} />
				</div>
				<div class="bg-neutral-elevated rounded-md p-4">
					<h4 class="mb-2 font-semibold">Icon and Text</h4>
					<Code {...storyBuilder.getFragment(1)} />
				</div>
				<div class="bg-neutral-elevated rounded-md p-4">
					<h4 class="mb-2 font-semibold">Image and Text</h4>
					<Code {...storyBuilder.getFragment(2)} />
				</div>
			</div>
			<p class="text-neutral-floating mt-4 text-sm">
				Note that the component only renders the icon, image & text, but does not put a wrapper element around it. In the preview, we have used an item tag to wrap the `Item` component.
			</p>
		</div>
	</section>

	<!-- State-based Icons -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">State-based Icons</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			To render text with a state-based icon, pass an object that includes the text, icon, and state fields:
		</p>

		<StoryViewer {...storyBuilder.getExample('state')} />

		<div class="bg-neutral-subtle rounded-lg p-6 mt-6">
			<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">State-based Icon Implementation:</h3>
			<Code {...storyBuilder.getFragment(3)} />
			<p class="text-neutral-floating mt-2 text-sm">
				The icon will automatically switch based on the state value, choosing between the 'open' and 'close' icons.
			</p>
		</div>
	</section>

	<!-- Field Mapping -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Field Mapping</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			The Item component allows you to provide field mappings using the `fields` prop. These mappings enable you to customize the attributes it uses to the content from the provided value.
		</p>

		<StoryViewer {...storyBuilder.getExample('mapping')} />

		<div class="bg-neutral-subtle rounded-lg p-6 mt-6">
			<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">Field Mapping Example:</h3>
			<Code {...storyBuilder.getFragment(4)} />
			<p class="text-neutral-floating mt-2 text-sm">
				The flexibility of field mapping and the ability to render various combinations of text, icons, and images make this component the default item renderer for many of the data-driven components.
			</p>
		</div>
	</section>

	<!-- Properties -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Properties</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">Core Properties</h3>
				<ul class="space-y-3 text-sm">
					<li><strong>value</strong>: String or object with content data (required)</li>
					<li><strong>fields</strong>: Field mapping object for custom data structures</li>
					<li><strong>class</strong>: Custom CSS classes</li>
				</ul>
			</div>

			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">Supported Fields</h3>
				<ul class="space-y-3 text-sm">
					<li><strong>text</strong>: Display text</li>
					<li><strong>icon</strong>: Icon name or state-based icon object</li>
					<li><strong>image</strong>: Image URL</li>
					<li><strong>state</strong>: State for conditional icons</li>
				</ul>
			</div>
		</div>

		<div class="border-blue-subtle bg-blue-inset rounded-lg border p-6 mt-6">
			<div class="flex items-start space-x-3">
				<div class="text-2xl">💡</div>
				<div>
					<h3 class="text-blue-overlay mb-2 text-lg font-semibold">Flexible Data Structures</h3>
					<p class="text-blue-floating">
						The Item component is designed to work with any data structure through field mapping, making it perfect for use in data-driven components like Lists, Menus, and more.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Next Steps -->
	<section class="bg-primary-inset rounded-lg p-6">
		<h3 class="text-primary-overlay mb-3 text-xl font-semibold">Continue learning</h3>
		<p class="text-primary-floating mb-4">
			The Item component is commonly used within data-driven components. Explore how it integrates with other components.
		</p>
		<div class="flex flex-wrap gap-3">
			<a
				href="/tutorial/primitives/pill"
				class="bg-primary-overlay hover:bg-primary-hover focus:ring-primary-subtle inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
			>
				Pill Component
				<span class="ml-2">→</span>
			</a>
			<a
				href="/tutorial/elements/list"
				class="bg-primary-overlay hover:bg-primary-hover focus:ring-primary-subtle inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
			>
				List Component
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</div>