<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Icon - Primitives | Learn Rokkit</title>
	<meta name="description" content="Display icons with customizable sizes and styles" />
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>🎨</span>Icon Component</h1>
				<p>
					Display icons with customizable sizes and styles
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			The Icon component in our library is designed to be easy to use and customizable, allowing you
			to include icons in your application with minimal effort. In this tutorial, we will learn how
			to use the Icon component and explore its customization options.
		</p>

		<h3>Basic Usage</h3>
		<p>
			To use the Icon component, simply import it and provide the `name` prop, which should
			correspond to the name of the icon you want to display:
		</p>

		<StoryViewer {...storyBuilder.getExample('intro')} />

		<div data-content-block>
			<h4>Basic Implementation:</h4>
			<Code {...storyBuilder.getFragment(0)} />
			<p>
				This will render the dark mode icon from the Rokkit icon set. Make sure to include the
				appropriate icon set in your project.
			</p>
		</div>
	</section>

	<!-- Custom Sizes -->
	<section>
		<h2>Custom Sizes</h2>
		<p>
			You can easily customize the size of the icon using the `size` prop. The available sizes are
			`small`, `medium`, `large`, and `base` (default):
		</p>
		<StoryViewer {...storyBuilder.getExample('size')} />

		<div data-content-block>
			<h4>Size Options:</h4>
			<Code {...storyBuilder.getFragment(1)} />
		</div>
	</section>

	<!-- Interactive Icons -->
	<section>
		<h2>Interactive Icons</h2>
		<p>
			By default, the role is set to `img`, but you can change it to `button` to use it as a button.
			You can also add click event handlers to make icons interactive.
		</p>
		<StoryViewer {...storyBuilder.getExample('button')} />

		<div class="space-y-6">
			<div data-card>
				<h4>Button Role</h4>
				<Code {...storyBuilder.getFragment(2)} />
			</div>

			<div data-card>
				<h4>With Event Handler</h4>
				<Code {...storyBuilder.getFragment(3)} />
				<p>
					The `click` event will be triggered not only when the button is clicked, but also when it
					is focused and the user presses the `Enter` key.
				</p>
			</div>
		</div>
	</section>

	<!-- Properties -->
	<section>
		<h2>Properties</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Core Properties</h4>
				<ul>
					<li><strong>name</strong>: Icon name (required)</li>
					<li><strong>size</strong>: Icon size ('small', 'medium', 'large', 'base')</li>
					<li><strong>role</strong>: ARIA role ('img', 'button')</li>
					<li><strong>label</strong>: Accessibility label</li>
				</ul>
			</div>

			<div data-card>
				<h4>Styling</h4>
				<ul>
					<li><strong>class</strong>: Custom CSS classes</li>
				</ul>
			</div>
		</div>

		<div data-content-block class="border-amber-subtle bg-amber-inset">
			<div class="flex items-start space-x-3">
				<div class="text-2xl">♿</div>
				<div>
					<h4>Accessibility</h4>
					<p>
						You can set the `aria-label` for the icon using the label property to improve
						accessibility for screen readers.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Continue learning</h3>
		<p>
			Icons are often used with other primitive components like Items and Pills.
		</p>
		<span>
			<a href="/tutorial/primitives/item" class="button is-primary">
				Item Component
				<span class="ml-2">→</span>
			</a>
			<a href="/tutorial/primitives/pill" class="button is-primary">
				Pill Component
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
