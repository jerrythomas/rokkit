<script>
	import { Code } from '$lib/components/Story'
	import valueBinding from './snippets/00-value-binding.svelte?raw'
	import changeEvents from './snippets/01-change-events.svelte?raw'
	import multiSelection from './snippets/02-multi-selection.svelte?raw'
	import tabsToggle from './snippets/03-tabs-toggle.svelte?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Rokkit components use Svelte 5's <code>$state</code> and <code>$bindable</code> runes for clean, predictable
		state management. Every component follows the same binding pattern.
	</p>

	<h2>Value Binding</h2>
	<p>
		All selection components expose a <code>value</code> prop that can be bound. The value
		corresponds to the <code>value</code> field from your data (or the item itself for primitives):
	</p>
	<Code content={valueBinding} language="svelte" />

	<h2>Change Events</h2>
	<p>
		Use <code>onchange</code> or <code>onselect</code> for side effects when selection changes. The callback
		receives the new value:
	</p>
	<Code content={changeEvents} language="svelte" />

	<h2>Controlled vs Uncontrolled</h2>
	<p>Components work in both modes:</p>
	<ul>
		<li>
			<strong>Uncontrolled</strong> — Omit <code>bind:value</code>. The component manages its own
			state internally. Use <code>onchange</code> to react to changes.
		</li>
		<li>
			<strong>Controlled</strong> — Use <code>bind:value</code> to sync state with your application. The
			component and your state stay in sync automatically.
		</li>
	</ul>

	<h2>Multi-Selection</h2>
	<p>
		<code>MultiSelect</code> binds an array of values:
	</p>
	<Code content={multiSelection} language="svelte" />

	<h2>Tabs and Toggle</h2>
	<p>
		<code>Tabs</code> and <code>Toggle</code> also use <code>bind:value</code> with the same pattern:
	</p>
	<Code content={tabsToggle} language="svelte" />

	<h2>Related</h2>
	<ul>
		<li>
			<a href="/field-mapping">Field Mapping</a> — How <code>value</code> is resolved from data
		</li>
		<li><a href="/forms">Forms</a> — Schema-driven form state</li>
	</ul>
</article>
