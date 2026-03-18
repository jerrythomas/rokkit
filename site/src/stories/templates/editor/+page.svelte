<article data-article-root>
	<h1>Introduction</h1>
	<p>
		The <strong>Editor</strong> template is a composition pattern for building nested data editors.
		It pairs a <code>Tree</code> component on the left for navigating hierarchical data with a
		<code>FormRenderer</code> on the right for editing the selected node's data — laid out using
		<code>NavContent</code>.
	</p>
	<p>
		This pattern is suited to any application where users need to browse a tree-structured dataset
		and edit individual nodes: JSON configuration editors, site structure managers, nested category
		systems, settings trees, and similar interfaces.
	</p>

	<h1>Pattern Overview</h1>
	<ul>
		<li>
			<strong>Tree</strong> (left panel): displays the hierarchical data structure, supports
			expand/collapse, keyboard navigation, and selection
		</li>
		<li>
			<strong>FormRenderer</strong> (right panel): renders an editable form for the currently selected
			node, driven by a FormBuilder for validation and dirty tracking
		</li>
		<li>
			<strong>NavContent</strong>: provides the split-pane layout with tree on the left and form on
			the right
		</li>
		<li>
			Selection in the Tree drives which node the FormRenderer displays — the two components share
			a selected-node reference
		</li>
	</ul>

	<h1>Basic Structure</h1>
	<p>The core composition wires three components together:</p>

	<pre><code>&lt;script&gt;
  import &#123; Tree &#125; from '@rokkit/ui'
  import &#123; FormRenderer, FormBuilder &#125; from '@rokkit/forms'
  import NavContent from '@rokkit/ui/NavContent.svelte'

  // Hierarchical data with children
  const nodes = [
    &#123;
      value: 'database',
      text: 'Database',
      data: &#123; host: 'localhost', port: 5432, name: 'mydb' &#125;,
      children: [
        &#123; value: 'connection', text: 'Connection', data: &#123; timeout: 30, pool: 5 &#125; &#125;,
        &#123; value: 'auth', text: 'Auth', data: &#123; user: 'admin', password: '' &#125; &#125;
      ]
    &#125;,
    &#123;
      value: 'server',
      text: 'Server',
      data: &#123; host: '0.0.0.0', port: 8080 &#125;,
      children: []
    &#125;
  ]

  let selectedNode = $state(null)
  let builder = $state(null)

  function handleSelect(value, proxy) &#123;
    selectedNode = proxy
    // Create a new FormBuilder for the selected node's data
    builder = new FormBuilder(proxy.data ?? &#123;&#125;)
  &#125;

  async function handleSubmit(visibleData) &#123;
    // Persist visibleData back to the selected node
    Object.assign(selectedNode.data, visibleData)
    builder.snapshot() // clear dirty state after save
  &#125;
&lt;/script&gt;

&lt;NavContent&gt;
  &#123;#snippet nav()&#125;
    &lt;Tree
      items=&#123;nodes&#125;
      onselect=&#123;handleSelect&#125;
    /&gt;
  &#123;/snippet&#125;

  &#123;#snippet content()&#125;
    &#123;#if builder&#125;
      &lt;FormRenderer
        &#123;builder&#125;
        onsubmit=&#123;handleSubmit&#125;
      /&gt;
    &#123;:else&#125;
      &lt;p&gt;Select a node to edit&lt;/p&gt;
    &#123;/if&#125;
  &#123;/snippet&#125;
&lt;/NavContent&gt;</code></pre>

	<h1>With Schema and Validation</h1>
	<p>
		Provide a schema per node type to control field types, validation rules, and labels. You can
		derive the schema from the node's data automatically, or supply explicit schemas keyed by node
		type:
	</p>

	<pre><code>&lt;script&gt;
  // Schema map keyed by node type
  const schemas = &#123;
    connection: &#123;
      type: 'object',
      properties: &#123;
        timeout: &#123; type: 'integer', min: 1, max: 300, required: true &#125;,
        pool: &#123; type: 'integer', min: 1, max: 100, required: true &#125;
      &#125;
    &#125;,
    auth: &#123;
      type: 'object',
      properties: &#123;
        user: &#123; type: 'string', required: true &#125;,
        password: &#123; type: 'string', format: 'password' &#125;
      &#125;
    &#125;
  &#125;

  function handleSelect(value, proxy) &#123;
    selectedNode = proxy
    const schema = schemas[proxy.value] ?? null
    builder = new FormBuilder(proxy.data ?? &#123;&#125;, schema)
  &#125;
&lt;/script&gt;</code></pre>

	<h1>Key Wiring Points</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Tree → FormRenderer</h1>
			<ul>
				<li>
					Tree's <code>onselect</code> callback receives the selected value and a <code>proxy</code>
					(ProxyItem) with the full node data
				</li>
				<li>Create a new <code>FormBuilder</code> instance on each selection using the node's data</li>
				<li>Pass the builder to <code>FormRenderer</code> to render the node's editable form</li>
				<li>Recreating the builder resets dirty tracking and validation for the new node</li>
			</ul>
		</div>

		<div data-card>
			<h1>Save Behavior</h1>
			<ul>
				<li>
					<code>onsubmit</code> receives <code>visibleData</code> — the validated, visible-field data
				</li>
				<li>
					Write the result back into the tree node data and call <code>builder.snapshot()</code> to
					reset dirty state
				</li>
				<li>For async persistence, await your API call before snapshotting</li>
				<li>
					Use <code>getVisibleData()</code> on the builder if you need to read data without a submit
					action
				</li>
			</ul>
		</div>
	</div>

	<h1>Empty State</h1>
	<p>
		Always handle the no-selection state. When nothing is selected, render a placeholder in the
		content area:
	</p>

	<pre><code>&#123;#if builder&#125;
  &lt;FormRenderer &#123;builder&#125; onsubmit=&#123;handleSubmit&#125; /&gt;
&#123;:else&#125;
  &lt;div data-card&gt;
    &lt;p&gt;Select an item from the tree to edit its properties.&lt;/p&gt;
  &lt;/div&gt;
&#123;/if&#125;</code></pre>

	<h1>Variations</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>When to Use This Pattern</h1>
			<ul>
				<li>JSON / YAML configuration editors</li>
				<li>Site map or page hierarchy editors</li>
				<li>Nested category or taxonomy management</li>
				<li>File system metadata editors</li>
				<li>Settings trees (grouped preferences with sub-pages)</li>
				<li>Node-based data pipelines or workflows</li>
			</ul>
		</div>

		<div data-card>
			<h1>Extension Points</h1>
			<ul>
				<li>
					Add a toolbar above the Tree for node actions (add child, delete, rename) using
					<code>Toolbar</code>
				</li>
				<li>Show dirty-node indicators in the Tree by checking <code>builder.isDirty</code></li>
				<li>
					Use <code>StatusList</code> above the form to surface all field errors at once
				</li>
				<li>Support multiple selection for bulk editing by maintaining a set of selected paths</li>
				<li>
					Persist the expanded state of the Tree across node edits using the <code>expanded</code> prop
				</li>
			</ul>
		</div>
	</div>

	<section data-card-cta>
		<h2>Components used in this pattern</h2>
		<p>Explore the individual building blocks that make up the Editor template.</p>
		<span>
			<a href="/elements/tree" class="button is-primary">Tree →</a>
			<a href="/forms/overview" class="button is-primary">Forms →</a>
			<a href="/layout/nav-content" class="button is-primary">NavContent →</a>
		</span>
	</section>
</article>
