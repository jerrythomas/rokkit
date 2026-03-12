<article data-article-root>
	<p>
		Rokkit's toolchain covers everything outside the component library itself: the CLI for
		scaffolding and upgrading projects, curated icon sets with tree-shaking, and a custom primitive
		guide for building new components on top of Rokkit's controller and navigator patterns.
	</p>

	<h2>CLI</h2>
	<p>
		The Rokkit CLI (<code>npx rokkit</code>) automates common project tasks — adding Rokkit to a new
		project, upgrading between versions, generating custom skin scaffolds, and creating new
		component themes. See <a href="/docs/toolchain/cli">CLI reference</a> for full usage.
	</p>

	<h2>Icon Sets</h2>
	<p>
		Rokkit ships curated icon sets (navigation, status, action, object) that are fully tree-shaken —
		only imported icons enter your bundle. You can also register a global icon override snippet to
		replace all component icons with any icon system at once. See
		<a href="/docs/toolchain/icon-sets">Icon sets</a> for details.
	</p>
</article>
