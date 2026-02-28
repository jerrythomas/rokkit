<script>
  import { BreadCrumbs } from '@rokkit/ui'

  let items = [
    { text: 'Home', icon: 'i-lucide:home' },
    { text: 'Products' },
    { text: 'Current Page' }
  ]
</script>

<BreadCrumbs {items} onclick={(value) => console.log(value)} />
