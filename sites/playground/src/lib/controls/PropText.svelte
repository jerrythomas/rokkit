<script lang="ts">
	let {
		label,
		value = $bindable(),
		placeholder = ''
	}: {
		label: string
		value: string
		placeholder?: string
	} = $props()
</script>

<div class="prop">
	<label>{label}</label>
	<input type="text" bind:value {placeholder} />
</div>

<style>
	.prop {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	label {
		font-size: 0.75rem;
		font-weight: 500;
		color: rgb(var(--color-surface-600));
	}

	input {
		padding: 0.25rem 0.375rem;
		border: 1px solid rgb(var(--color-surface-300));
		border-radius: 0.25rem;
		font-size: 0.8125rem;
		background: rgb(var(--color-surface-50));
	}
</style>
