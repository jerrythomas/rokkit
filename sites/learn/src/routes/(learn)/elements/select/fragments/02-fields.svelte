<script>
  import { Select } from '@rokkit/ui'
  
  const options = [
    { name: 'Fruits', photo: '/examples/fruits.jpg' },
    { name: 'Vegetables', photo: '/examples/vegetables.jpg' }
  ]
  
  let fields = { text: 'name', image: 'photo' }
  let value = null
</script>

<Select {options} {fields} bind:value />