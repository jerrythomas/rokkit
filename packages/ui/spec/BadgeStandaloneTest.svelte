<script lang="ts">
	import Badge from '../src/components/Badge.svelte'

	const {
		count,
		max = 99,
		variant = 'default',
		dot = false,
		class: className = ''
	}: {
		count?: number
		max?: number
		variant?: string
		dot?: boolean
		class?: string
	} = $props()
</script>

<Badge {count} {max} {variant} {dot} class={className} />
