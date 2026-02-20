<script lang="ts">
	import type { ButtonGroupProps } from '../types/button.js'

	const {
		size = 'md',
		class: className = '',
		children
	}: ButtonGroupProps = $props()
</script>

<div
	data-button-group
	data-size={size}
	class={className || undefined}
	role="group"
>
	{@render children?.()}
</div>
