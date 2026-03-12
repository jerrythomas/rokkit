<List items={users} {fields}>
	{#snippet itemContent(proxy)}
		<div class="flex items-center gap-3">
			<img src={proxy.get('avatar')} class="h-8 w-8 rounded-full" />
			<div>
				<p class="font-medium">{proxy.label}</p>
				<p class="text-surface-z5 text-xs">{proxy.get('role')}</p>
			</div>
		</div>
	{/snippet}
</List>
