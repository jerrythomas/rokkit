<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Introduction</h1>
	<p>
		The Connector component is a versatile utility that helps display connecting lines in nested
		tree views. It provides visual cues that help users understand the hierarchical relationships
		between items in tree structures.
	</p>

	<h1>Notable features:</h1>
	<ul>
		<li>Four connector types for different tree positions</li>
		<li>Right-to-left (RTL) layout support</li>
		<li>Clean, minimal visual design</li>
		<li>Integration with Tree and NestedList components</li>
		<li>Customizable styling with CSS</li>
		<li>Accessible visual hierarchy indication</li>
	</ul>

	<h1>Connector Types Demo</h1>
	<p>Here's a demonstration of all four connector types and their RTL variants:</p>

	<StoryViewer {...storyBuilder.getExample('demo')} />
	<h1>Connector Types</h1>
	<p>
		The Connector component has four types of connectors, which can be used according to the
		specific requirements of your tree view:
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Primary Types</h1>
			<ul>
				<li><strong>last</strong>: Use for the last item in a branch</li>
				<li><strong>child</strong>: Use for an item that has at least one child</li>
			</ul>
		</div>

		<div data-card>
			<h1>Secondary Types</h1>
			<ul>
				<li><strong>sibling</strong>: Use for an item that has a sibling below it</li>
				<li><strong>empty</strong>: Use for empty space in the tree view</li>
			</ul>
		</div>
	</div>

	<p>Basic connector usage:</p>
	<Code {...storyBuilder.getFragment(0)} />
	<h1>RTL Support</h1>
	<p>
		The Connector component also supports right-to-left (RTL) layouts, which can be enabled by
		setting the `rtl` prop to `true`. This is useful for applications that need to support RTL
		languages.
	</p>

	<Code {...storyBuilder.getFragment(1)} />

	<h1>RTL Use Cases</h1>
	<ul>
		<li>Arabic, Hebrew, and other RTL language interfaces</li>
		<li>Internationalized applications</li>
		<li>Custom layout requirements</li>
		<li>Mirrored tree structures</li>
	</ul>
	<h1>Integration with Tree Components</h1>
	<p>
		The Connector component is primarily used internally by Tree and NestedList components to create
		visual hierarchies. However, it can also be used standalone for custom tree implementations.
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Used By</h1>
			<ul>
				<li><strong>Tree</strong>: Hierarchical data display</li>
				<li><strong>NestedList</strong>: Nested navigation lists</li>
				<li><strong>Accordion</strong>: Nested accordion structures</li>
			</ul>
		</div>

		<div data-card>
			<h1>Custom Usage</h1>
			<ul>
				<li>File system browsers</li>
				<li>Organization charts</li>
				<li>Decision trees</li>
				<li>Category hierarchies</li>
			</ul>
		</div>
	</div>
	<h1>Styling and Customization</h1>
	<p>
		Connectors use minimal SVG-based graphics that can be styled with CSS. The default styling
		provides clean, professional-looking connection lines that integrate well with most design
		systems.
	</p>

	<h1>Customization Options</h1>
	<ul>
		<li><strong>Color</strong>: Adjust line colors to match your theme</li>
		<li><strong>Thickness</strong>: Modify line weight for different visual emphasis</li>
		<li><strong>Style</strong>: Change from solid to dashed or dotted lines</li>
		<li><strong>Size</strong>: Scale connectors for different tree densities</li>
	</ul>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand how Connector works, explore the Tree and NestedList components that
			use it, or learn about other utility components.
		</p>
		<span>
			<a href="/elements/tree" class="button is-primary">
				Tree
				<span class="ml-2">→</span>
			</a>
			<a href="/utilities/validation-report" class="button is-primary">
				ValidationReport
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
