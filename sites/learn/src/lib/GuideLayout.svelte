<script>
	let active = 'notes'
</script>

<page
	class="grid w-full h-full"
	class:mini={true}
	class:medium={false}
	class:large={false}
>
	<aside class:active={active == 'notes'}>aside</aside>
	<section class:active={active == 'section'}>section</section>
	<files class:active={active == 'files'}> files</files>
	<footer class="flex flex-row">
		<button on:click={() => (active = 'notes')}>notes</button>
		<button on:click={() => (active = 'section')}>preview</button>
		<button on:click={() => (active = 'files')}>source</button>
	</footer>
</page>

<style>
	.mini {
		grid-template-rows: auto 2rem;
		grid-template-columns: 1fr;
		grid-template-areas:
			'a'
			'f';
	}
	.mini > footer {
		grid-area: f;
	}
	.mini > *:not(footer):not(.active) {
		display: none;
	}
	.mini > .active {
		grid-area: a;
	}
	.medium {
		grid-template-columns: 12rem auto;
		grid-template-rows: 1fr 1fr;
		grid-template-areas:
			'a b'
			'a c';
	}
	.large {
		grid-template-columns: 12rem 12rem auto;
		grid-template-rows: auto;
		grid-template-areas: 'a b c';
	}
	:not(.mini) footer {
		display: none;
	}
	:not(.mini) aside {
		grid-area: a;
	}
	:not(.mini) section {
		grid-area: b;
	}
	:not(.mini) files {
		grid-area: c;
	}
</style>
