<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Introduction</h1>
	<p>
		The Icon component in our library is designed to be easy to use and customizable, allowing you
		to include icons in your application with minimal effort. In this tutorial, we will learn how to
		use the Icon component and explore its customization options.
	</p>

	<h1>Basic Usage</h1>
	<p>
		To use the Icon component, simply import it and provide the `name` prop, which should correspond
		to the name of the icon you want to display:
	</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<div data-content-block>
		<h1>Basic Implementation:</h1>
		<Code {...storyBuilder.getFragment(0)} />
		<p>
			This will render the dark mode icon from the Rokkit icon set. Make sure to include the
			appropriate icon set in your project.
		</p>
	</div>
	<h1>Custom Sizes</h1>
	<p>
		You can easily customize the size of the icon using the `size` prop. The available sizes are
		`small`, `medium`, `large`, and `base` (default):
	</p>
	<StoryViewer {...storyBuilder.getExample('size')} />

	<div data-content-block>
		<h1>Size Options:</h1>
		<Code {...storyBuilder.getFragment(1)} />
	</div>
	<h1>Interactive Icons</h1>
	<p>
		By default, the role is set to `img`, but you can change it to `button` to use it as a button.
		You can also add click event handlers to make icons interactive.
	</p>
	<StoryViewer {...storyBuilder.getExample('button')} />

	<div class="space-y-6">
		<div data-card>
			<h1>Button Role</h1>
			<Code {...storyBuilder.getFragment(2)} />
		</div>

		<div data-card>
			<h1>With Event Handler</h1>
			<Code {...storyBuilder.getFragment(3)} />
			<p>
				The `click` event will be triggered not only when the button is clicked, but also when it is
				focused and the user presses the `Enter` key.
			</p>
		</div>
	</div>
	<h1>Properties</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Core Properties</h1>
			<ul>
				<li><strong>name</strong>: Icon name (required)</li>
				<li><strong>size</strong>: Icon size ('small', 'medium', 'large', 'base')</li>
				<li><strong>role</strong>: ARIA role ('img', 'button')</li>
				<li><strong>label</strong>: Accessibility label</li>
			</ul>
		</div>

		<div data-card>
			<h1>Styling</h1>
			<ul>
				<li><strong>class</strong>: Custom CSS classes</li>
			</ul>
		</div>
	</div>

	<div data-content-block class="border-amber-z2 bg-amber-z1">
		<div class="flex items-start space-x-3">
			<div class="text-2xl">♿</div>
			<div>
				<h1>Accessibility</h1>
				<p>
					You can set the `aria-label` for the icon using the label property to improve
					accessibility for screen readers.
				</p>
			</div>
		</div>
	</div>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Continue learning</h2>
		<p>Icons are often used with other primitive components like Items and Pills.</p>
		<span>
			<a href="/primitives/item" class="button is-primary">
				Item Component
				<span class="ml-2">→</span>
			</a>
			<a href="/primitives/pill" class="button is-primary">
				Pill Component
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
