<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Overview</h1>
	<p>
		The Tabs component is a highly extensible and versatile UI element that simplifies navigation
		within your application. Like other Rokkit components, Tabs follows the data-first design
		principle, allowing you to work with any data structure while maintaining full control over
		styling and behavior.
	</p>

	<p>
		With support for horizontal and vertical orientations, editable tabs, and custom content
		rendering, the Tabs component adapts to your specific needs while providing excellent
		accessibility and keyboard navigation support.
	</p>

	<div data-content-block>
		<div class="flex items-start space-x-3">
			<div class="text-2xl">✨</div>
			<div>
				<h3>Key Features</h3>
				<ul class="space-y-1 text-sm">
					<li>Start with simple string arrays or complex objects</li>
					<li>Flexible field mapping for any data structure</li>
					<li>Horizontal and vertical orientations</li>
					<li>Editable tabs with add/remove functionality</li>
					<li>Custom snippets for tab headers and content</li>
					<li>Full keyboard navigation support</li>
					<li>Extensive styling with data attributes</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Getting Started -->

	<h2>Getting Started</h2>
	<p>
		Get started with basic tabs using a simple string array. Notice how the description is stored as
		an attribute in the data, eliminating the need for conditional logic:
	</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<!-- Object Data with Custom Snippets -->

	<h2>Object Data with Custom Snippets</h2>
	<p>
		Use complex objects with custom snippets to create rich, interactive tab interfaces. The `child`
		snippet customizes tab headers while the content between the tags renders as the tab content:
	</p>

	<StoryViewer {...storyBuilder.getExample('advanced')} />

	<!-- Interactive Configuration -->
	<h2>Interactive Configuration</h2>
	<p>
		Explore the three key layout properties: <code>orientation</code>, <code>position</code>, and
		<code>align</code>. Try different combinations to see how they affect the tab layout:
	</p>

	<StoryViewer {...storyBuilder.getExample('configuration')} />

	<!-- Editable Tabs -->
	<h2>Editable Tabs</h2>
	<p>
		Enable dynamic tab management with the <code>editable</code> property and event handlers. This example
		starts with empty tabs and demonstrates add/remove functionality:
	</p>

	<StoryViewer {...storyBuilder.getExample('editable')} />

	<!-- Properties Documentation -->
	<h2>Properties</h2>
	<p>Complete reference of all available properties:</p>

	<div class="overflow-x-auto">
		<table class="border-neutral-z2 w-full border-collapse border">
			<thead class="bg-neutral-z2">
				<tr>
					<th class="border-neutral-z2 border p-3 text-left">Property</th>
					<th class="border-neutral-z2 border p-3 text-left">Type</th>
					<th class="border-neutral-z2 border p-3 text-left">Default</th>
					<th class="border-neutral-z2 border p-3 text-left">Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="border-neutral-z2 border p-3 font-mono text-sm">items</td>
					<td class="border-neutral-z2 border p-3 text-sm">any[]</td>
					<td class="border-neutral-z2 border p-3 text-sm">[]</td>
					<td class="border-neutral-z2 border p-3 text-sm"
						>Array of tab items (strings or objects)</td
					>
				</tr>
				<tr class="bg-neutral-z2/50">
					<td class="border-neutral-z2 border p-3 font-mono text-sm">value</td>
					<td class="border-neutral-z2 border p-3 text-sm">any</td>
					<td class="border-neutral-z2 border p-3 text-sm">null</td>
					<td class="border-neutral-z2 border p-3 text-sm">Selected tab value (bindable)</td>
				</tr>
				<tr>
					<td class="border-neutral-z2 border p-3 font-mono text-sm">fields</td>
					<td class="border-neutral-z2 border p-3 text-sm">FieldMapping</td>
					<td class="border-neutral-z2 border p-3 text-sm"></td>
					<td class="border-neutral-z2 border p-3 text-sm">Field mappings for data extraction</td>
				</tr>
				<tr class="bg-neutral-z2/50">
					<td class="border-neutral-z2 border p-3 font-mono text-sm">orientation</td>
					<td class="border-neutral-z2 border p-3 text-sm">'horizontal' | 'vertical'</td>
					<td class="border-neutral-z2 border p-3 text-sm">'horizontal'</td>
					<td class="border-neutral-z2 border p-3 text-sm">Layout direction of the tab bar</td>
				</tr>
				<tr>
					<td class="border-neutral-z2 border p-3 font-mono text-sm">position</td>
					<td class="border-neutral-z2 border p-3 text-sm">'before' | 'after'</td>
					<td class="border-neutral-z2 border p-3 text-sm">'before'</td>
					<td class="border-neutral-z2 border p-3 text-sm"
						>Position of tab bar relative to content</td
					>
				</tr>
				<tr class="bg-neutral-z2/50">
					<td class="border-neutral-z2 border p-3 font-mono text-sm">align</td>
					<td class="border-neutral-z2 border p-3 text-sm">'start' | 'center' | 'end'</td>
					<td class="border-neutral-z2 border p-3 text-sm">'start'</td>
					<td class="border-neutral-z2 border p-3 text-sm">Alignment of tabs within the tab bar</td>
				</tr>
				<tr>
					<td class="border-neutral-z2 border p-3 font-mono text-sm">editable</td>
					<td class="border-neutral-z2 border p-3 text-sm">boolean</td>
					<td class="border-neutral-z2 border p-3 text-sm">false</td>
					<td class="border-neutral-z2 border p-3 text-sm">Enable add/remove tab functionality</td>
				</tr>
				<tr class="bg-neutral-z2/50">
					<td class="border-neutral-z2 border p-3 font-mono text-sm">placeholder</td>
					<td class="border-neutral-z2 border p-3 text-sm">string</td>
					<td class="border-neutral-z2 border p-3 text-sm">'Select a tab...'</td>
					<td class="border-neutral-z2 border p-3 text-sm">Text shown when no tab is selected</td>
				</tr>
				<tr>
					<td class="border-neutral-z2 border p-3 font-mono text-sm">tabindex</td>
					<td class="border-neutral-z2 border p-3 text-sm">number</td>
					<td class="border-neutral-z2 border p-3 text-sm">0</td>
					<td class="border-neutral-z2 border p-3 text-sm">Tab index for keyboard navigation</td>
				</tr>
				<tr class="bg-neutral-z2/50">
					<td class="border-neutral-z2 border p-3 font-mono text-sm">name</td>
					<td class="border-neutral-z2 border p-3 text-sm">string</td>
					<td class="border-neutral-z2 border p-3 text-sm">'tabs'</td>
					<td class="border-neutral-z2 border p-3 text-sm">Name for accessibility (aria-label)</td>
				</tr>
				<tr>
					<td class="border-neutral-z2 border p-3 font-mono text-sm">class</td>
					<td class="border-neutral-z2 border p-3 text-sm">string</td>
					<td class="border-neutral-z2 border p-3 text-sm">''</td>
					<td class="border-neutral-z2 border p-3 text-sm">Additional CSS class names</td>
				</tr>
			</tbody>
		</table>
	</div>

	<!-- Events Documentation -->
	<h2>Events</h2>
	<p>Available event handlers for user interactions:</p>

	<div class="overflow-x-auto">
		<table class="border-neutral-z2 w-full border-collapse border">
			<thead class="bg-neutral-z2">
				<tr>
					<th class="border-neutral-z2 border p-3 text-left">Event</th>
					<th class="border-neutral-z2 border p-3 text-left">Parameters</th>
					<th class="border-neutral-z2 border p-3 text-left">Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="border-neutral-z2 border p-3 font-mono text-sm">onselect</td>
					<td class="border-neutral-z2 border p-3 text-sm">(data: &#123;value, selected&#125;)</td>
					<td class="border-neutral-z2 border p-3 text-sm">Fired when a tab is selected</td>
				</tr>
				<tr class="bg-neutral-z2/50">
					<td class="border-neutral-z2 border p-3 font-mono text-sm">onchange</td>
					<td class="border-neutral-z2 border p-3 text-sm">(data: &#123;value, selected&#125;)</td>
					<td class="border-neutral-z2 border p-3 text-sm">Fired when the selected tab changes</td>
				</tr>
				<tr>
					<td class="border-neutral-z2 border p-3 font-mono text-sm">onmove</td>
					<td class="border-neutral-z2 border p-3 text-sm">(data: &#123;value, selected&#125;)</td>
					<td class="border-neutral-z2 border p-3 text-sm">Fired when focus moves between tabs</td>
				</tr>
				<tr class="bg-neutral-z2/50">
					<td class="border-neutral-z2 border p-3 font-mono text-sm">onadd</td>
					<td class="border-neutral-z2 border p-3 text-sm">()</td>
					<td class="border-neutral-z2 border p-3 text-sm"
						>Fired when add button is clicked (editable mode)</td
					>
				</tr>
				<tr>
					<td class="border-neutral-z2 border p-3 font-mono text-sm">onremove</td>
					<td class="border-neutral-z2 border p-3 text-sm">(item: any)</td>
					<td class="border-neutral-z2 border p-3 text-sm"
						>Fired when a tab is removed (editable mode)</td
					>
				</tr>
			</tbody>
		</table>
	</div>

	<h2>Styling with Data Attributes</h2>
	<p>
		The Tabs component uses data attributes for styling hooks, allowing you to customize the
		appearance without modifying the component itself:
	</p>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div data-card>
			<h3>Container Attributes</h3>
			<ul class="space-y-2 font-mono text-sm">
				<li><code>data-tab-root</code> - Root container</li>
				<li><code>data-tab-orientation</code> - Orientation value</li>
				<li><code>data-tab-position</code> - Position value</li>
				<li><code>data-tab-align</code> - Alignment value</li>
			</ul>
		</div>

		<div data-card>
			<h3>Element Attributes</h3>
			<ul class="space-y-2 font-mono text-sm">
				<li><code>data-tab-list</code> - Tab bar container</li>
				<li><code>data-tab-item</code> - Individual tab button</li>
				<li><code>data-tab-content</code> - Content container</li>
				<li><code>data-tab-add</code> - Add button (editable)</li>
				<li><code>data-tab-remove</code> - Remove button (editable)</li>
			</ul>
		</div>
	</div>

	<h4>Example Styling</h4>
	<Code {...storyBuilder.getFragment(0)} />

	<!-- Best Practices -->
	<h2>Best Practices</h2>
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div data-card>
			<h3>UX Guidelines</h3>
			<ul class="space-y-2 text-sm">
				<li>Keep tab labels concise and descriptive</li>
				<li>Use 5-7 tabs maximum for optimal usability</li>
				<li>Provide clear visual feedback for active states</li>
				<li>Consider vertical layout for navigation-heavy interfaces</li>
				<li>Use consistent tab ordering across your application</li>
			</ul>
		</div>

		<div data-card>
			<h3>Technical Tips</h3>
			<ul class="space-y-2 text-sm">
				<li>Use field mapping to adapt to your data structure</li>
				<li>Implement proper error handling for dynamic content</li>
				<li>Test keyboard navigation thoroughly</li>
				<li>Consider lazy loading for heavy tab content</li>
				<li>Use semantic HTML for better accessibility</li>
			</ul>
		</div>
	</div>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Explore More Components</h2>
		<p>
			Now that you understand the Tabs component, explore other Rokkit components that follow
			similar patterns:
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<a href="/elements/list" class="button is-primary">
				Lists
				<span class="ml-2">→</span>
			</a>
			<a href="/elements/table" class="button is-primary">
				Tables
				<span class="ml-2">→</span>
			</a>
			<a href="/elements/accordion" class="button is-primary">
				Accordion
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</article>
