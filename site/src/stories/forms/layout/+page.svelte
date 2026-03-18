<article data-article-root>
	<h1>Layout</h1>
	<p>
		The layout object controls how form fields are ordered, labelled, and grouped. It is separate
		from the schema — schema describes data types and constraints, layout describes presentation.
		When no layout is provided, one is derived automatically from the data keys.
	</p>

	<h1>Layout Object Shape</h1>
	<pre><code>const layout = &#123;
  type: 'vertical',   // top-level layout type
  elements: [         // ordered array of field elements
    &#123; scope: '#/name',  label: 'Full Name' &#125;,
    &#123; scope: '#/email', label: 'Email' &#125;
  ]
&#125;</code></pre>

	<h1>Layout Types</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>vertical</h1>
			<p>
				Fields stack top-to-bottom. The default layout type. Good for most general-purpose forms.
			</p>
			<pre><code>&#123; type: 'vertical', elements: [...] &#125;</code></pre>
		</div>

		<div data-card>
			<h1>horizontal</h1>
			<p>
				Label and input sit side-by-side on the same row. Common in settings panels and
				data-entry forms where vertical space is limited.
			</p>
			<pre><code>&#123; type: 'horizontal', elements: [...] &#125;</code></pre>
		</div>
	</div>

	<h1>Element scope</h1>
	<p>
		Each element uses <code>scope</code> to point to a field in the data object. The format is a
		JSON Pointer: <code>#/</code> followed by the property path. For nested objects use
		<code>#/address/city</code>.
	</p>

	<pre><code>elements: [
  &#123; scope: '#/name' &#125;,              // data.name
  &#123; scope: '#/address/city' &#125;,      // data.address.city
  &#123; scope: '#/settings/theme' &#125;     // data.settings.theme
]</code></pre>

	<h1>Element Properties</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Display</h1>
			<ul>
				<li><strong>label</strong> — displayed label text</li>
				<li><strong>description</strong> — help text shown below the field</li>
				<li><strong>placeholder</strong> — placeholder text for the input</li>
			</ul>
		</div>

		<div data-card>
			<h1>Behaviour</h1>
			<ul>
				<li><strong>renderer</strong> — force a specific input type (e.g. <code>'radio'</code>, <code>'switch'</code>)</li>
				<li><strong>override</strong> — when <code>true</code>, renders via the <code>child</code> snippet</li>
				<li><strong>showWhen</strong> — conditional visibility rule</li>
				<li><strong>elements</strong> — nested elements for group fields</li>
			</ul>
		</div>
	</div>

	<h1>Labels</h1>
	<p>
		Add a <code>label</code> to any element. Labels apply to both simple fields and group
		headings. A <code>description</code> adds help text beneath the field.
	</p>

	<pre><code>elements: [
  &#123;
    scope: '#/email',
    label: 'Email Address',
    description: 'We will never share your email with third parties.'
  &#125;,
  &#123;
    scope: '#/birthDate',
    label: 'Date of Birth',
    placeholder: 'YYYY-MM-DD'
  &#125;
]</code></pre>

	<h1>Separators</h1>
	<p>
		An element without a <code>scope</code> renders as a visual separator. Use
		<code>type: 'separator'</code> explicitly, or simply omit the scope. You can also add a
		<code>label</code> to create a section heading separator.
	</p>

	<pre><code>elements: [
  &#123; scope: '#/name',  label: 'Name' &#125;,
  &#123; type: 'separator' &#125;,             // horizontal rule
  &#123; label: 'Contact Details' &#125;,      // labelled separator (no scope)
  &#123; scope: '#/email', label: 'Email' &#125;,
  &#123; scope: '#/phone', label: 'Phone' &#125;
]</code></pre>

	<h1>Groups (Nested Objects)</h1>
	<p>
		Nest elements inside a group element to reflect a nested object in the data. The group renders
		as a <code>&lt;fieldset&gt;</code> with an optional <code>&lt;legend&gt;</code>. Use the
		parent's <code>scope</code> to point to the object and add child elements for each property.
	</p>

	<pre><code>const data = &#123;
  name: 'Alice',
  address: &#123; street: '123 Main St', city: 'Springfield' &#125;
&#125;

const layout = &#123;
  type: 'vertical',
  elements: [
    &#123; scope: '#/name', label: 'Name' &#125;,
    &#123;
      scope: '#/address',
      label: 'Address',          // becomes the &lt;legend&gt;
      elements: [
        &#123; scope: '#/address/street', label: 'Street' &#125;,
        &#123; scope: '#/address/city',   label: 'City' &#125;
      ]
    &#125;
  ]
&#125;</code></pre>

	<h1>Columns</h1>
	<p>
		Place multiple fields side by side by wrapping them in a group element that has no data binding
		of its own (omit scope on the group) and add <code>columns</code> children. Alternatively, use
		CSS classes on a wrapping element via the <code>renderer</code> override approach, or rely on
		theme grid utilities applied to the form root.
	</p>
	<p>
		For multi-column layouts within a section, group related fields into a nested object so the
		group element can carry a scope, then style the <code>&lt;fieldset&gt;</code> with a
		CSS grid.
	</p>

	<pre><code>// Two-column address group
&#123;
  scope: '#/address',
  label: 'Address',
  elements: [
    &#123; scope: '#/address/street',  label: 'Street' &#125;,
    &#123; scope: '#/address/suburb',  label: 'Suburb' &#125;,
    &#123; scope: '#/address/city',    label: 'City' &#125;,
    &#123; scope: '#/address/postCode', label: 'Post Code' &#125;
  ]
&#125;</code></pre>

	<h1>Explicit Renderer Override</h1>
	<p>
		The <code>renderer</code> property forces a specific input component regardless of the schema
		type. This lets you swap the auto-resolved component without changing the schema.
	</p>

	<pre><code>elements: [
  // Boolean field — swap checkbox for a toggle switch
  &#123; scope: '#/notifications', label: 'Enable Notifications', renderer: 'switch' &#125;,

  // String field with enum — swap select for radio buttons
  &#123; scope: '#/plan', label: 'Plan', renderer: 'radio' &#125;,

  // Custom renderer registered via FormRenderer's renderers prop
  &#123; scope: '#/rating', label: 'Rating', renderer: 'star-rating' &#125;
]</code></pre>

	<h1>Complete Example</h1>
	<pre><code>const layout = &#123;
  type: 'vertical',
  elements: [
    &#123; scope: '#/firstName', label: 'First Name', placeholder: 'Jane' &#125;,
    &#123; scope: '#/lastName',  label: 'Last Name',  placeholder: 'Smith' &#125;,
    &#123; type: 'separator' &#125;,
    &#123; label: 'Contact' &#125;,
    &#123;
      scope: '#/email',
      label: 'Email',
      description: 'Used for account notifications'
    &#125;,
    &#123;
      scope: '#/phone',
      label: 'Phone',
      renderer: 'tel'
    &#125;,
    &#123; type: 'separator' &#125;,
    &#123;
      scope: '#/address',
      label: 'Mailing Address',
      elements: [
        &#123; scope: '#/address/street', label: 'Street' &#125;,
        &#123; scope: '#/address/city',   label: 'City' &#125;,
        &#123; scope: '#/address/state',  label: 'State' &#125;
      ]
    &#125;
  ]
&#125;</code></pre>

	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Learn how JSON Schema controls field types and constraints, or see how to add conditional
			visibility and lookups in the Advanced guide.
		</p>
		<span>
			<a href="/forms/schema" class="button is-primary">
				Schema
				<span class="ml-2">→</span>
			</a>
			<a href="/forms/advanced" class="button is-primary">
				Advanced Features
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
