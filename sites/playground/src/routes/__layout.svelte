<script>
	import 'virtual:windi.css'
	import '../palette.css'
	import '../app.css'
	// import {Sidebar } from '@sparsh-ui/base'

	import { browser } from '$app/env'
	// if (browser) import('virtual:windi-devtools');
</script>

<!-- <nav class="flex flex-col p-4 bg-skin-200 sm:w-48">
	<a href=".">Home</a>
	<a href="about">About</a>
	<a href="settings">Settings</a>
</nav> -->
<content class="p-8 flex flex-grow">
	<slot />
</content>
