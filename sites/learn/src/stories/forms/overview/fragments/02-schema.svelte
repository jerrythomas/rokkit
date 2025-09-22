<script>
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', required: true },
    email: { type: 'email', required: true },
    age: { type: 'number', min: 18, max: 99 }
  }
}
</script>
<Form bind:value {schema} />
