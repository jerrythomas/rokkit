<script>
	import 'virtual:windi.css'
	import '../palette.css'
	import '../app.css'
	import { menu } from '$config'
	import { Sidebar } from '@rokkit/base'
	import { page } from '$app/stores'

	// import { browser } from '$app/env'
	// if (browser) import('virtual:windi-devtools');
</script>

<Sidebar items={menu()} activePage={$page.url.pathname} />

<content class="flex flex-grow">
	<slot />
</content>
