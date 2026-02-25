<script>
  import ContentNavigator from './ContentNavigator.svelte'
  import { Tabs } from '@rokkit/ui'
  
  let items = ['Home', 'About', 'Contact']
  let value = 'Home'
</script>

<ContentNavigator>
  <Tabs {items} bind:value slot="nav" />
  <div slot="content" class="p-4">
    Content for {value}
  </div>
</ContentNavigator>