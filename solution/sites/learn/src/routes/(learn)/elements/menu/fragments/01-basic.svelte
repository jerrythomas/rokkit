<script>
  import { Menu } from '@rokkit/ui'

  let options = [
    { text: 'Copy', icon: 'i-lucide:copy' },
    { text: 'Paste', icon: 'i-lucide:clipboard' },
    { text: 'Delete', icon: 'i-lucide:trash' }
  ]
</script>

<Menu {options} label="Actions" onselect={(item) => console.log(item)} />
