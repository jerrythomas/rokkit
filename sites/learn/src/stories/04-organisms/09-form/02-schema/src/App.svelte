<script>
  import { Form } from '@rokkit/organisms'
  import { schema } from './schema'

  let value = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 30
  };
</script>

<Form bind:value {schema} />
<pre>{JSON.stringify(value, null, 2)}</pre>
