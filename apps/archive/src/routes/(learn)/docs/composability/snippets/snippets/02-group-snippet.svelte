<List items={data} {fields} collapsible>
	{#snippet groupContent(proxy)}
		<h3 class="text-sm font-semibold tracking-wide uppercase">
			{proxy.label}
		</h3>
	{/snippet}
</List>
