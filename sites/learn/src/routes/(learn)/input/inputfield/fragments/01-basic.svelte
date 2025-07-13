<script>
  import { InputField } from '@rokkit/ui'
  
  let value = ''
</script>

<InputField 
  bind:value 
  label="Full Name" 
  name="fullname"
  description="Enter your complete name"
  required
/>