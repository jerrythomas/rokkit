<script>
	/**
	 * @typedef {Object} Props
	 * @property {any} value
	 * @property {any} [name]
	 * @property {any} [label]
	 * @property {any} [type]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { value, name = null, label = null, type = null, ...rest } = $props()
	let extraProps = $derived(rest)
</script>

<h1>{type}:{label}</h1>
<p>{name}:{JSON.stringify(value)}</p>
<p>{JSON.stringify(Object.keys(extraProps))}</p>
