<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
	import Preview from './Preview.svelte'
</script>

<article data-article-root>
	<p>
		The Tabs component is a highly extensible and versatile UI element that simplifies navigation
		within your application. Like other Rokkit components, Tabs follows the data-first design
		principle, allowing you to work with any data structure while maintaining full control over
		styling and behavior.
	</p>
	<Preview />
	<p>
		With support for horizontal and vertical orientations, editable tabs, and custom content
		rendering, the Tabs component adapts to your specific needs while providing excellent
		accessibility and keyboard navigation support.
	</p>

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

	<table>
		<thead>
			<tr>
				<th>Property</th>
				<th>Type</th>
				<th>Default</th>
				<th>Description</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td><code>items</code></td>
				<td>any[]</td>
				<td>[]</td>
				<td>Array of tab items (strings or objects)</td>
			</tr>
			<tr>
				<td><code>value</code></td>
				<td>any</td>
				<td>null</td>
				<td>Selected tab value (bindable)</td>
			</tr>
			<tr>
				<td><code>fields</code></td>
				<td>FieldMapping</td>
				<td></td>
				<td>Field mappings for data extraction</td>
			</tr>
			<tr>
				<td><code>orientation</code></td>
				<td>'horizontal' | 'vertical'</td>
				<td>'horizontal'</td>
				<td>Layout direction of the tab bar</td>
			</tr>
			<tr>
				<td><code>position</code></td>
				<td>'before' | 'after'</td>
				<td>'before'</td>
				<td>Position of tab bar relative to content</td>
			</tr>
			<tr>
				<td><code>align</code></td>
				<td>'start' | 'center' | 'end'</td>
				<td>'start'</td>
				<td>Alignment of tabs within the tab bar</td>
			</tr>
			<tr>
				<td><code>editable</code></td>
				<td>boolean</td>
				<td>false</td>
				<td>Enable add/remove tab functionality</td>
			</tr>
			<tr>
				<td><code>placeholder</code></td>
				<td>string</td>
				<td>'Select a tab...'</td>
				<td>Text shown when no tab is selected</td>
			</tr>
			<tr>
				<td><code>tabindex</code></td>
				<td>number</td>
				<td>0</td>
				<td>Tab index for keyboard navigation</td>
			</tr>
			<tr>
				<td><code>name</code></td>
				<td>string</td>
				<td>'tabs'</td>
				<td>Name for accessibility (aria-label)</td>
			</tr>
			<tr>
				<td><code>class</code></td>
				<td>string</td>
				<td>''</td>
				<td>Additional CSS class names</td>
			</tr>
		</tbody>
	</table>

	<!-- Events Documentation -->
	<h2>Events</h2>
	<p>Available event handlers for user interactions:</p>

	<table>
		<thead>
			<tr>
				<th>Event</th>
				<th>Parameters</th>
				<th>Description</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td><code>onselect</code></td>
				<td>(data: &#123;value, selected&#125;)</td>
				<td>Fired when a tab is selected</td>
			</tr>
			<tr>
				<td><code>onchange</code></td>
				<td>(data: &#123;value, selected&#125;)</td>
				<td>Fired when the selected tab changes</td>
			</tr>
			<tr>
				<td><code>onmove</code></td>
				<td>(data: &#123;value, selected&#125;)</td>
				<td>Fired when focus moves between tabs</td>
			</tr>
			<tr>
				<td><code>onadd</code></td>
				<td>()</td>
				<td>Fired when add button is clicked (editable mode)</td>
			</tr>
			<tr>
				<td><code>onremove</code></td>
				<td>(item: any)</td>
				<td>Fired when a tab is removed (editable mode)</td>
			</tr>
		</tbody>
	</table>

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
</article>
