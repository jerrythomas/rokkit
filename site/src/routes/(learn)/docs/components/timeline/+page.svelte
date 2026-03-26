<script>
	// @ts-nocheck
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { Code } from '@rokkit/ui'
</script>

<article data-article-root>
	<p>
		Timeline displays view-only vertical steps for instructions, changelogs, or process
		visualization. Items can have <code>completed</code> and <code>active</code> boolean fields to
		indicate progress, and a <code>content</code> snippet for custom rich content per step.
	</p>

	<h2>Quick Start</h2>
	<Code
		lang="svelte"
		code={`<script>
  import { Timeline } from '@rokkit/ui'

  const steps = [
    { label: 'Requirements', description: 'Gather project requirements.', completed: true },
    { label: 'Design', description: 'Create wireframes.', completed: true },
    { label: 'Development', description: 'Build the features.', active: true },
    { label: 'Testing', description: 'Run QA tests.' },
    { label: 'Deployment', description: 'Deploy to production.' }
  ]
</script>

<Timeline items={steps} />`}
	/>
</article>
