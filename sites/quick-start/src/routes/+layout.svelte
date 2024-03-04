<script>
	import 'uno.css'
	import '../app.css'
	import { ToggleThemeMode } from '@rokkit/ui'
	import { themable } from '@rokkit/actions'
</script>

<svelte:body use:themable />
<svelte:head>
	<title>Quick Start Template</title>
	<meta name="description" content="A quick start template for using rokkit" />
</svelte:head>
<header class="flex w-full justify-between px-8 py-2 border-b border-neutral-inset items-center">
	<h1 class="text-xl font-bold">Quick Start Template</h1>
	<ToggleThemeMode />
</header>
<slot />
