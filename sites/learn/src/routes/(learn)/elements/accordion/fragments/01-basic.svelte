<script>
  import { Accordion } from '@rokkit/ui'
  
  const data = [
    {
      text: 'Fruits',
      children: ['Apple', 'Orange', 'Banana']
    },
    {
      text: 'Vegetables', 
      children: ['Carrot', 'Tomato', 'Lettuce']
    }
  ]
</script>

<Accordion items={data} />