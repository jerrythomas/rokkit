<script>
	import { Form } from '@rokkit/ui'

	let value = $state({
		name: 'John Doe',
		gender: 'male',
		email: 'john.doe@example.com',
		age: 30
	})
</script>

<Form bind:value />
<pre class="mt-4 text-sm">{JSON.stringify(value, null, 2)}</pre>