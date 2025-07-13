<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Editor - Templates | Learn Rokkit</title>
	<meta
		name="description"
		content="A nested data editor with tree navigation for complex hierarchical data structures"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>🌳</span>Editor Template</h1>
				<p>
					A nested data editor with tree navigation for complex hierarchical data structures
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			Sometimes you may need to deal with a nested hierarchy of data. For example, you may have nested objects at different levels. In such cases you can use the NestedEditor to edit the nested data.
		</p>

		<p>
			It consists of a tree structure to help you navigate through the hierarchy and edit attributes at different levels.
		</p>

		<h3>Notable features:</h3>
		<ul>
			<li>Tree-based navigation for hierarchical data</li>
			<li>Schema-driven editing with validation</li>
			<li>Expandable/collapsible sections</li>
			<li>Individual layouts for different object levels</li>
			<li>Real-time data binding and updates</li>
			<li>Support for complex nested object structures</li>
		</ul>

		<h3>Basic Example</h3>
		<p>
			Here's an example of the NestedEditor handling a complex configuration object with multiple nested levels:
		</p>

		<StoryViewer {...storyBuilder.getExample('introduction')} />
	</section>

	<!-- Schema Structure -->
	<section>
		<h2>Schema Structure</h2>
		<p>
			The NestedEditor uses a comprehensive schema that defines both the data structure and how each level should be displayed and edited.
		</p>

		<Code {...storyBuilder.getFragment(0)} />

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Schema Properties</h4>
				<ul>
					<li><strong>key</strong>: Unique identifier for the object</li>
					<li><strong>type</strong>: Data type (object, string, number, etc.)</li>
					<li><strong>scope</strong>: JSON path reference</li>
					<li><strong>properties</strong>: Object field definitions</li>
				</ul>
			</div>

			<div data-card>
				<h4>Layout Configuration</h4>
				<ul>
					<li><strong>layout</strong>: Visual arrangement of fields</li>
					<li><strong>children</strong>: Nested object definitions</li>
					<li><strong>_open</strong>: Initially expanded state</li>
					<li><strong>elements</strong>: Field positioning and grouping</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Data Navigation -->
	<section>
		<h2>Data Navigation</h2>
		<p>
			The editor provides an intuitive tree structure that allows users to navigate through complex nested data. Each level can be expanded or collapsed, and the editing interface adapts based on the schema definition for that level.
		</p>

		<h3>Navigation Features:</h3>
		<ul>
			<li><strong>Tree View</strong>: Hierarchical visualization of data structure</li>
			<li><strong>Expandable Nodes</strong>: Click to expand/collapse object levels</li>
			<li><strong>Context Switching</strong>: Edit different objects by selecting tree nodes</li>
			<li><strong>Breadcrumb Navigation</strong>: Clear indication of current editing context</li>
		</ul>
	</section>

	<!-- Use Cases -->
	<section>
		<h2>Use Cases</h2>
		<p>
			The NestedEditor is particularly useful for scenarios involving complex configuration or hierarchical data:
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Configuration Management</h4>
				<ul>
					<li>Application settings with nested sections</li>
					<li>Server configurations with multiple services</li>
					<li>Multi-tenant system configurations</li>
				</ul>
			</div>

			<div data-card>
				<h4>Data Modeling</h4>
				<ul>
					<li>Product catalogs with categories and variants</li>
					<li>Organization hierarchies with departments</li>
					<li>Content management with nested structures</li>
				</ul>
			</div>
		</div>

		<div data-card>
			<h4>Example: Multi-Tenant Configuration</h4>
			<p>
				The example shown above demonstrates editing a multi-tenant application configuration with separate sections for:
			</p>
			<ul>
				<li><strong>Tenant Information</strong>: Basic tenant details and industry</li>
				<li><strong>Services</strong>: Identity and storage service configurations</li>
				<li><strong>Modules</strong>: Business logic configurations for different modules</li>
				<li><strong>Instance Settings</strong>: Environment and localization settings</li>
			</ul>
		</div>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready for more?</h3>
		<p>
			Now that you understand how the Editor template works, explore the Form template for simpler data structures or learn about input components.
		</p>
		<span>
			<a href="/templates/form" class="button is-primary">
				Form Template
				<span class="ml-2">→</span>
			</a>
			<a href="/input/inputfield" class="button is-primary">
				Input Field
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>