<script>
	export let parallax = false
</script>

<svg
	class="absolute bottom-0 left-0 right-0 w-full h-1/5  text-skin-50"
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	viewBox="0 24 150 28"
	preserveAspectRatio="none"
	shape-rendering="auto"
>
	<defs>
		<path
			id="gentle-wave"
			d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
		/>
	</defs>
	<g class:parallax>
		<use
			xlink:href="#gentle-wave"
			x={parallax ? 48 : 10}
			y="0"
			class="fill-current opacity-30"
		/>
		<use
			xlink:href="#gentle-wave"
			x={parallax ? 48 : 20}
			y="3"
			class="fill-current opacity-30"
		/>
		<use
			xlink:href="#gentle-wave"
			x={parallax ? 48 : 30}
			y="5"
			class="fill-current opacity-30"
		/>
		<use
			xlink:href="#gentle-wave"
			x={parallax ? 48 : 40}
			y="7"
			class="fill-current"
		/>
	</g>
</svg>

<style>
	/* Animation */
	.parallax > use {
		animation: move-forever 100s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
	}
	.parallax > use:nth-child(1) {
		animation-delay: -2s;
		animation-duration: 7s;
	}
	.parallax > use:nth-child(2) {
		animation-delay: -3s;
		animation-duration: 10s;
	}
	.parallax > use:nth-child(3) {
		animation-delay: -4s;
		animation-duration: 13s;
	}
	.parallax > use:nth-child(4) {
		animation-delay: -5s;
		animation-duration: 20s;
	}
	@keyframes move-forever {
		0% {
			transform: translate3d(-90px, 0, 0);
		}
		100% {
			transform: translate3d(85px, 0, 0);
		}
	}
</style>
