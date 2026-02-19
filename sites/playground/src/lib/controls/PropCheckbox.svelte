<script lang="ts">
	let {
		label,
		checked = $bindable()
	}: {
		label: string
		checked: boolean
	} = $props()
</script>

<label class="prop">
	<input type="checkbox" bind:checked />
	<span>{label}</span>
</label>

<style>
	.prop {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: rgb(var(--color-surface-700));
		cursor: pointer;
	}

	input {
		accent-color: rgb(var(--color-primary-500));
	}
</style>
