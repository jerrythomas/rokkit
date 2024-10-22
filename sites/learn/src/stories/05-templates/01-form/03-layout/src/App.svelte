<script>
	import { Form } from '@rokkit/ui'
	import { schema } from './schema.js'
	import { layout } from './layout.js'

	let value = $state({ first_name: null, last_name: null, gender: null, age: null })
</script>

<Form bind:value {schema} {layout} />
<pre>{JSON.stringify(value, null, 2)}</pre>
