<script>
	import { Code } from '$lib/components/Story'
	import fieldMapper from './snippets/00-field-mapper.js?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		<code>@rokkit/core</code> provides shared utilities, constants, and field mapping helpers used across
		all Rokkit packages. Most applications never import it directly — components consume it internally.
		Import directly when building custom components that integrate with Rokkit's field-mapping system.
	</p>

	<h2>Field mapping</h2>
	<p>
		<code>FieldMapper</code> is the core abstraction for resolving data fields by semantic name.
		Components instantiate one with a <code>fields</code> override and use it to read
		<code>label</code>, <code>value</code>, <code>icon</code>, <code>children</code>, etc., from
		arbitrary object shapes:
	</p>
	<Code content={fieldMapper} language="javascript" />
	<p>Key <code>FieldMapper</code> methods:</p>
	<table>
		<thead>
			<tr><th>Method</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr><td><code>get(fieldName, item)</code></td><td>Read a mapped field from an item</td></tr>
			<tr
				><td><code>getValue(item)</code></td><td>Read the value field (falls back to raw item)</td
				></tr
			>
			<tr
				><td><code>getIcon(item)</code></td><td
					>Read icon field, handles state-based icon objects</td
				></tr
			>
			<tr
				><td><code>hasChildren(item)</code></td><td
					>True when item has a non-empty children array</td
				></tr
			>
			<tr><td><code>isNested(items)</code></td><td>True when any item in array has children</td></tr
			>
			<tr><td><code>getChildren(item)</code></td><td>Return children array or []</td></tr>
		</tbody>
	</table>

	<h2>Field mapping constants</h2>
	<p>
		<code>BASE_FIELDS</code> is the canonical semantic-to-raw-key mapping used by
		<code>ProxyItem</code> and all Rokkit components:
	</p>
	<pre><code
			>import {'{'} BASE_FIELDS } from '@rokkit/core'
// id, value, label, icon, avatar, subtext, tooltip, badge,
// children, type, snippet, href, disabled, expanded, selected</code
		></pre>
	<p>
		<code>normalizeFields(fields)</code> converts legacy field-override keys (e.g.,
		<code>text</code>) to their <code>BASE_FIELDS</code> equivalents (e.g., <code>label</code>)
		before passing to a component.
	</p>

	<h2>Theme utilities</h2>
	<p>
		<code>themeRules(palette)</code> generates UnoCSS color rules from a palette object. Used
		internally by <code>presetRokkit</code> from <code>@rokkit/unocss</code>. Import directly for
		custom UnoCSS presets that need Rokkit's z-scale token system.
	</p>

	<h2>String utilities</h2>
	<p>Utility functions for common string operations:</p>
	<table>
		<thead>
			<tr><th>Function</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>slugify(text)</code></td><td
					>Convert text to URL-safe slug (lowercase, hyphens)</td
				></tr
			>
			<tr
				><td><code>truncate(text, length)</code></td><td>Truncate with ellipsis at word boundary</td
				></tr
			>
			<tr><td><code>capitalize(text)</code></td><td>Capitalize first letter</td></tr>
		</tbody>
	</table>

	<h2>When to use @rokkit/core directly</h2>
	<p>Use <code>@rokkit/core</code> when:</p>
	<ul>
		<li>
			Building custom components that need to interpret the same <code>fields</code> prop as Rokkit components
		</li>
		<li>Creating a custom UnoCSS preset that needs Rokkit's z-scale color token system</li>
		<li>
			Normalizing legacy <code>text/label</code> field keys before passing to a component
		</li>
	</ul>
	<p>
		For most feature work, rely on components and <code>@rokkit/states</code> to handle field mapping
		internally.
	</p>

	<h2>Related</h2>
	<ul>
		<li>
			<a href="/docs/utilities/states">@rokkit/states</a> — <code>ProxyItem</code> uses
			<code>FieldMapper</code> internally
		</li>
		<li>
			<a href="/docs/data-binding/field-mapping">Field Mapping</a> — How the fields prop works in components
		</li>
	</ul>
</article>
