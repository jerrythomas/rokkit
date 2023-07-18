<script>
	import { Form } from '@rokkit/organisms'
	import { schema } from './schema.js'

	let value = { name: null, gender: null, age: null, bio: null }
</script>

<Form bind:value  />
<pre>
	{JSON.stringify(value)}
</pre>
