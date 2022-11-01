<script>
	import { IconButton } from '@svelte-spice/form'

	/** @type {string} */
	export let provider
	/** @type {string} */
	export let label = 'Continue with ' + name
	/** @type {Array<string>} */
	export let scopes = []
	/** @type {Array<string>} */
	export let params = []
</script>

<input type="hidden" name="provider" value={provider} />
<input type="hidden" name="scopes" value={scopes} />
<input type="hidden" name="params" value={params} />
<IconButton type="submit" icon={provider} {label} leftIcon="logo-{provider}" />
