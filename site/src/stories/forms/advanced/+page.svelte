<article data-article-root>
	<h1>Advanced Features</h1>
	<p>
		This guide covers conditional field visibility, lookup-based dependent selects, and array field
		editors — the building blocks for dynamic, data-driven forms.
	</p>

	<!-- CONDITIONAL FIELDS -->

	<h1>Conditional Fields</h1>
	<p>
		Use <code>showWhen</code> on a layout element to show or hide a field based on the value of
		another field. Hidden fields are excluded from validation and from the data returned by
		<code>getVisibleData()</code>.
	</p>

	<pre><code>const layout = &#123;
  type: 'vertical',
  elements: [
    &#123; scope: '#/accountType', label: 'Account Type' &#125;,
    &#123;
      scope: '#/companyName',
      label: 'Company Name',
      showWhen: &#123; field: 'accountType', equals: 'business' &#125;
    &#125;,
    &#123;
      scope: '#/vatNumber',
      label: 'VAT Number',
      showWhen: &#123; field: 'accountType', notEquals: 'personal' &#125;
    &#125;
  ]
&#125;</code></pre>

	<h1>showWhen Operators</h1>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>equals</h1>
			<p>Show the field when the target field's value strictly equals the given value.</p>
			<pre><code>showWhen: &#123; field: 'type', equals: 'business' &#125;</code></pre>
		</div>

		<div data-card>
			<h1>notEquals</h1>
			<p>Show the field when the target field's value does not equal the given value.</p>
			<pre><code>showWhen: &#123; field: 'type', notEquals: 'personal' &#125;</code></pre>
		</div>
	</div>

	<h1>Key Behaviours</h1>
	<ul>
		<li>Hidden fields are excluded from <code>builder.elements</code></li>
		<li>Hidden fields are skipped by <code>validate()</code> — they cannot block submission</li>
		<li>Stale validation errors on hidden fields are automatically cleared</li>
		<li><code>getVisibleData()</code> returns only the data for currently visible fields</li>
	</ul>

	<h1>Submitting with Conditional Fields</h1>
	<p>
		Call <code>getVisibleData()</code> instead of reading <code>data</code> directly to ensure
		hidden field values are excluded from the payload.
	</p>

	<pre><code>&lt;script&gt;
  import &#123; FormRenderer &#125; from '@rokkit/forms'

  let data = $state(&#123;
    accountType: '',
    companyName: ''
  &#125;)

  async function handleSubmit(visibleData, &#123; isValid &#125;) &#123;
    if (!isValid) return
    // visibleData excludes companyName when accountType !== 'business'
    await fetch('/api/register', &#123;
      method: 'POST',
      body: JSON.stringify(visibleData)
    &#125;)
  &#125;
&lt;/script&gt;

&lt;FormRenderer bind:data &#123;schema&#125; &#123;layout&#125; onsubmit=&#123;handleSubmit&#125; /&gt;</code></pre>

	<!-- LOOKUPS -->

	<h1>Lookups</h1>
	<p>
		Lookups populate a field's options list dynamically — from a remote API, an async function, or
		a client-side array. Pass a <code>lookups</code> object keyed by field path to
		<code>FormRenderer</code> or the <code>FormBuilder</code> constructor.
	</p>

	<pre><code>const lookups = &#123;
  country: &#123; url: '/api/countries' &#125;,
  city: &#123;
    dependsOn: ['country'],
    url: '/api/cities?country=&#123;country&#125;'
  &#125;
&#125;

// Pass to FormRenderer
&lt;FormRenderer bind:data &#123;schema&#125; &#123;layout&#125; &#123;lookups&#125; onsubmit=&#123;handleSubmit&#125; /&gt;</code></pre>

	<h1>Lookup Modes</h1>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<div data-card>
			<h1>URL Template</h1>
			<p>
				Fetch options from a URL. Placeholders like <code>&#123;country&#125;</code> are
				interpolated from form data. Responses are cached by the resolved URL.
			</p>
			<pre><code>&#123;
  url: '/api/cities?country=&#123;country&#125;',
  dependsOn: ['country']
&#125;</code></pre>
		</div>

		<div data-card>
			<h1>Async Fetch Hook</h1>
			<p>
				A custom async function that receives the full form data and returns the options array.
				Add <code>cacheKey</code> to enable caching.
			</p>
			<pre><code>&#123;
  dependsOn: ['country'],
  fetch: async (formData) => &#123;
    const res = await fetch(
      `/api/cities?c=$&#123;formData.country&#125;`
    )
    return res.json()
  &#125;,
  cacheKey: (d) => `cities-$&#123;d.country&#125;`
&#125;</code></pre>
		</div>

		<div data-card>
			<h1>Source + Filter</h1>
			<p>
				Synchronous client-side filtering of a pre-loaded array. No network calls, no loading
				state.
			</p>
			<pre><code>&#123;
  dependsOn: ['country'],
  source: allCities,
  filter: (items, formData) =>
    items.filter(
      c => c.country === formData.country
    )
&#125;</code></pre>
		</div>
	</div>

	<h1>Dependent Lookups</h1>
	<p>
		The <code>dependsOn</code> array lists the field paths a lookup depends on. When any dependency
		is empty or unset, the field is disabled and its options are cleared. When the dependency is
		satisfied, the lookup fetches automatically.
	</p>

	<pre><code>// When the user selects a country:
// 1. data.country is updated
// 2. data.city is cleared (because city depends on country)
// 3. city lookup re-fetches with the new country value
// 4. city field becomes enabled with the new options list

const lookups = &#123;
  country: &#123; url: '/api/countries' &#125;,
  city: &#123;
    url: '/api/cities?country=&#123;country&#125;',
    dependsOn: ['country']
  &#125;,
  suburb: &#123;
    url: '/api/suburbs?city=&#123;city&#125;',
    dependsOn: ['city']   // suburb depends on city, which depends on country
  &#125;
&#125;</code></pre>

	<h1>Response Transformation</h1>
	<p>
		URL-based lookups auto-extract arrays from <code>data</code>, <code>items</code>, or
		<code>results</code> keys. For other shapes, provide a <code>transform</code> function.
	</p>

	<pre><code>&#123;
  url: '/api/countries',
  transform: (response) => response.data.countries,
  fields: &#123; value: 'id', label: 'name' &#125;   // field mapping for the options array
&#125;</code></pre>

	<h1>Lookup Manager Methods</h1>
	<pre><code>// Check disabled state
builder.isFieldDisabled('city')      // true when country is not set

// Manually refresh
await builder.refreshLookup('city')

// Inspect current state
builder.getLookupState('city')
// &#123; options: [...], loading: false, error: null, disabled: false, fields: &#123;&#125; &#125;</code></pre>

	<!-- COMPLETE EXAMPLE -->

	<h1>Complete Dynamic Form Example</h1>
	<pre><code>&lt;script&gt;
  import &#123; FormRenderer &#125; from '@rokkit/forms'

  let data = $state(&#123;
    accountType: '',
    country: '',
    city: '',
    companyName: ''
  &#125;)

  const schema = &#123;
    type: 'object',
    properties: &#123;
      accountType: &#123; type: 'string', required: true, enum: ['personal', 'business'] &#125;,
      country:     &#123; type: 'string', required: true &#125;,
      city:        &#123; type: 'string', required: true &#125;,
      companyName: &#123; type: 'string', required: true, minLength: 2 &#125;
    &#125;
  &#125;

  const layout = &#123;
    type: 'vertical',
    elements: [
      &#123; scope: '#/accountType', label: 'Account Type' &#125;,
      &#123;
        scope: '#/companyName',
        label: 'Company Name',
        showWhen: &#123; field: 'accountType', equals: 'business' &#125;
      &#125;,
      &#123; type: 'separator' &#125;,
      &#123; scope: '#/country', label: 'Country' &#125;,
      &#123; scope: '#/city',    label: 'City' &#125;
    ]
  &#125;

  const allCities = [
    &#123; label: 'New York',    value: 'nyc',   country: 'USA' &#125;,
    &#123; label: 'Los Angeles', value: 'la',    country: 'USA' &#125;,
    &#123; label: 'Paris',       value: 'paris', country: 'France' &#125;,
    &#123; label: 'Lyon',        value: 'lyon',  country: 'France' &#125;
  ]

  const lookups = &#123;
    country: &#123; url: '/api/countries' &#125;,
    city: &#123;
      dependsOn: ['country'],
      source: allCities,
      filter: (items, formData) => items.filter(c => c.country === formData.country)
    &#125;
  &#125;

  async function handleSubmit(visibleData, &#123; isValid &#125;) &#123;
    if (!isValid) return
    await fetch('/api/register', &#123; method: 'POST', body: JSON.stringify(visibleData) &#125;)
  &#125;
&lt;/script&gt;

&lt;FormRenderer
  bind:data
  &#123;schema&#125;
  &#123;layout&#125;
  &#123;lookups&#125;
  validateOn="blur"
  onsubmit=&#123;handleSubmit&#125;
/&gt;</code></pre>

	<!-- ARRAY EDITORS -->

	<h1>Array Fields</h1>
	<p>
		Fields with <code>type: 'array'</code> in the schema render an array editor that lets users
		add, remove, and reorder items. The schema's <code>items</code> property describes each item's
		type.
	</p>

	<pre><code>const schema = &#123;
  type: 'object',
  properties: &#123;
    tags: &#123;
      type: 'array',
      items: &#123; type: 'string' &#125;
    &#125;,
    scores: &#123;
      type: 'array',
      items: &#123; type: 'number', min: 0, max: 100 &#125;
    &#125;
  &#125;
&#125;</code></pre>

	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			See the Validation guide for real-time validation, custom error messages, and the
			StatusList component.
		</p>
		<span>
			<a href="/forms/validation" class="button is-primary">
				Validation
				<span class="ml-2">→</span>
			</a>
			<a href="/forms/overview" class="button is-primary">
				Overview
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
