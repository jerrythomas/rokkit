<script>
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let name
	export let state = null
	export let size = 'base'
	export let role = 'img'
	export let label = name
	export let disabled = false
	export let tabindex = 0
	export let checked = null

	function handleClick(e) {
		if (disabled) {
			e.preventDefault()
			e.stopPropagation()
		}
		if (role === 'checkbox' || role === 'option') {
			checked = !checked
			dispatch('change', { detail: checked })
		}
		dispatch('click')
	}

	$: tabindex = role === 'img' || disabled ? -1 : tabindex
	$: small = size === 'small' || className.includes('small')
	$: medium = size === 'medium' || className.includes('medium')
	$: large = size === 'large' || className.includes('large')
	$: checked = ['checkbox', 'option'].includes(role) ? (checked !== null ? checked : false) : null
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<icon
	class="flex flex-shrink-0 items-center justify-center {className}"
	class:small
	class:medium
	class:large
	class:disabled
	{role}
	aria-label={label}
	aria-checked={checked}
	on:mouseenter
	on:mouseleave
	on:focus
	on:blur
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && e.currentTarget.click()}
	data-state={state}
	{tabindex}
>
	<i class={name} aria-hidden="true" />
</icon>
