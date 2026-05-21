<script lang="ts">
	interface RokkitWordmarkProps {
		/** Height in pixels — width auto-derives from the 501×158 aspect ratio (~3.17). */
		height?: number
		/** Accessible alt text */
		alt?: string
	}

	const { height = 20, alt = 'Rokkit' }: RokkitWordmarkProps = $props()
</script>

<!-- Render both variants; CSS hides the one not matching body[data-mode]. -->
<!-- Avoids prop-drilled mode reactivity that can desync across components. -->
<img
	src="/rokkit-light.svg"
	{alt}
	{height}
	class="rokkit-wordmark"
	data-variant="light"
	style:height={`${height}px`}
/>
<img
	src="/rokkit-dark.svg"
	{alt}
	{height}
	class="rokkit-wordmark"
	data-variant="dark"
	style:height={`${height}px`}
	aria-hidden="true"
/>

<style>
	.rokkit-wordmark {
		width: auto;
	}
	.rokkit-wordmark[data-variant='light'] {
		display: block;
	}
	.rokkit-wordmark[data-variant='dark'] {
		display: none;
	}
	:global(body[data-mode='dark']) .rokkit-wordmark[data-variant='light'] {
		display: none;
	}
	:global(body[data-mode='dark']) .rokkit-wordmark[data-variant='dark'] {
		display: block;
	}
</style>
