<script>
	export let data
</script>

<section class="flex flex-col h-full w-full">
	<card
		class="flex flex-col gap-5 rounded-xl p-8 text-lg bg-skin-50 bg-opacity-40 shadow mx-4 my-auto md:mx-auto md:max-w-140 "
	>
		<p class="leading-7 text-justify font-light">
			Rokkit is a data-driven, configurable, and themeable UI library built for
			use with Svelte. With Rokkit, you can easily add professional-looking
			controls to your Svelte projects. Rokkit controls are designed to be
			easily themeable, so you can match the look and feel of your project with
			minimal effort.
		</p>
		<i class="italic text-sm">
			*Rokkit (v{data.version}) is currently under development and is not ready
			for production.
		</i>
	</card>
</section>
