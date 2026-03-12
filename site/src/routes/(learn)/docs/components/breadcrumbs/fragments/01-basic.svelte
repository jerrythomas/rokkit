<script>
  import { BreadCrumbs } from '@rokkit/ui'

  let items = [
    { label: 'Home', icon: 'i-lucide:home' },
    { label: 'Products' },
    { label: 'Current Page' }
  ]
</script>

<BreadCrumbs {items} onclick={(value) => console.log(value)} />
