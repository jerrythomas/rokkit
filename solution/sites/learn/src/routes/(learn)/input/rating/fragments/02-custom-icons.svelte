<script>
  import { Rating } from '@rokkit/ui'
  
  let value = 2
  const stateIcons = {
    filled: 'i-rokkit:heart-filled',
    empty: 'i-rokkit:heart-outlined'
  }
</script>

<Rating 
  bind:value 
  {stateIcons} 
  max={5} 
  id="heart-rating" 
  name="heart-rating" 
/>