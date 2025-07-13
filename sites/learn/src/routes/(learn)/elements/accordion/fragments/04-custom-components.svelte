const using = { link: Link }

<Accordion items={data} {fields} {using}>
  {#snippet stub(node)}
    <Link href={node.get('url')}>{node.get('text')}</Link>
  {/snippet}
</Accordion>