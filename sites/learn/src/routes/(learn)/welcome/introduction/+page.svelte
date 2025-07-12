<script>
	import { StoryViewer } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>👋</span>Welcome to Rokkit!</h1>
				<p>
					This will teach you everything you need to know to simplify your workflow of building
					data-driven web applications.
				</p>
			</div>
		</div>
	</header>
	<section>
		<h2>What is Rokkit?</h2>
		<p>
			Rokkit is a Svelte UI library designed to simplify the way we create data-driven applications.
			With its intuitive design and an extensive collection of actions, stores, utility functions,
			and composable components, Rokkit empowers developers to create stunning user interfaces with
			unmatched ease and flexibility.
		</p>

		<h3>The library includes:</h3>
		<ul>
			<li>Data-Driven Components</li>
			<li>Form Elements & Generators</li>
			<li>Grouped Components</li>
			<li>Composable components</li>
			<li>Actions</li>
			<li>Stores</li>
			<li>Useful Utility Functions</li>
		</ul>

		<p>
			At the heart of Rokkit's design is a commitment to consistency and ease of use. We wanted to
			make it easier to use components and extend them if needed to achieve the application
			objectives.
		</p>
	</section>

	<!-- Interactive Demo -->
	<section>
		<h3>Try it yourself</h3>
		<p>
			Here's a simple example of a Rokkit List component. Click on any item to see how data-driven
			components work:
		</p>

		<StoryViewer {...storyBuilder.getExample('example')} />
	</section>

	<!-- Why Rokkit -->
	<section>
		<h2>Why Rokkit?</h2>
		<p>
			The following are some key challenges developers encounter when building applications that
			interact with APIs for data retrieval and storage:
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div>
				<h4>Common Challenges</h4>
				<ul>
					<li>Converting API data to component-compatible formats</li>
					<li>Additional coding effort for composable components</li>
					<li>Theme misalignment with existing libraries</li>
					<li>Inconsistent iconography across components</li>
					<li>Limited component extensibility</li>
				</ul>
			</div>

			<div>
				<h4>Rokkit Solutions</h4>
				<ul>
					<li>Efficient data transformation out of the box</li>
					<li>Improved component reusability</li>
					<li>Flexible library integration with theming</li>
					<li>Unified iconography system</li>
					<li>Adaptable components designed for extensibility</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- How Rokkit Addresses Challenges -->
	<section>
		<h2>How Rokkit Addresses These Challenges</h2>

		<div>
			<h4><span>🚀</span> Efficient Data Transformation</h4>
			<p>
				Rokkit streamlines the conversion of data from APIs into structures compatible with
				components, allowing UI developers to concentrate on other aspects of the application.
			</p>
		</div>

		<div>
			<h4><span>🔄</span> Improved Component Reusability</h4>
			<p>
				Rokkit enables developers to utilize data-driven components, reducing the need for custom
				components and enhancing the efficiency of the development process.
			</p>
		</div>

		<div>
			<h4><span>🎨</span> Flexible Library Integration</h4>
			<p>
				By default, Rokkit's components are unstyled. A collection of pre-built themes is available
				for use as a foundation, which can be extended to align with the application's theme and
				color scheme.
			</p>
		</div>

		<div>
			<h4><span>🎯</span> Unified Iconography</h4>
			<p>
				Rokkit employs UnoCSS for icons, offering a predefined set of customizable icons.
				Alternative icons can be supplied for the aliases used, and icons can be passed as
				parameters to components for further customization.
			</p>
		</div>

		<div>
			<h4><span>⚙️</span>Adaptable Components</h4>
			<p>
				Rokkit's components are designed with extensibility in mind, empowering developers to
				address a wide range of application requirements without being constrained by the
				limitations of standard components.
			</p>
		</div>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready to get started?</h3>
		<p>
			Now that you understand what Rokkit is and how it can help you, let's set up your first
			project and start building!
		</p>
		<span>
			<a href="/tutorial/welcome/getting-started" class="button is-primary">
				Getting Started
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
