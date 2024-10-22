<script>
	import { run, createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} name
	 * @property {any} [state]
	 * @property {string} [size]
	 * @property {string} [role]
	 * @property {any} [label]
	 * @property {boolean} [disabled]
	 * @property {number} [tabindex]
	 * @property {any} [checked]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		name,
		state = null,
		size = 'base',
		role = 'img',
		label = name,
		disabled = false,
		tabindex = $bindable(0),
		checked = $bindable(null)
	} = $props();

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

	run(() => {
		tabindex = role === 'img' || disabled ? -1 : tabindex
	});
	let small = $derived(size === 'small' || className.includes('small'))
	let medium = $derived(size === 'medium' || className.includes('medium'))
	let large = $derived(size === 'large' || className.includes('large'))
	run(() => {
		checked = ['checkbox', 'option'].includes(role) ? (checked !== null ? checked : false) : null
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<icon
	class="flex flex-shrink-0 items-center justify-center {className}"
	class:small
	class:medium
	class:large
	class:disabled
	{role}
	aria-label={label}
	aria-checked={checked}
	onmouseenter={bubble('mouseenter')}
	onmouseleave={bubble('mouseleave')}
	onfocus={bubble('focus')}
	onblur={bubble('blur')}
	onclick={handleClick}
	onkeydown={(e) => e.key === 'Enter' && e.currentTarget.click()}
	data-state={state}
	{tabindex}
>
	<i class={name} aria-hidden="true"></i>
</icon>
