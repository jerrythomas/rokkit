<article data-article-root>
	<h1>Schema</h1>
	<p>
		The schema object describes the types and validation constraints of your form fields. It follows
		a JSON Schema-like structure: a root <code>type: 'object'</code> with a
		<code>properties</code> map. Each property entry controls the input type that is rendered and
		the validation rules that are applied.
	</p>

	<h1>Basic Schema Shape</h1>
	<pre><code>const schema = &#123;
  type: 'object',
  properties: &#123;
    name:  &#123; type: 'string',  required: true, minLength: 2 &#125;,
    email: &#123; type: 'string',  format: 'email' &#125;,
    age:   &#123; type: 'integer', min: 18, max: 120 &#125;,
    score: &#123; type: 'number',  min: 0, max: 100 &#125;,
    active:&#123; type: 'boolean' &#125;,
    role:  &#123; type: 'string',  enum: ['admin', 'editor', 'viewer'] &#125;
  &#125;
&#125;</code></pre>

	<h1>Auto-Derivation</h1>
	<p>
		When you omit the schema, <code>FormBuilder</code> infers it from the data shape. The data
		value's JavaScript type maps to a schema type, and the schema type then resolves to a specific
		input component.
	</p>

	<pre><code>import &#123; FormBuilder &#125; from '@rokkit/forms'

// Schema is derived automatically — no need to write it
const builder = new FormBuilder(&#123;
  username: 'alice',    // → type: 'string'  → text input
  age: 30,              // → type: 'integer' → number input
  score: 9.5,           // → type: 'number'  → number input
  active: true,         // → type: 'boolean' → checkbox
  tags: []              // → type: 'array'   → array editor
&#125;)</code></pre>

	<h1>Field Types and Input Resolution</h1>
	<p>
		The schema <code>type</code> (and optional <code>format</code>) determines which input
		component is rendered.
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>String types</h1>
			<ul>
				<li><code>type: 'string'</code> → text input</li>
				<li><code>format: 'email'</code> → email input</li>
				<li><code>format: 'password'</code> → password input</li>
				<li><code>format: 'tel'</code> → telephone input</li>
				<li><code>format: 'url'</code> → URL input</li>
				<li><code>format: 'textarea'</code> → multiline textarea</li>
				<li><code>format: 'date'</code> → date picker</li>
				<li><code>format: 'datetime-local'</code> → date-time picker</li>
				<li><code>format: 'color'</code> → colour picker</li>
				<li><code>enum: [...]</code> → select dropdown</li>
			</ul>
		</div>

		<div data-card>
			<h1>Other types</h1>
			<ul>
				<li><code>type: 'number'</code> → number input</li>
				<li><code>type: 'number'</code> with min+max → range slider</li>
				<li><code>type: 'integer'</code> → number input</li>
				<li><code>type: 'integer'</code> with min+max → range slider</li>
				<li><code>type: 'boolean'</code> → checkbox</li>
				<li><code>type: 'array'</code> → array editor</li>
				<li><code>readonly: true</code> → read-only info display</li>
			</ul>
		</div>
	</div>

	<h1>Alternative Renderers</h1>
	<p>
		Some types have alternate renderers. Set <code>renderer</code> on the layout element to use
		them — the schema type still governs validation.
	</p>

	<pre><code>// Layout element
&#123; scope: '#/notifications', label: 'Notifications', renderer: 'switch' &#125;
&#123; scope: '#/plan',          label: 'Plan',          renderer: 'radio' &#125;
&#123; scope: '#/agreed',        label: 'I agree',       renderer: 'toggle' &#125;</code></pre>

	<h1>Validation Constraints</h1>
	<p>Add constraint properties to a field schema to enable validation.</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>String constraints</h1>
			<ul>
				<li><strong>required</strong> — must not be empty</li>
				<li><strong>minLength</strong> — minimum character count</li>
				<li><strong>maxLength</strong> — maximum character count</li>
				<li><strong>pattern</strong> — regex the value must match</li>
				<li><strong>enum</strong> — value must be one of the listed options</li>
			</ul>
		</div>

		<div data-card>
			<h1>Number constraints</h1>
			<ul>
				<li><strong>required</strong> — must not be empty</li>
				<li><strong>min</strong> / <strong>minimum</strong> — minimum numeric value</li>
				<li><strong>max</strong> / <strong>maximum</strong> — maximum numeric value</li>
			</ul>
		</div>

		<div data-card>
			<h1>Boolean constraints</h1>
			<ul>
				<li><strong>required</strong> — must be checked (truthy)</li>
				<li><strong>mustBeTrue</strong> — value must be <code>true</code> (use with <code>required</code> for acceptance checkboxes)</li>
			</ul>
		</div>

		<div data-card>
			<h1>Display modifiers</h1>
			<ul>
				<li><strong>readonly</strong> — renders as a read-only info display, skipped in validation</li>
			</ul>
		</div>
	</div>

	<h1>Constraint Examples</h1>
	<pre><code>const schema = &#123;
  type: 'object',
  properties: &#123;
    // Required string with length bounds
    username: &#123;
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 20
    &#125;,

    // Regex pattern — phone number
    phone: &#123;
      type: 'string',
      pattern: '^\\+?[\\d\\s\\-\\(\\)]&#123;10,&#125;$'
    &#125;,

    // Enum — renders as select, validates against allowed values
    role: &#123;
      type: 'string',
      required: true,
      enum: ['admin', 'editor', 'viewer']
    &#125;,

    // Integer range — renders as range slider
    priority: &#123;
      type: 'integer',
      min: 1,
      max: 5
    &#125;,

    // Required checkbox (must be checked)
    terms: &#123;
      type: 'boolean',
      required: true,
      mustBeTrue: true
    &#125;
  &#125;
&#125;</code></pre>

	<h1>Nested Objects</h1>
	<p>
		Nest a <code>type: 'object'</code> inside <code>properties</code> to represent a sub-object in
		the data. Pair it with a group element in the layout.
	</p>

	<pre><code>const schema = &#123;
  type: 'object',
  properties: &#123;
    name: &#123; type: 'string', required: true &#125;,
    address: &#123;
      type: 'object',
      properties: &#123;
        street: &#123; type: 'string', required: true &#125;,
        city:   &#123; type: 'string', required: true &#125;,
        state:  &#123; type: 'string', enum: ['NSW', 'VIC', 'QLD'] &#125;
      &#125;
    &#125;
  &#125;
&#125;</code></pre>

	<h1>Using the patterns Helper</h1>
	<p>
		The <code>patterns</code> export provides ready-made regex patterns for common formats. Use
		them in the <code>pattern</code> schema property.
	</p>

	<pre><code>import &#123; patterns &#125; from '@rokkit/forms'

// patterns.email      → /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]&#123;2,&#125;$/
// patterns.phone      → /^\+?[\d\s\-\(\)]&#123;10,&#125;$/
// patterns.url        → /^https?:\/\/[^\s/$.?#].[^\s]*$/
// patterns.zipCode    → /^\d&#123;5&#125;(-\d&#123;4&#125;)?$/
// patterns.creditCard → /^\d&#123;4&#125;\s?\d&#123;4&#125;\s?\d&#123;4&#125;\s?\d&#123;4&#125;$/

const schema = &#123;
  type: 'object',
  properties: &#123;
    email: &#123;
      type: 'string',
      required: true,
      pattern: patterns.email.source   // use .source to get the raw string
    &#125;,
    website: &#123;
      type: 'string',
      pattern: patterns.url.source
    &#125;
  &#125;
&#125;</code></pre>

	<h1>Format vs Pattern</h1>
	<p>
		Use <code>format</code> to select an input type (e.g. <code>'email'</code> renders an email
		<code>&lt;input&gt;</code>). Use <code>pattern</code> for regex validation of the value. These
		are independent — you can use both together.
	</p>

	<pre><code>// format selects the input widget; pattern validates the value
&#123;
  type: 'string',
  format: 'email',                  // → renders &lt;input type="email"&gt;
  pattern: patterns.email.source    // → also validates with regex
&#125;</code></pre>

	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Explore validation in detail — real-time vs on-submit, standalone functions, and the
			StatusList component — or jump into advanced features like conditional fields and
			lookups.
		</p>
		<span>
			<a href="/forms/validation" class="button is-primary">
				Validation
				<span class="ml-2">→</span>
			</a>
			<a href="/forms/advanced" class="button is-primary">
				Advanced Features
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
