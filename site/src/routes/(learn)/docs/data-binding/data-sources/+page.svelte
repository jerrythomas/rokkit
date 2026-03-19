<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import staticArray from './snippets/00-static.js?raw'
	import reactiveState from './snippets/01-reactive.js?raw'
	import asyncData from './snippets/02-async.svelte?raw'
	import derivedData from './snippets/03-derived.js?raw'
</script>

<article data-article-root>
	<p>
		Rokkit components accept any JavaScript array as <code>items</code>. Because Svelte 5 tracks
		reactivity through <code>$state</code>, passing a reactive array is all that's needed — the
		component re-renders automatically when the array changes.
	</p>

	<h2>Static arrays</h2>
	<p>Plain arrays work without any wrapping:</p>
	<Code content={staticArray} language="javascript" />

	<h2>Reactive state</h2>
	<p>
		Wrap the array in <code>$state</code> and mutations are tracked automatically. Add, remove, or reorder
		items and every bound component updates:
	</p>
	<Code content={reactiveState} language="javascript" />

	<h2>Async data</h2>
	<p>
		Fetch data into a <code>$state</code> variable. While loading, pass an empty array; replace it when
		the promise resolves:
	</p>
	<Code content={asyncData} language="svelte" />

	<h2>Derived data</h2>
	<p>
		Use <code>$derived</code> to filter or transform before passing to a component. The component re-renders
		only when the derived value changes:
	</p>
	<Code content={derivedData} language="javascript" />

	<p>
		For form-driven lookups (dependent dropdowns, remote search), see the
		<a href="/docs/forms">Forms</a> section which provides a dedicated lookup system with caching and
		dependency tracking.
	</p>
</article>
