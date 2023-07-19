<script>
  import { Form } from '@rokkit/organisms'

  let value = {
    name: 'John Doe',
    gender: 'male',
    email: 'john.doe@example.com',
    age: 30
  }

</script>
<Form bind:value />
<pre>{JSON.stringify(value, null, 2)}</pre>