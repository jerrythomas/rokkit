<script>
	import { Form } from '@rokkit/ui'
	import { schema } from './schema.js'

	let value = { name: '', gender: '', age: 10, bio: '' }
</script>

<Form bind:value {schema} />
<pre>
	{JSON.stringify(value)}
</pre>
