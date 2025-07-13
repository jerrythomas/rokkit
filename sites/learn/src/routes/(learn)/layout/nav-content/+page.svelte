<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>NavContent - Layout | Learn Rokkit</title>
	<meta
		name="description"
		content="Navigation and content layout patterns"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>🧭</span>NavContent Component</h1>
				<p>
					Navigation and content layout patterns
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			The NavContent component provides a flexible layout pattern for navigation and content areas. It creates a clean separation between navigation controls and the main content area, supporting both horizontal and vertical orientations.
		</p>

		<h3>Notable features:</h3>
		<ul>
			<li>Flexible navigation and content slot system</li>
			<li>Horizontal and vertical layout orientations</li>
			<li>Responsive design that adapts to screen sizes</li>
			<li>Clean separation of navigation and content concerns</li>
			<li>Integration with other Rokkit components like Tabs</li>
			<li>Customizable styling with CSS classes</li>
		</ul>

		<h3>Basic Example</h3>
		<p>
			Here's an example of a NavContent component with vertical layout using Tabs for navigation:
		</p>

		<StoryViewer {...storyBuilder.getExample('intro')} />
	</section>

	<!-- Properties -->
	<section>
		<h2>Properties</h2>
		<p>
			The NavContent component provides simple but effective properties for layout control.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Layout Properties</h4>
				<ul>
					<li><strong>vertical</strong>: Stack navigation and content vertically (default: false)</li>
					<li><strong>class</strong>: Custom CSS classes for styling</li>
				</ul>
			</div>

			<div data-card>
				<h4>Slot System</h4>
				<ul>
					<li><strong>nav slot</strong>: Navigation components (tabs, menus, etc.)</li>
					<li><strong>content slot</strong>: Main content area</li>
				</ul>
			</div>
		</div>

		<p>Basic usage pattern:</p>
		<Code {...storyBuilder.getFragment(0)} />
	</section>

	<!-- Layout Orientations -->
	<section>
		<h2>Layout Orientations</h2>
		<p>
			The NavContent component supports both horizontal and vertical layouts to accommodate different UI patterns.
		</p>

		<h3>Horizontal Layout (Default)</h3>
		<p>
			In horizontal mode, navigation appears alongside the content area. This works well for sidebar navigation or when screen space allows side-by-side layout.
		</p>

		<h3>Vertical Layout</h3>
		<p>
			In vertical mode, navigation stacks above the content area. This is ideal for mobile-friendly designs or when you need a traditional top navigation pattern.
		</p>

		<Code {...storyBuilder.getFragment(1)} />
	</section>

	<!-- Integration Patterns -->
	<section>
		<h2>Integration with Rokkit Components</h2>
		<p>
			NavContent works seamlessly with other Rokkit components to create rich navigation experiences.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Common Navigation Components</h4>
				<ul>
					<li><strong>Tabs</strong>: Tabbed navigation interface</li>
					<li><strong>List</strong>: Menu-style navigation lists</li>
					<li><strong>Switch</strong>: Toggle-based navigation</li>
					<li><strong>Select</strong>: Dropdown navigation menus</li>
				</ul>
			</div>

			<div data-card>
				<h4>Content Areas</h4>
				<ul>
					<li>Dynamic content based on navigation selection</li>
					<li>Form components and data displays</li>
					<li>Charts and visualizations</li>
					<li>Any Svelte component or HTML content</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Use Cases -->
	<section>
		<h2>Use Cases</h2>
		<p>
			The NavContent layout pattern is versatile and works well for many application scenarios.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Application Interfaces</h4>
				<ul>
					<li>Admin dashboards with sidebar navigation</li>
					<li>Settings pages with tabbed sections</li>
					<li>Multi-step forms with progress navigation</li>
					<li>Documentation sites with section navigation</li>
				</ul>
			</div>

			<div data-card>
				<h4>Content Management</h4>
				<ul>
					<li>Content editors with tool panels</li>
					<li>File browsers with folder navigation</li>
					<li>Product catalogs with category filtering</li>
					<li>Data exploration interfaces</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready for more?</h3>
		<p>
			Now that you understand how the NavContent layout works, explore other layout components like ResponsiveGrid and Stepper, or learn about navigation components like Tabs.
		</p>
		<span>
			<a href="/layout/responsive-grid" class="button is-primary">
				ResponsiveGrid
				<span class="ml-2">→</span>
			</a>
			<a href="/elements/tabs" class="button is-primary">
				Tabs
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>