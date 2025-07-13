<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Forms Overview | Learn Rokkit</title>
	<meta
		name="description"
		content="Create forms easily by providing an object as the initial value with progressive enhancement"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>📋</span>Forms Overview</h1>
				<p>
					Create forms easily by providing an object as the initial value with progressive enhancement
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			The Form component allows you to create forms easily by providing an object as the initial value. You can progressively enhance the form by adding a schema to define the structure and validation properties for each attribute of the object.
		</p>

		<h3>Notable features:</h3>
		<ul>
			<li>Automatic form generation from data objects</li>
			<li>Progressive enhancement with schema definitions</li>
			<li>Built-in validation with visual feedback</li>
			<li>Flexible layout control</li>
			<li>Real-time validation as users interact</li>
			<li>Support for complex form structures</li>
		</ul>

		<h3>Basic Example</h3>
		<p>
			Here's a simple example of a Form component. The form automatically creates input controls for each attribute in the object:
		</p>

		<StoryViewer {...storyBuilder.getExample('introduction')} />
	</section>

	<!-- Simple Form -->
	<section>
		<h2>A Simple Form</h2>
		<p>
			To get started, you can simply provide an object as the initial value for the form. The component will automatically create input controls for each attribute in the object.
		</p>

		<Code {...storyBuilder.getFragment(0)} />

		<p>
			Note that the value changes are being displayed as you make changes. Also, note that email is identified as a string and does not have any validations attached to it initially.
		</p>

		<div data-card>
			<h4>Automatic Type Detection</h4>
			<p>
				The Form component automatically detects data types and creates appropriate input controls:
			</p>
			<ul>
				<li><strong>String</strong>: Creates text inputs</li>
				<li><strong>Number</strong>: Creates number inputs</li>
				<li><strong>Boolean</strong>: Creates checkbox inputs</li>
				<li><strong>Date</strong>: Creates date inputs</li>
			</ul>
		</div>
	</section>

	<!-- Form Capabilities -->
	<section>
		<h2>Form Capabilities</h2>
		<p>
			The Form component can be progressively enhanced with advanced features. Start simple and add complexity as needed.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Core Features</h4>
				<ul>
					<li>Automatic form generation from data objects</li>
					<li>Progressive enhancement with schemas</li>
					<li>Real-time validation feedback</li>
					<li>Flexible layout control</li>
				</ul>
			</div>

			<div data-card>
				<h4>Advanced Features</h4>
				<ul>
					<li>Remote API integration</li>
					<li>Custom field snippets</li>
					<li>Multi-step wizards</li>
					<li>Dynamic field generation</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Progressive Enhancement -->
	<section>
		<h2>Progressive Enhancement</h2>
		<p>
			Rokkit forms follow a progressive enhancement approach. Start with simple object-to-form generation, then add schemas, validation, layout control, and advanced features as your needs grow.
		</p>

		<h3>Enhancement Layers</h3>
		<ol>
			<li><strong>Basic Forms</strong>: Object-to-form generation with automatic type detection</li>
			<li><strong>Schema Enhancement</strong>: Field definitions, types, and validation rules</li>
			<li><strong>Layout Control</strong>: Organized field layout with rows and columns</li>
			<li><strong>Validation</strong>: Real-time feedback and error handling</li>
			<li><strong>Advanced Features</strong>: Remote integration and custom behaviors</li>
		</ol>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready for more?</h3>
		<p>
			Now that you understand form basics, explore schemas for field configuration, validation for data quality, or advanced features for complex scenarios.
		</p>
		<span>
			<a href="/forms/schema" class="button is-primary">
				Schema
				<span class="ml-2">→</span>
			</a>
			<a href="/forms/validation" class="button is-primary">
				Validation
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>