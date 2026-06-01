<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import customComponent from './snippets/00-custom.svelte?raw'
</script>

<article data-article-root>
	<p>
		You can build your own accessible components by reusing the same controllers and navigator
		action that Rokkit uses internally. The pattern is:
	</p>
	<ol>
		<li>Create a controller instance (e.g., <code>new ListController()</code>)</li>
		<li>Call <code>setItems(items, fields)</code> to load your data</li>
		<li>
			Attach the <code>navigator</code> action to your container with the controller and an
			<code>onselect</code> callback
		</li>
		<li>
			Add <code>data-path</code> attributes to item elements — the navigator identifies items by this
			attribute
		</li>
	</ol>
	<Code content={customComponent} language="svelte" />
	<p>
		This gives you keyboard navigation, type-ahead search, and ARIA management with no additional
		code. Add your own CSS and markup on top. Controllers are exported from
		<code>@rokkit/states</code> and the navigator from <code>@rokkit/actions</code>.
	</p>
</article>
