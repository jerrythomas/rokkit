<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		A compact dropdown that displays the currently selected value in its trigger button. Unlike Menu
		(which uses a static label), the trigger updates to reflect the active selection — ideal for
		theme pickers, status selectors, and inline configuration controls.
	</p>

	<!-- Basic Example -->
	<h2>Basic Example</h2>
	<p>
		Pass an array of objects with <code>label</code> and <code>value</code> fields. Bind
		<code>value</code> to track the selection. The trigger label updates automatically when a new
		option is chosen. Set <code>disabled: true</code> on any item to make it unselectable.
	</p>

	<Code {...storyBuilder.getFragment(0)} />
	<StoryViewer {...storyBuilder.getExample('properties')} />

	<!-- Field Mapping -->
	<h2>Field Mapping</h2>
	<p>
		Your data rarely uses <code>text</code> and <code>value</code> as keys. Use the
		<code>fields</code> prop to remap without transforming your data.
	</p>

	<Code {...storyBuilder.getFragment(1)} />
	<StoryViewer {...storyBuilder.getExample('fields')} />

	<!-- Sizes -->
	<h2>Sizes</h2>
	<p>
		Three size variants — <code>sm</code>, <code>md</code> (default), and <code>lg</code> — let you match
		the dropdown to its surrounding context.
	</p>

	<StoryViewer {...storyBuilder.getExample('sizes')} />

	<!-- Props Reference -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h2>Props</h2>
			<ul>
				<li><strong>items</strong>: Array of option objects</li>
				<li><strong>fields</strong>: Remap your data keys to component fields</li>
				<li><strong>value</strong> (bindable): Currently selected value</li>
				<li><strong>placeholder</strong>: Text shown when nothing is selected</li>
				<li><strong>icon</strong>: Optional icon class shown in the trigger</li>
				<li>
					<strong>size</strong>: Size variant (<code>sm</code>, <code>md</code>, <code>lg</code>)
				</li>
				<li><strong>align</strong>: Panel alignment (<code>start</code>, <code>end</code>)</li>
				<li><strong>direction</strong>: Panel direction (<code>down</code>, <code>up</code>)</li>
				<li><strong>showArrow</strong>: Show/hide the chevron arrow</li>
				<li><strong>disabled</strong>: Disable the entire dropdown</li>
				<li><strong>class</strong>: Additional CSS classes on the root element</li>
			</ul>
		</div>

		<div data-card>
			<h2>Data Attributes</h2>
			<ul>
				<li><code>data-dropdown</code>: Root container</li>
				<li><code>data-dropdown-trigger</code>: Trigger button</li>
				<li><code>data-dropdown-label</code>: Selected value text in trigger</li>
				<li><code>data-dropdown-icon</code>: Optional icon in trigger</li>
				<li><code>data-dropdown-arrow</code>: Chevron icon</li>
				<li><code>data-dropdown-panel</code>: Options panel</li>
				<li><code>data-dropdown-option</code>: Each option item</li>
				<li><code>data-active</code>: Present on the currently selected option</li>
				<li><code>data-open</code>: Present on root when panel is open</li>
			</ul>
		</div>
	</div>

	<div data-card>
		<h2>Events</h2>
		<ul>
			<li>
				<strong>onchange(value, item)</strong>: Fired when selection changes — receives the
				extracted value and the raw item object
			</li>
		</ul>
	</div>

	<div data-card>
		<h2>Keyboard Navigation</h2>
		<ul>
			<li><strong>Enter / Space</strong>: Open dropdown or select focused option</li>
			<li><strong>↑ / ↓</strong>: Move between options</li>
			<li><strong>Escape</strong>: Close panel and return focus to trigger</li>
			<li><strong>Tab</strong>: Close and move focus out</li>
		</ul>
	</div>
</article>
