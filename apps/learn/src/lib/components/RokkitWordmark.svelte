<script lang="ts">
	interface RokkitWordmarkProps {
		/** Height in pixels — width auto-derives from the 501×158 aspect ratio (~3.17). */
		height?: number
		/** Accessible alt text */
		alt?: string
	}

	const { height = 20, alt = 'Rokkit' }: RokkitWordmarkProps = $props()
</script>

<!-- The colorful wordmark (red lettering + orange icon) reads on both light and
     dark surfaces, so we use it in every mode — no white dark-mode variant. -->
<img
	src="/rokkit-light.svg"
	{alt}
	{height}
	class="rokkit-wordmark"
	style:height={`${height}px`}
/>

<style>
	.rokkit-wordmark {
		width: auto;
		display: block;
	}
</style>
