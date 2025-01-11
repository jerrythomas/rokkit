<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} name
	 * @property {any} [label]
	 */

	/** @type {Props} */
	let { class: className = '', name = 'empty', label = name } = $props()
</script>

<rkt-icon class={className} aria-label={label} role="img">
	<i class={name} aria-hidden="true"></i>
</rkt-icon>
