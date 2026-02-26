<script>
// @ts-nocheck
</script>
<List {items} {fields}>
  {#snippet stub(node)}
    <Odd value={node.value} />
  {/snippet}
  {#snippet even(node)}
    <Even value={node.value} />
  {/snippet}
</List>