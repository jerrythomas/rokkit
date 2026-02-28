<script>
  import { Card } from '@rokkit/ui'
</script>

<Card>
  {#snippet header()}
    <h3>Card Title</h3>
  {/snippet}

  <p>Card body content.</p>

  {#snippet footer()}
    <button>Action</button>
  {/snippet}
</Card>
