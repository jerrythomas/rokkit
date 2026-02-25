<script>
	import { setLocale } from '$lib/paraglide/runtime'
	import * as m from '$lib/paraglide/messages.js'
</script>

<h1>{m.hello_world({ name: 'SvelteKit User' })}</h1>
<div>
	<button onclick={() => setLocale('en')}>en</button>
	<button onclick={() => setLocale('hi')}>hi</button>
	<button onclick={() => setLocale('fr')}>fr</button>
</div>
