const fields = {
  text: 'name',
  children: 'values',
  component: 'type'
}

<Accordion items={data} {fields}>
  {#snippet featured(node)}
    <FeaturedItem value={node.value} />
  {/snippet}
  {#snippet simple(node)}
    <SimpleItem value={node.value} />
  {/snippet}
</Accordion>