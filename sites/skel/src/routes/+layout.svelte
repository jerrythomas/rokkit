<script>
	import 'uno.css';
	import '../app.css';
	let theme = 'rokkit';
</script>

<svelte:body data-theme={theme} />
<aside>some sidebar content</aside>
<main><slot /></main>
