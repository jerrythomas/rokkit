<article data-article-root>
	<h1>Forms Overview</h1>
	<p>
		The <code>@rokkit/forms</code> package is a schema-driven form system for Svelte 5. You define
		your data, optionally describe it with a JSON Schema, and control field order and grouping with a
		layout object. The system handles rendering, validation, dirty tracking, and conditional
		visibility — without you authoring field templates by hand.
	</p>

	<h1>Key Features</h1>
	<ul>
		<li>Schema-driven field generation — no per-field template authoring</li>
		<li>Auto-derivation of schema and layout from data shape</li>
		<li>Built-in validation with real-time or on-submit modes</li>
		<li>Conditional fields via <code>showWhen</code></li>
		<li>Lookup-based dependent selects (URL, async fetch, or client-side filter)</li>
		<li>Dirty tracking — know which fields changed from the initial snapshot</li>
		<li>Custom renderers and snippet overrides for one-off fields</li>
	</ul>

	<h1>Quick Start</h1>
	<p>
		Pass <code>data</code>, <code>schema</code>, and <code>layout</code> to
		<code>FormRenderer</code>. When <code>onsubmit</code> is provided the form renders as a
		<code>&lt;form&gt;</code> with Submit and Reset buttons.
	</p>

	<pre><code>&lt;script&gt;
  import &#123; FormRenderer &#125; from '@rokkit/forms'

  let data = $state(&#123; name: '', email: '' &#125;)

  const schema = &#123;
    type: 'object',
    properties: &#123;
      name:  &#123; type: 'string', required: true &#125;,
      email: &#123; type: 'string', format: 'email' &#125;
    &#125;
  &#125;

  const layout = &#123;
    type: 'vertical',
    elements: [
      &#123; scope: '#/name',  label: 'Full Name' &#125;,
      &#123; scope: '#/email', label: 'Email Address' &#125;
    ]
  &#125;

  async function handleSubmit(visibleData, &#123; isValid &#125;) &#123;
    if (!isValid) return
    await fetch('/api/save', &#123;
      method: 'POST',
      body: JSON.stringify(visibleData)
    &#125;)
  &#125;
&lt;/script&gt;

&lt;FormRenderer bind:data &#123;schema&#125; &#123;layout&#125; onsubmit=&#123;handleSubmit&#125; /&gt;</code></pre>

	<h1>The Three Inputs</h1>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<div data-card>
			<h1>data</h1>
			<p>
				A plain JavaScript object holding the form values. Bind it with
				<code>bind:data</code> to keep it in sync, or pass an external
				<code>FormBuilder</code> instance for programmatic control.
			</p>
		</div>

		<div data-card>
			<h1>schema</h1>
			<p>
				A JSON Schema-like object that describes field types and constraints
				(<code>required</code>, <code>minLength</code>, <code>pattern</code>, etc.).
				When omitted, the schema is automatically derived from the data shape.
			</p>
		</div>

		<div data-card>
			<h1>layout</h1>
			<p>
				Controls field order, labels, groups, separators, and conditional visibility.
				Each element has a <code>scope</code> pointing to a data path like
				<code>#/name</code>. When omitted, a flat vertical layout is derived from the data keys.
			</p>
		</div>
	</div>

	<h1>Auto-Derivation</h1>
	<p>
		When <code>schema</code> or <code>layout</code> are omitted, <code>FormBuilder</code> infers
		them from the data object. This lets you build a working form from just a data shape — useful
		for settings panels, quick editors, and prototypes.
	</p>

	<pre><code>import &#123; FormBuilder &#125; from '@rokkit/forms'

const builder = new FormBuilder(&#123; count: 25, animate: true &#125;)

// Auto-derived schema:
// &#123; type: 'object', properties: &#123;
//   count:   &#123; type: 'integer' &#125;,
//   animate: &#123; type: 'boolean' &#125;
// &#125; &#125;

// Auto-derived layout:
// &#123; type: 'vertical', elements: [
//   &#123; label: 'count',   scope: '#/count'   &#125;,
//   &#123; label: 'animate', scope: '#/animate' &#125;
// ] &#125;</code></pre>

	<h1>FormBuilder vs FormRenderer</h1>
	<p>
		<code>FormRenderer</code> is a Svelte component — pass props and get a rendered form.
		<code>FormBuilder</code> is the underlying class that manages state. Use
		<code>FormBuilder</code> directly when you need programmatic access to validation, dirty
		tracking, or lookups outside of a component.
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>FormRenderer (component)</h1>
			<ul>
				<li>Renders the form as HTML</li>
				<li>Accepts <code>data</code>, <code>schema</code>, <code>layout</code>, <code>lookups</code></li>
				<li>Provides <code>validateOn</code> (blur / change / manual)</li>
				<li>Accepts <code>onsubmit</code>, <code>onupdate</code>, <code>onvalidate</code></li>
				<li>Supports snippet overrides: <code>actions</code>, <code>child</code></li>
				<li>Accepts custom <code>renderers</code> map for custom input types</li>
			</ul>
		</div>

		<div data-card>
			<h1>FormBuilder (class)</h1>
			<ul>
				<li>Programmatic form state management</li>
				<li>Properties: <code>data</code>, <code>schema</code>, <code>layout</code>, <code>errors</code>, <code>isValid</code>, <code>isDirty</code></li>
				<li>Methods: <code>updateField()</code>, <code>validate()</code>, <code>reset()</code>, <code>snapshot()</code></li>
				<li>Lookup helpers: <code>isFieldDisabled()</code>, <code>refreshLookup()</code></li>
				<li>Visibility: <code>getVisibleData()</code></li>
			</ul>
		</div>
	</div>

	<h1>Key Exports</h1>
	<pre><code>// Core
import &#123; FormBuilder, FormRenderer &#125; from '@rokkit/forms'

// Validation helpers
import &#123; validateField, validateAll, createMessage, patterns &#125; from '@rokkit/forms'

// Lookup helpers
import &#123; createLookup, clearLookupCache &#125; from '@rokkit/forms'

// Schema / layout utilities
import &#123; deriveSchemaFromValue, deriveLayoutFromValue &#125; from '@rokkit/forms'

// Individual input components (use standalone if needed)
import &#123; Input, InputField, InfoField, StatusList &#125; from '@rokkit/forms'</code></pre>

	<h1>Install</h1>
	<pre><code>npm install @rokkit/forms</code></pre>

	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Learn how to control field ordering and grouping with Layout, or how JSON Schema drives field
			types and constraints in the Schema guide.
		</p>
		<span>
			<a href="/forms/layout" class="button is-primary">
				Layout
				<span class="ml-2">→</span>
			</a>
			<a href="/forms/schema" class="button is-primary">
				Schema
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
