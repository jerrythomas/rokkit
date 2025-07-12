<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Icon - Primitives | Learn Rokkit</title>
	<meta name="description" content="Display icons with customizable sizes and styles" />
</svelte:head>

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
			The Icon component in our library is designed to be easy to use and customizable, allowing you
			to include icons in your application with minimal effort. In this tutorial, we will learn how
			to use the Icon component and explore its customization options.
		</p>

		<!-- Basic Usage Demo -->
		<div class="mb-8">
			<h3 class="mb-4 text-2xl font-bold">Basic Usage</h3>
			<p class="mb-4">
				To use the Icon component, simply import it and provide the `name` prop, which should
				correspond to the name of the icon you want to display:
			</p>

			<StoryViewer {...storyBuilder.getExample('intro')} />
		</div>

		<div class="bg-neutral-subtle mb-6 rounded-lg p-6">
			<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">Basic Implementation:</h3>

			<Code {...storyBuilder.getFragment(0)} />

			<p class="text-neutral-floating mt-2 text-sm">
				This will render the dark mode icon from the Rokkit icon set. Make sure to include the
				appropriate icon set in your project.
			</p>
		</div>
	</section>

	<!-- Custom Sizes -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Custom Sizes</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			You can easily customize the size of the icon using the `size` prop. The available sizes are
			`small`, `medium`, `large`, and `base` (default):
		</p>
		<StoryViewer {...storyBuilder.getExample('size')} />

		<div class="bg-neutral-subtle mt-6 rounded-lg p-6">
			<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">Size Options:</h3>
			<Code {...storyBuilder.getFragment(1)} />
		</div>
	</section>

	<!-- Interactive Icons -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Interactive Icons</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			By default, the role is set to `img`, but you can change it to `button` to use it as a button.
			You can also add click event handlers to make icons interactive.
		</p>
		<StoryViewer {...storyBuilder.getExample('button')} />

		<div class="mt-6 space-y-6">
			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">Button Role</h3>

				<Code {...storyBuilder.getFragment(2)} />
			</div>

			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">With Event Handler</h3>

				<Code {...storyBuilder.getFragment(3)} />

				<p class="text-neutral-floating mt-2 text-sm">
					The `click` event will be triggered not only when the button is clicked, but also when it
					is focused and the user presses the `Enter` key.
				</p>
			</div>
		</div>
	</section>

	<!-- Properties -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Properties</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">Core Properties</h3>
				<ul class="space-y-3 text-sm">
					<li><strong>name</strong>: Icon name (required)</li>
					<li><strong>size</strong>: Icon size ('small', 'medium', 'large', 'base')</li>
					<li><strong>role</strong>: ARIA role ('img', 'button')</li>
					<li><strong>label</strong>: Accessibility label</li>
				</ul>
			</div>

			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">Styling</h3>
				<ul class="space-y-3 text-sm">
					<li><strong>class</strong>: Custom CSS classes</li>
				</ul>
			</div>
		</div>

		<div class="border-amber-subtle bg-amber-inset mt-6 rounded-lg border p-6">
			<div class="flex items-start space-x-3">
				<div class="text-2xl">♿</div>
				<div>
					<h3 class="text-amber-overlay mb-2 text-lg font-semibold">Accessibility</h3>
					<p class="text-amber-floating">
						You can set the `aria-label` for the icon using the label property to improve
						accessibility for screen readers.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Next Steps -->
	<section class="bg-primary-inset rounded-lg p-6">
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
			<a
				href="/tutorial/primitives/pill"
				class="bg-primary-overlay hover:bg-primary-hover focus:ring-primary-subtle inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
			>
				Pill Component
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</div>
