<script>
	import { StoryViewer } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Introduction</h1>
	<p>
		<b>Rokkit</b> is a modular, data-driven ecosystem for Svelte, empowering you to build modern, accessible,
		and beautiful applications with speed and flexibility.
	</p>

	<h2>The Rokkit Ecosystem</h2>
	<p>
		Rokkit is more than just a UI library—it's a complete ecosystem for Svelte development,
		consisting of several focused packages:
	</p>
	<ul>
		<li>
			<b>@rokkit/ui:</b> Headless, data-driven UI components for lists, forms, tabs, overlays, and more.
		</li>
		<li>
			<b>@rokkit/actions:</b> Svelte actions for behaviors, accessibility, and effects.
		</li>
		<li>
			<b>@rokkit/states:</b> State management and proxy utilities for reactive data flows.
		</li>
		<li>
			<b>@rokkit/themes:</b> Utility-first and semantic theming, with built-in and custom theme support.
		</li>
		<li>
			<b>@rokkit/data:</b> Data manipulation and transformation utilities.
		</li>
		<li>
			<b>@rokkit/forms:</b> Form generation, validation, and enhanced input components.
		</li>
		<li>
			<b>@rokkit/icons:</b> Icon system powered by Iconify.
		</li>
		<li>
			<b>@rokkit/cli:</b> Command-line tools for scaffolding and automation.
		</li>
	</ul>

	<h2>Why Rokkit?</h2>
	<p>
		Rokkit is designed for developers who want to focus on building features, not fighting with
		component APIs or wrestling data into the right shape. With Rokkit, your data drives the
		UI—components adapt to your data structures, not the other way around.
	</p>
	<ul>
		<li>
			<b>Data-First:</b> Components automatically map to your data, eliminating boilerplate and enabling
			rapid prototyping.
		</li>
		<li>
			<b>Composable & Extensible:</b> Every component is built for extension and composition, so you
			can override, customize, and compose as needed.
		</li>
		<li>
			<b>Unstyled by Default:</b> Rokkit ships with zero styling assumptions. Use your own styles, or
			start with one of the included themes and extend as you wish.
		</li>
		<li>
			<b>Accessible:</b> Accessibility is built in from the start—ARIA roles, keyboard navigation, and
			focus management are handled for you.
		</li>
		<li>
			<b>Developer Experience:</b> Stable, predictable APIs, full TypeScript coverage, and comprehensive
			documentation help you move fast and stay productive.
		</li>
	</ul>

	<h3>Bring Your Own Styles</h3>
	<p>
		Most Rokkit components are completely unstyled, giving you full control over your application's
		look and feel. Use <code>class</code> props or semantic <code>data-*</code>
		attributes for styling hooks. Rokkit includes a few built-in style packs (like <b>rokkit</b>,
		<b>material</b>, and <b>minimal</b>), but you can enhance or replace them as you see fit.
	</p>

	<h3>Driven by Data</h3>
	<p>
		Unlike traditional UI libraries, Rokkit is built around the principle that <b
			>data should drive the interface</b
		>. Components adapt to your data structures using a flexible field mapping system, so you spend
		less time transforming data and more time building features.
	</p>
	<ul>
		<li>No more writing adapters or mappers for every API response.</li>
		<li>
			Consistent prop patterns across all components: <code>items</code>, <code>value</code>,
			<code>fields</code>, and more.
		</li>
		<li>Composable snippets and overrides for custom rendering.</li>
	</ul>

	<h3>Building for Developer Experience</h3>
	<p>
		Rokkit is designed to let you focus on what matters—your application's functionality. You don't
		need to learn a new design system or force your data into rigid component contracts. Instead,
		Rokkit's intuitive patterns and unstyled-by-default approach let you build apps quickly, with
		minimal friction and maximum flexibility.
	</p>
	<ul>
		<li>Rapid prototyping with minimal boilerplate.</li>
		<li>Easy to learn, easy to extend.</li>
		<li>Comprehensive documentation and real-world examples.</li>
		<li>Unopinionated about styling—bring your own, or use a starter theme.</li>
	</ul>

	<h3>Production-Ready Accessibility</h3>
	<p>
		Accessibility is not an afterthought in Rokkit. All interactive components are WAI-ARIA
		compliant, support keyboard navigation, and include focus management and screen reader support
		out of the box.
	</p>

	<section>
		<h2>Try Rokkit Now</h2>
		<p>
			Here's a simple example of a Rokkit List component. Click on any item to see how data-driven
			components work:
		</p>
		<StoryViewer {...storyBuilder.getExample('example')} />
	</section>

	<section>
		<h2>Get Started</h2>
		<p>
			Ready to build your next Svelte app with Rokkit? Check out the <a
				href="/welcome/getting-started"
				class="button is-primary">Getting Started Guide <span class="ml-2">→</span></a
			>
		</p>
	</section>

	<section>
		<h2>Acknowledgements</h2>
		<ul>
			<li>
				<b>Bits UI</b> — Inspired the data-attribute pattern and composable architecture. Rokkit uses
				Bits UI under the hood for some components.
			</li>
			<li>
				<b>UnoCSS</b> — For utility-first styling and theme support.
			</li>
			<li>
				<b>Iconify</b> — For the icon system.
			</li>
		</ul>
	</section>

	<section>
		<p>
			For licensing and language model usage, see <a
				href="/welcome/introduction/llms.txt"
				target="_blank"
				rel="noopener">llms.txt</a
			>.
		</p>
	</section>
</article>
