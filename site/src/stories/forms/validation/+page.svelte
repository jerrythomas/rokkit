<article data-article-root>
	<h1>Validation</h1>
	<p>
		Validation in <code>@rokkit/forms</code> is schema-driven. Constraints defined in the schema
		are checked against field values, producing messages with a severity state
		(<code>error</code>, <code>warning</code>, <code>info</code>, <code>success</code>). You can
		also set messages manually for server-side or custom logic.
	</p>

	<h1>Validation Constraints</h1>
	<p>
		Add constraint properties to a field's schema entry. They are evaluated automatically when
		<code>validate()</code> or <code>validateField()</code> is called.
	</p>

	<pre><code>const schema = &#123;
  type: 'object',
  properties: &#123;
    name:     &#123; type: 'string',  required: true, minLength: 2, maxLength: 80 &#125;,
    email:    &#123; type: 'string',  required: true, pattern: patterns.email.source &#125;,
    age:      &#123; type: 'integer', required: true, min: 18, max: 120 &#125;,
    website:  &#123; type: 'string',  pattern: patterns.url.source &#125;,
    terms:    &#123; type: 'boolean', required: true, mustBeTrue: true &#125;
  &#125;
&#125;</code></pre>

	<h1>Validation Modes</h1>
	<p>
		Pass <code>validateOn</code> to <code>FormRenderer</code> to control when fields are validated
		automatically.
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<div data-card>
			<h1>blur (default)</h1>
			<p>
				Validates a field when it loses focus. Provides feedback after the user has finished
				entering a value — the least intrusive option.
			</p>
			<pre><code>&lt;FormRenderer
  validateOn="blur"
  ...
/&gt;</code></pre>
		</div>

		<div data-card>
			<h1>change</h1>
			<p>
				Validates on every keystroke or value change. Gives immediate inline feedback — useful
				for fields with strict format requirements.
			</p>
			<pre><code>&lt;FormRenderer
  validateOn="change"
  ...
/&gt;</code></pre>
		</div>

		<div data-card>
			<h1>manual</h1>
			<p>
				No automatic validation. Call <code>builder.validate()</code> explicitly — useful for
				on-submit-only validation.
			</p>
			<pre><code>&lt;FormRenderer
  validateOn="manual"
  ...
/&gt;</code></pre>
		</div>
	</div>

	<h1>Validating with FormBuilder</h1>
	<p>
		When using <code>FormBuilder</code> directly, call <code>validate()</code> to run all visible
		fields, or <code>validateField(path)</code> for a single field. Both update the internal
		validation state so the UI reflects errors.
	</p>

	<pre><code>import &#123; FormBuilder &#125; from '@rokkit/forms'

const builder = new FormBuilder(
  &#123; name: '', email: 'bad', age: 5 &#125;,
  schema,
  layout
)

// Validate all visible fields at once
const results = builder.validate()
// &#123;
//   name:  &#123; state: 'error', text: 'Name is required' &#125;,
//   email: &#123; state: 'error', text: 'Email format is invalid' &#125;,
//   age:   &#123; state: 'error', text: 'Age must be at least 18' &#125;
// &#125;

builder.isValid   // false
builder.errors    // [&#123; path: 'name', state: 'error', text: '...' &#125;, ...]

// Validate a single field
const msg = builder.validateField('email')
// &#123; state: 'error', text: 'Email format is invalid' &#125;</code></pre>

	<h1>On-Submit Validation Pattern</h1>
	<pre><code>async function handleSubmit(visibleData, &#123; isValid, errors &#125;) &#123;
  if (!isValid) &#123;
    // errors is an array of &#123; path, state, text &#125; objects
    console.error('Form has errors:', errors)
    return
  &#125;
  await fetch('/api/save', &#123;
    method: 'POST',
    body: JSON.stringify(visibleData)
  &#125;)
&#125;</code></pre>

	<h1>Standalone Validation Functions</h1>
	<p>
		Use the standalone functions when you need to validate values outside of a
		<code>FormBuilder</code> instance — for example in a custom submission handler or unit tests.
	</p>

	<pre><code>import &#123; validateField, validateAll &#125; from '@rokkit/forms'

// Validate a single value against a field schema
const result = validateField(
  '',                              // value
  &#123; type: 'string', required: true &#125;,  // field schema
  'Name'                           // field label (used in error message)
)
// &#123; state: 'error', text: 'Name is required' &#125;

// Validate all fields in a data object
const results = validateAll(data, schema, layout)
// &#123; fieldPath: &#123; state, text &#125;, ... &#125;</code></pre>

	<h1>Manual Validation Messages</h1>
	<p>
		Set arbitrary messages on fields — useful for server-side validation responses, async checks,
		or informational feedback.
	</p>

	<pre><code>import &#123; createMessage &#125; from '@rokkit/forms'

// Set an error from a server response
builder.setFieldValidation('email', &#123;
  state: 'error',
  text: 'This email address is already registered'
&#125;)

// Set an informational message
builder.setFieldValidation('password', &#123;
  state: 'info',
  text: 'A reset link will be sent to your email'
&#125;)

// Clear a specific field's message
builder.setFieldValidation('email', null)

// Clear all validation messages
builder.clearValidation()

// createMessage helper creates the right shape
const msg = createMessage('email', 'warning', 'This email is already in use')</code></pre>

	<h1>Validation Message States</h1>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Severity levels</h1>
			<ul>
				<li><strong>error</strong> — blocks form submission; shown in red</li>
				<li><strong>warning</strong> — does not block submission; shown in amber</li>
				<li><strong>info</strong> — informational; shown in blue</li>
				<li><strong>success</strong> — positive feedback; shown in green</li>
			</ul>
		</div>

		<div data-card>
			<h1>FormBuilder validation properties</h1>
			<ul>
				<li><strong>isValid</strong> — <code>true</code> when there are no error-state messages</li>
				<li><strong>errors</strong> — array of all error messages</li>
				<li><strong>messages</strong> — all messages sorted by severity</li>
				<li><strong>validation</strong> — raw validation state keyed by field path</li>
			</ul>
		</div>
	</div>

	<h1>Built-in Patterns</h1>
	<p>
		The <code>patterns</code> export provides compiled regex objects for common formats. Use
		<code>.source</code> to get the string for the <code>pattern</code> schema property, or use
		the regex directly in JavaScript.
	</p>

	<pre><code>import &#123; patterns &#125; from '@rokkit/forms'

// Available patterns
patterns.email      // /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]&#123;2,&#125;$/
patterns.phone      // /^\+?[\d\s\-\(\)]&#123;10,&#125;$/
patterns.url        // /^https?:\/\/[^\s/$.?#].[^\s]*$/
patterns.zipCode    // /^\d&#123;5&#125;(-\d&#123;4&#125;)?$/
patterns.creditCard // /^\d&#123;4&#125;\s?\d&#123;4&#125;\s?\d&#123;4&#125;\s?\d&#123;4&#125;$/

// Use in schema
const schema = &#123;
  type: 'object',
  properties: &#123;
    email: &#123;
      type: 'string',
      required: true,
      pattern: patterns.email.source   // .source extracts the raw regex string
    &#125;
  &#125;
&#125;</code></pre>

	<h1>StatusList Component</h1>
	<p>
		<code>StatusList</code> renders a summary list of all validation errors. Pass the
		<code>errors</code> array from a <code>FormBuilder</code> instance. Useful for a validation
		summary above or below the form, especially on submit.
	</p>

	<pre><code>&lt;script&gt;
  import &#123; FormBuilder, FormRenderer, StatusList &#125; from '@rokkit/forms'

  const builder = new FormBuilder(data, schema, layout)

  async function handleSubmit() &#123;
    builder.validate()
    if (!builder.isValid) return
    await save(builder.getVisibleData())
  &#125;
&lt;/script&gt;

&lt;!-- Show summary of all errors at the top --&gt;
&lt;StatusList errors=&#123;builder.errors&#125; /&gt;

&lt;FormRenderer &#123;builder&#125; onsubmit=&#123;handleSubmit&#125; /&gt;</code></pre>

	<h1>Custom Validation Hook</h1>
	<p>
		The <code>onvalidate</code> prop on <code>FormRenderer</code> lets you intercept validation
		events and augment or replace the built-in result. Return a
		<code>ValidationMessage</code> to override, or return nothing to keep the schema result.
	</p>

	<pre><code>&lt;FormRenderer
  bind:data
  &#123;schema&#125;
  &#123;layout&#125;
  onvalidate=&#123;async (fieldPath, value, event) => &#123;
    if (fieldPath === 'username') &#123;
      const taken = await checkUsernameTaken(value)
      if (taken) return &#123; state: 'error', text: 'This username is already taken' &#125;
    &#125;
    // return nothing → use schema validation result
  &#125;&#125;
  onsubmit=&#123;handleSubmit&#125;
/&gt;</code></pre>

	<h1>Dirty Tracking</h1>
	<p>
		<code>FormBuilder</code> tracks which fields have changed from their initial snapshot. Use this
		to disable the Save button when nothing has changed.
	</p>

	<pre><code>const builder = new FormBuilder(&#123; name: 'Alice', age: 30 &#125;)

builder.isDirty              // false
builder.updateField('name', 'Bob')
builder.isDirty              // true
builder.isFieldDirty('name') // true
builder.isFieldDirty('age')  // false
builder.dirtyFields          // Set &#123; 'name' &#125;

// snapshot() resets the baseline — call after a successful save
builder.snapshot()
builder.isDirty              // false

// reset() reverts all changes to the last snapshot
builder.updateField('name', 'Charlie')
builder.reset()
builder.data.name            // 'Bob' (reverted to snapshot)</code></pre>

	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Explore the Advanced guide for conditional fields and lookup-based dependent selects, or
			return to the Overview for a high-level picture.
		</p>
		<span>
			<a href="/forms/advanced" class="button is-primary">
				Advanced Features
				<span class="ml-2">→</span>
			</a>
			<a href="/forms/overview" class="button is-primary">
				Overview
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
