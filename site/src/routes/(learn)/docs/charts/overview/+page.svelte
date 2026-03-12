<article data-article-root>
	<p>
		Rokkit charts are SVG-based components that integrate directly with the theme system. Series
		colors come from the active skin's palette. All charts respond to light/dark mode and density
		changes via CSS custom properties — no JavaScript required.
	</p>
	<h2>Architecture</h2>
	<p>
		Charts are built on a brewing pipeline: raw data → scaled axes → rendered SVG elements. Each
		chart type exposes a consistent API: <code>data</code>, <code>x</code> and <code>y</code>
		field accessors, optional <code>color</code> and <code>label</code> fields, and animation props.
	</p>
	<h2>Theme integration</h2>
	<p>
		Charts read <code>--color-series-*</code> custom properties from the active theme. Switching skin
		or mode instantly repaints all chart series — no re-render needed.
	</p>
</article>
