<script lang="ts">
	interface RokkitWordmarkProps {
		/** Height in pixels — width auto-derives from the 501×158 aspect ratio (~3.17). */
		height?: number
		/** Override the resolved mode. Defaults to reading `[data-mode]` on <body>. */
		mode?: 'light' | 'dark'
		/** Accessible alt text */
		alt?: string
	}

	const {
		height = 20,
		mode,
		alt = 'Rokkit'
	}: RokkitWordmarkProps = $props()

	const src = $derived(
		(mode ?? 'light') === 'dark' ? '/rokkit-dark.svg' : '/rokkit-light.svg'
	)
</script>

<img {src} {alt} {height} class="rokkit-wordmark" style:height={`${height}px`} />

<style>
	.rokkit-wordmark {
		display: block;
		width: auto;
	}
</style>
