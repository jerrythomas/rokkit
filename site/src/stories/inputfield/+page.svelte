<article data-article-root>
	<h1>Introduction</h1>
	<p>
		<strong>InputField</strong> is a standalone labeled form field from <code>@rokkit/forms</code>.
		It wraps any input type with a label, optional description, and validation error display — giving
		you a complete, styled field without requiring a full FormBuilder or FormRenderer setup.
	</p>
	<p>
		Use InputField when you need individual form fields outside of a schema-driven form, or when
		building custom form layouts where you want consistent field structure but manual control.
	</p>

	<h1>Notable features</h1>
	<ul>
		<li>Label, description, and validation message in one component</li>
		<li>All standard HTML input types supported (text, email, password, number, date, etc.)</li>
		<li>Validation state display via <code>message</code> prop (error, warning, info, success)</li>
		<li>Dirty tracking support via <code>dirty</code> prop for visual feedback</li>
		<li>Data-attribute hooks on root for CSS theming</li>
		<li>Pairs with <code>Input</code> for bare inputs and <code>InfoField</code> for read-only display</li>
	</ul>

	<h1>Basic Usage</h1>
	<p>Import from <code>@rokkit/forms</code> and bind a value:</p>

	<pre><code>&lt;script&gt;
  import &#123; InputField &#125; from '@rokkit/forms'

  let name = $state('')
  let email = $state('')
&lt;/script&gt;

&lt;InputField label="Name" bind:value=&#123;name&#125; /&gt;
&lt;InputField label="Email" type="email" bind:value=&#123;email&#125; required /&gt;</code></pre>

	<h1>Props</h1>
	<p>InputField accepts the following props:</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Field Props</h1>
			<ul>
				<li><strong>label</strong>: Display label shown above the input</li>
				<li><strong>value</strong>: Bindable input value</li>
				<li><strong>type</strong>: HTML input type (text, email, password, number, date, etc.)</li>
				<li><strong>name</strong>: Input name attribute (used for label association)</li>
				<li><strong>required</strong>: Marks field as required</li>
				<li><strong>disabled</strong>: Disables the input</li>
				<li><strong>description</strong>: Help text displayed below the input</li>
				<li><strong>placeholder</strong>: Placeholder text passed to the input</li>
			</ul>
		</div>

		<div data-card>
			<h1>State Props</h1>
			<ul>
				<li>
					<strong>message</strong>: Validation message object <code
						>&#123; state, text &#125;</code
					> — state is <code>'error' | 'warning' | 'info' | 'success'</code>
				</li>
				<li>
					<strong>status</strong>: Override the field state appearance without a message text
				</li>
				<li><strong>dirty</strong>: When true, applies dirty indicator styling</li>
				<li><strong>nolabel</strong>: Suppress label rendering</li>
				<li><strong>icon</strong>: Icon class to display inside the input</li>
				<li><strong>class</strong>: Additional CSS classes on the root element</li>
			</ul>
		</div>
	</div>

	<h1>Validation Messages</h1>
	<p>
		Pass a <code>message</code> object with a <code>state</code> and <code>text</code> to show validation
		feedback. The field root element receives a <code>data-field-state</code> attribute that drives
		themed styling.
	</p>

	<pre><code>&lt;InputField
  label="Email"
  type="email"
  bind:value=&#123;email&#125;
  message=&#123;&#123; state: 'error', text: 'Please enter a valid email address' &#125;&#125;
/&gt;

&lt;InputField
  label="Username"
  bind:value=&#123;username&#125;
  message=&#123;&#123; state: 'success', text: 'Username is available' &#125;&#125;
/&gt;</code></pre>

	<h1>With Description</h1>
	<p>Use <code>description</code> to add help text below the input:</p>

	<pre><code>&lt;InputField
  label="Password"
  type="password"
  bind:value=&#123;password&#125;
  description="Must be at least 8 characters with one number"
/&gt;</code></pre>

	<h1>Integration with FormBuilder</h1>
	<p>
		When using FormBuilder, validation messages and dirty state come from <code>builder.errors</code>
		and field elements. You can wire InputField manually to a builder if needed:
	</p>

	<pre><code>&lt;script&gt;
  import &#123; FormBuilder, InputField &#125; from '@rokkit/forms'

  const builder = new FormBuilder(&#123; email: '' &#125;, schema, layout)

  function handleBlur() &#123;
    builder.validateField('email')
  &#125;
&lt;/script&gt;

&lt;InputField
  label="Email"
  type="email"
  bind:value=&#123;builder.data.email&#125;
  message=&#123;builder.validation['email'] ?? null&#125;
  onblur=&#123;handleBlur&#125;
/&gt;</code></pre>

	<h1>Input — Bare Input Component</h1>
	<p>
		For custom layouts where you only need the input element (without label or message wrapper), use
		<code>Input</code> directly. It resolves the correct renderer component based on <code>type</code
		> and supports icons.
	</p>

	<pre><code>&lt;script&gt;
  import &#123; Input &#125; from '@rokkit/forms'

  let value = $state('')
&lt;/script&gt;

&lt;!-- Text input --&gt;
&lt;Input type="text" bind:value placeholder="Search..." /&gt;

&lt;!-- Input with icon --&gt;
&lt;Input type="text" bind:value icon="i-lucide:search" /&gt;</code></pre>

	<h1>InfoField — Read-Only Display</h1>
	<p>
		<code>InfoField</code> renders a labeled read-only display field — useful for confirmation screens,
		detail views, or mixed read/write forms where some values should not be editable.
	</p>

	<pre><code>&lt;script&gt;
  import &#123; InfoField &#125; from '@rokkit/forms'
&lt;/script&gt;

&lt;InfoField label="Account Type" value="Business" /&gt;
&lt;InfoField label="Created" value=&#123;createdAt&#125; /&gt;
&lt;InfoField label="Status" value=&#123;undefined&#125; /&gt;
&lt;!-- Renders '—' when value is undefined --&gt;</code></pre>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>InfoField Props</h1>
			<ul>
				<li><strong>label</strong>: Display label</li>
				<li><strong>value</strong>: Value to display (renders '—' when undefined)</li>
				<li><strong>name</strong>: Field name for accessibility</li>
				<li><strong>description</strong>: Help text below the displayed value</li>
				<li><strong>class</strong>: Additional CSS classes</li>
			</ul>
		</div>

		<div data-card>
			<h1>When to Use Each</h1>
			<ul>
				<li>
					<strong>InputField</strong>: Editable fields with label and validation — standalone or in
					custom form layouts
				</li>
				<li>
					<strong>Input</strong>: When you need just the input element and manage label/validation
					yourself
				</li>
				<li>
					<strong>InfoField</strong>: Read-only display of values with consistent field layout
				</li>
				<li>
					<strong>FormRenderer</strong>: Full schema-driven form rendering — uses InputField and
					InfoField internally
				</li>
			</ul>
		</div>
	</div>

	<h1>Data Attributes</h1>
	<p>
		InputField applies data attributes to its root <code>&lt;div data-field-root&gt;</code> for CSS
		theming:
	</p>

	<pre><code>data-field-root        — root element
data-field-state       — 'error' | 'warning' | 'info' | 'success'
data-field-type        — input type string
data-field-required    — present when required
data-field-disabled    — present when disabled
data-field-dirty       — present when value differs from initial
data-field-empty       — present when value is null or undefined</code></pre>

	<section data-card-cta>
		<h2>Next steps</h2>
		<p>Explore the full schema-driven form system or learn about validation display components.</p>
		<span>
			<a href="/forms/overview" class="button is-primary">Forms Overview →</a>
			<a href="/validation-report" class="button is-primary">StatusList →</a>
		</span>
	</section>
</article>
