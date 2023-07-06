<script>
	import { FormFields } from '@rokkit/organisms'
	import { schema } from './schema.js'

	let value = { name: null, gender: null, age: null, bio: null }
</script>

<FormFields bind:value {schema} />
<pre>
	{JSON.stringify(value)}
</pre>
