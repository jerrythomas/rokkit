<script>
	// @ts-nocheck
	import { Code } from '@rokkit/ui'
</script>

<article data-article-root>
	<p>
		FormRenderer renders forms from a JSON schema and layout definition. It supports input fields,
		display components (tables, cards, sections, lists), validation with error reporting,
		dirty tracking, nested groups, and mixed display-plus-input layouts.
	</p>

	<h2>Quick Start</h2>
	<Code
		lang="svelte"
		code={`<script>
  import { FormRenderer } from '@rokkit/forms'

  let data = $state({ name: '', email: '' })

  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' }
    },
    required: ['name', 'email']
  }

  const layout = {
    type: 'vertical',
    elements: [
      { scope: '#/name', label: 'Name', props: { placeholder: 'Enter name' } },
      { scope: '#/email', label: 'Email', props: { placeholder: 'email@example.com' } }
    ]
  }
</script>

<FormRenderer bind:data {schema} {layout} validateOn="blur" />`}
	/>
</article>
