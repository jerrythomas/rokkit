<script>
	export let data
</script>

<section
	class="flex flex-col h-full w-full text-lg font-light py-4 overflow-auto"
>
	<card
		class="flex flex-col gap-4 p-8 bg-skin-100 rounded-xl shadow-xl mx-4 md:mx-auto md:min-w-140 md:w-2/3 overflow-auto"
	>
		<img src="/rokkit-light.svg" alt="Rokkit Logo" class="h-12" />
		<article class="flex flex-col gap-4 overflow-y-scroll">
			<p>
				Rokkit is a modern, lightweight UI library for building Svelte user
				interfaces. It includes reusable and data-driven components, making it a
				versatile and adaptable choice for all projects.
			</p>
			<p>
				It includes UI components, utility functions, stores and actions. These
				components are highly customizable, with a range of options and
				configurations available to meet the needs of any project.
			</p>
			<p>
				Rokkit offers data-driven components that dynamically render in response
				to data input. These components adapt to the user's existing data
				structures. As a result, creating responsive, dynamic user interfaces
				that can alter and update in real time is simple.
			</p>
			<p>
				It is simpler to add interactivity to bespoke components using Rokkit's
				built-in actions for managing interactions, like swipe gestures,
				keyboard navigation, and drag/drop.
			</p>
			<p>
				The library is also easy to learn and use, with a simple and consistent
				approach across all components.
			</p>
			<i>
				*Rokkit (v{data.version}) is still in the development phase and is not
				feature-complete yet.
			</i>
		</article>
	</card>
</section>
