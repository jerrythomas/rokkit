<article data-article-root>
	<h1>Introduction</h1>
	<p>
		<strong>StatusList</strong> is a display component from <code>@rokkit/forms</code> that renders
		a grouped summary of validation messages. Items are grouped by severity — errors, warnings, info,
		and success — each with a count header. It is a pure display component with no internal state.
	</p>
	<p>
		It is designed to show the full validation picture at a glance: how many errors remain before a
		form can be submitted, what warnings exist, and what has passed. The component renders nothing
		when the items array is empty.
	</p>

	<h1>Notable features</h1>
	<ul>
		<li>Groups messages by severity: error → warning → info → success</li>
		<li>Count header per severity group (e.g. "2 errors")</li>
		<li>Optional click-to-focus: pass <code>onclick</code> to navigate to the failing field</li>
		<li>Renders nothing when <code>items</code> is empty — safe to always mount</li>
		<li><code>role="status"</code> live region — screen readers announce updates as state changes</li>
		<li>Data-attribute hooks for CSS theming per severity</li>
	</ul>

	<h1>Basic Usage</h1>
	<p>Pass an array of items with <code>path</code>, <code>state</code>, and <code>text</code>:</p>

	<pre><code>&lt;script&gt;
  import &#123; StatusList &#125; from '@rokkit/forms'

  const items = [
    &#123; path: 'name', state: 'error', text: 'Name is required' &#125;,
    &#123; path: 'email', state: 'error', text: 'Email format is invalid' &#125;,
    &#123; path: 'phone', state: 'warning', text: 'Phone number is optional but recommended' &#125;,
    &#123; path: 'username', state: 'success', text: 'Username is available' &#125;
  ]
&lt;/script&gt;

&lt;StatusList &#123;items&#125; /&gt;</code></pre>

	<h1>Item Shape</h1>
	<p>Each item in the array must have these fields:</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Item Fields</h1>
			<ul>
				<li><strong>path</strong>: String key identifying the field (used as list item key and for onclick callback)</li>
				<li>
					<strong>state</strong>: Severity — <code>'error' | 'warning' | 'info' | 'success'</code>
				</li>
				<li><strong>text</strong>: Human-readable message describing the issue or result</li>
			</ul>
		</div>

		<div data-card>
			<h1>Props</h1>
			<ul>
				<li>
					<strong>items</strong>: <code>Array&lt;&#123; path, state, text &#125;&gt;</code> — the validation
					messages to display
				</li>
				<li>
					<strong>onclick</strong>: <code>(path: string) =&gt; void</code> — optional callback when an
					item is clicked. When provided, items render as <code>&lt;button&gt;</code> elements
				</li>
				<li><strong>class</strong>: Additional CSS classes on the root element</li>
			</ul>
		</div>
	</div>

	<h1>Integration with FormBuilder</h1>
	<p>
		The most common use case is feeding <code>builder.errors</code> directly into StatusList.
		The errors array already has the correct shape — each entry has <code>path</code>,
		<code>state</code>, and <code>text</code>.
	</p>

	<pre><code>&lt;script&gt;
  import &#123; FormBuilder, FormRenderer, StatusList &#125; from '@rokkit/forms'

  const builder = new FormBuilder(data, schema, layout)

  function handleSubmit() &#123;
    builder.validate()
  &#125;
&lt;/script&gt;

&lt;StatusList items=&#123;builder.errors&#125; /&gt;
&lt;FormRenderer &#123;builder&#125; onsubmit=&#123;handleSubmit&#125; /&gt;</code></pre>

	<p>
		Use <code>builder.messages</code> instead of <code>builder.errors</code> to include all severity
		levels (not just errors):
	</p>

	<pre><code>&lt;!-- Show all messages: errors, warnings, info, success --&gt;
&lt;StatusList items=&#123;builder.messages&#125; /&gt;</code></pre>

	<h1>Click-to-Focus</h1>
	<p>
		Pass an <code>onclick</code> handler to make each validation item a focusable button. Use this
		to scroll to or focus the failing field when clicked:
	</p>

	<pre><code>&lt;script&gt;
  function focusField(path) &#123;
    const el = document.querySelector(`[data-scope="#/&#123;path&#125;"]`)
    el?.querySelector('input, select, textarea')?.focus()
  &#125;
&lt;/script&gt;

&lt;StatusList items=&#123;builder.errors&#125; onclick=&#123;focusField&#125; /&gt;</code></pre>

	<h1>Password Strength Example</h1>
	<p>
		StatusList works well for real-time rule checking as the user types. Build your own rules
		array and update it reactively:
	</p>

	<pre><code>&lt;script&gt;
  import &#123; StatusList &#125; from '@rokkit/forms'

  let password = $state('')

  const checks = $derived([
    &#123;
      path: 'length',
      state: password.length &gt;= 8 ? 'success' : 'fail',
      text: 'At least 8 characters'
    &#125;,
    &#123;
      path: 'uppercase',
      state: /[A-Z]/.test(password) ? 'success' : 'fail',
      text: 'Contains an uppercase letter'
    &#125;,
    &#123;
      path: 'number',
      state: /[0-9]/.test(password) ? 'success' : 'fail',
      text: 'Contains a number'
    &#125;,
    &#123;
      path: 'special',
      state: /[^A-Za-z0-9]/.test(password) ? 'success' : 'warning',
      text: 'Contains a special character (recommended)'
    &#125;
  ])
&lt;/script&gt;

&lt;input type="password" bind:value=&#123;password&#125; placeholder="Enter password" /&gt;
&lt;StatusList items=&#123;checks&#125; /&gt;</code></pre>

	<h1>Pre-Submit Summary</h1>
	<p>
		Show a summary before allowing submission. The component only renders when there are items, so
		it disappears when the form is clean:
	</p>

	<pre><code>&lt;script&gt;
  import &#123; FormBuilder, FormRenderer, StatusList &#125; from '@rokkit/forms'

  const builder = new FormBuilder(data, schema, layout)
  let submitted = $state(false)

  async function handleSubmit(visibleData, &#123; isValid &#125;) &#123;
    submitted = true
    if (!isValid) return
    await save(visibleData)
  &#125;
&lt;/script&gt;

&#123;#if submitted&#125;
  &lt;StatusList items=&#123;builder.errors&#125; onclick=&#123;(path) =&gt; focusField(path)&#125; /&gt;
&#123;/if&#125;

&lt;FormRenderer &#123;builder&#125; onsubmit=&#123;handleSubmit&#125; /&gt;</code></pre>

	<h1>Data Attributes</h1>
	<p>The component renders the following data attributes for CSS theming:</p>

	<pre><code>data-validation-report          — root element
data-validation-group           — severity group wrapper
data-severity="error|warning|info|success"  — on each group
data-validation-group-header    — count + label header inside each group
data-validation-count           — the count number span
data-validation-item            — individual message item
data-status="error|warning|info|success"    — on each item</code></pre>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>When to Use</h1>
			<ul>
				<li>Pre-submit validation summaries listing all form errors</li>
				<li>Password strength rules with live updates as the user types</li>
				<li>Form completeness checklists for multi-step wizards</li>
				<li>System health or configuration checks</li>
				<li>Any multi-rule pass/fail display where status changes reactively</li>
			</ul>
		</div>

		<div data-card>
			<h1>Design Notes</h1>
			<ul>
				<li>Items render in the order given — sort before passing if order matters</li>
				<li>Component renders nothing when items array is empty</li>
				<li>
					<code>role="status"</code> announces updates to screen readers without interrupting current
					speech
				</li>
				<li>When <code>onclick</code> is provided, items become keyboard-accessible buttons</li>
				<li>Severity grouping and count headers are automatic — no configuration needed</li>
			</ul>
		</div>
	</div>

	<section data-card-cta>
		<h2>Next steps</h2>
		<p>Learn about standalone input fields or explore the full schema-driven form system.</p>
		<span>
			<a href="/inputfield" class="button is-primary">← InputField</a>
			<a href="/forms/overview" class="button is-primary">Forms Overview →</a>
		</span>
	</section>
</article>
