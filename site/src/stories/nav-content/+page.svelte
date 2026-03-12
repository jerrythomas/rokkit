<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Introduction</h1>
	<p>
		The NavContent component provides a flexible layout pattern for navigation and content areas. It
		creates a clean separation between navigation controls and the main content area, supporting
		both horizontal and vertical orientations.
	</p>

	<h1>Notable features:</h1>
	<ul>
		<li>Flexible navigation and content slot system</li>
		<li>Horizontal and vertical layout orientations</li>
		<li>Responsive design that adapts to screen sizes</li>
		<li>Clean separation of navigation and content concerns</li>
		<li>Integration with other Rokkit components like Tabs</li>
		<li>Customizable styling with CSS classes</li>
	</ul>

	<h1>Basic Example</h1>
	<p>Here's an example of a NavContent component with vertical layout using Tabs for navigation:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />
	<h1>Properties</h1>
	<p>The NavContent component provides simple but effective properties for layout control.</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Layout Properties</h1>
			<ul>
				<li><strong>vertical</strong>: Stack navigation and content vertically (default: false)</li>
				<li><strong>class</strong>: Custom CSS classes for styling</li>
			</ul>
		</div>

		<div data-card>
			<h1>Slot System</h1>
			<ul>
				<li><strong>nav slot</strong>: Navigation components (tabs, menus, etc.)</li>
				<li><strong>content slot</strong>: Main content area</li>
			</ul>
		</div>
	</div>

	<p>Basic usage pattern:</p>
	<Code {...storyBuilder.getFragment(0)} />
	<h1>Layout Orientations</h1>
	<p>
		The NavContent component supports both horizontal and vertical layouts to accommodate different
		UI patterns.
	</p>

	<h1>Horizontal Layout (Default)</h1>
	<p>
		In horizontal mode, navigation appears alongside the content area. This works well for sidebar
		navigation or when screen space allows side-by-side layout.
	</p>

	<h1>Vertical Layout</h1>
	<p>
		In vertical mode, navigation stacks above the content area. This is ideal for mobile-friendly
		designs or when you need a traditional top navigation pattern.
	</p>

	<Code {...storyBuilder.getFragment(1)} />
	<h1>Integration with Rokkit Components</h1>
	<p>
		NavContent works seamlessly with other Rokkit components to create rich navigation experiences.
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Common Navigation Components</h1>
			<ul>
				<li><strong>Tabs</strong>: Tabbed navigation interface</li>
				<li><strong>List</strong>: Menu-style navigation lists</li>
				<li><strong>Switch</strong>: Toggle-based navigation</li>
				<li><strong>Select</strong>: Dropdown navigation menus</li>
			</ul>
		</div>

		<div data-card>
			<h1>Content Areas</h1>
			<ul>
				<li>Dynamic content based on navigation selection</li>
				<li>Form components and data displays</li>
				<li>Charts and visualizations</li>
				<li>Any Svelte component or HTML content</li>
			</ul>
		</div>
	</div>
	<h1>Use Cases</h1>
	<p>The NavContent layout pattern is versatile and works well for many application scenarios.</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Application Interfaces</h1>
			<ul>
				<li>Admin dashboards with sidebar navigation</li>
				<li>Settings pages with tabbed sections</li>
				<li>Multi-step forms with progress navigation</li>
				<li>Documentation sites with section navigation</li>
			</ul>
		</div>

		<div data-card>
			<h1>Content Management</h1>
			<ul>
				<li>Content editors with tool panels</li>
				<li>File browsers with folder navigation</li>
				<li>Product catalogs with category filtering</li>
				<li>Data exploration interfaces</li>
			</ul>
		</div>
	</div>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand how the NavContent layout works, explore other layout components like
			ResponsiveGrid and Stepper, or learn about navigation components like Tabs.
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
