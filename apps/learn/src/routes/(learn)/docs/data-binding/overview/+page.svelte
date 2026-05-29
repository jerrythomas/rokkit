<article data-article-root>
	<p>
		Rokkit is built around one principle: your data should drive your UI, not the other way around.
		Every selection component — <code>List</code>, <code>Select</code>, <code>Tree</code> — works with
		your data as-is via field mapping, not by forcing you to reshape it.
	</p>
	<h2>The Problem</h2>
	<p>
		Most component libraries require your data to match a specific shape. A <code>Select</code>
		needs <code>&#123; label, value &#125;</code>, a <code>Tree</code> needs
		<code>&#123; name, children &#125;</code>. Every component has its own convention, so you write
		adapters everywhere.
	</p>
	<h2>The Rokkit Approach</h2>
	<p>
		Instead, every Rokkit component accepts a <code>fields</code> prop that maps your keys to the
		component's semantic fields. Your <code>&#123; name, id, nested &#125;</code> data works directly
		— no transformation, no adapter layer.
	</p>
	<p>See <a href="/docs/data-binding/field-mapping">Field Mapping</a> for full reference.</p>
</article>
