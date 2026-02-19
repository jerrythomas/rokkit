<script lang="ts">
	let {
		label,
		value
	}: {
		label: string
		value: unknown
	} = $props()
</script>

<div class="prop">
	<span class="label">{label}</span>
	<span class="value">{value === undefined ? '—' : String(value)}</span>
</div>

<style>
	.prop {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.8125rem;
	}

	.label {
		color: rgb(var(--color-surface-600));
	}

	.value {
		font-weight: 500;
		color: rgb(var(--color-primary-600));
		font-family: monospace;
		font-size: 0.75rem;
	}
</style>
