<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import ApiDocsLink from '$lib/components/ApiDocsLink.svelte'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<ApiDocsLink component="stepper" />
	<h1>Introduction</h1>
	<p>
		A stepper progress control is a user interface element that visually represents a user's
		progress through a sequence of steps in a process. It can be used in scenarios like
		registration, onboarding, or multi-step forms, making it easy for users to track their progress
		and navigate between steps.
	</p>

	<h1>Notable features:</h1>
	<ul>
		<li>Visual progress indication through multiple steps</li>
		<li>Step validation and completion tracking</li>
		<li>Navigation between completed and current steps</li>
		<li>Customizable step content and styling</li>
		<li>Support for complex multi-step workflows</li>
		<li>Integration with form validation systems</li>
	</ul>

	<h1>Basic Example</h1>
	<p>
		Here's an example showing how the stepper component can be used for a multi-step form process:
	</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />
	<h1>Properties</h1>
	<p>The Stepper component provides comprehensive properties for managing multi-step processes.</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Core Properties</h1>
			<ul>
				<li><strong>data</strong>: Array of step configurations</li>
				<li><strong>value</strong>: Current active step (bindable)</li>
				<li><strong>class</strong>: Custom CSS classes for styling</li>
			</ul>
		</div>

		<div data-card>
			<h1>Step Configuration</h1>
			<ul>
				<li><strong>title</strong>: Display name for the step</li>
				<li><strong>completed</strong>: Whether the step is completed</li>
				<li><strong>disabled</strong>: Whether the step can be accessed</li>
				<li><strong>content</strong>: Step-specific content or components</li>
			</ul>
		</div>
	</div>

	<p>Basic stepper configuration:</p>
	<Code {...storyBuilder.getFragment(0)} />
	<h1>Interactive Stepper</h1>
	<p>
		The Stepper component supports interactive navigation and dynamic content updates based on user
		progress.
	</p>

	<StoryViewer {...storyBuilder.getExample('play')} />

	<h1>Step Management</h1>
	<p>
		You can programmatically control step progression, validation, and completion states to create
		sophisticated multi-step workflows.
	</p>
	<h1>Use Cases</h1>
	<p>
		The Stepper component is perfect for guiding users through complex processes with clear progress
		indicators.
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Form Workflows</h1>
			<ul>
				<li>Multi-page registration forms</li>
				<li>Order checkout processes</li>
				<li>Survey and questionnaire flows</li>
				<li>Account setup wizards</li>
			</ul>
		</div>

		<div data-card>
			<h1>Process Guidance</h1>
			<ul>
				<li>Onboarding tutorials</li>
				<li>Setup configuration guides</li>
				<li>Data import wizards</li>
				<li>Installation processes</li>
			</ul>
		</div>
	</div>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand how the Stepper works, explore other layout components or learn about
			form validation and data collection.
		</p>
		<span>
			<a href="/layout/nav-content" class="button is-primary">
				NavContent
				<span class="ml-2">→</span>
			</a>
			<a href="/forms/validation" class="button is-primary">
				Form Validation
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
