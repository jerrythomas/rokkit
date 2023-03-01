<script>
	import Rocket from './Rocket.svelte'
	export let data
</script>

<section
	class="flex flex-col h-full w-full text-lg font-light py-4 overflow-auto"
>
	<Rocket />
	<segment class="grid grid-cols-2">
		<span class="prose">
			<h1>Build Beyond Limits</h1>
			<h2>Empowering Your UI with Rokkit</h2>
			<p>
				Building amazing, interactive applications has never been simpler thanks
				to an extensive collection of composable components and a variety of
				utility functions, stores, actions, and themes. So, buckle up and get
				ready to create some truly incredible user experiences with Rokkit!
			</p>
		</span>
		<span />
	</segment>
	<card
		class="flex flex-col gap-4 p-8 bg-skin-100 rounded-xl shadow-xl mx-4 md:mx-auto md:min-w-140 md:w-2/3 overflow-auto"
	>
		<img src="/rokkit-light.svg" alt="Rokkit Logo" class="h-12" />
		<article class="flex flex-col gap-4 overflow-y-scroll">
			<p>
				Get ready to blast off into the world of modern UI design with Rokkit!
				This cutting-edge, lightweight library is the ultimate tool for building
				stunning Svelte user interfaces that are both data-driven and fully
				customizable. With an impressive set of composable components and an
				array of incredible utility functions, stores, actions and themes,
				building amazing applications has never been easier. So, buckle up and
				get ready to create some truly incredible user experiences with Rokkit!
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
