<article data-article-root>
	<h1>Toolchain</h1>
	<p>
		Rokkit's toolchain covers everything outside the component library itself: the CLI for
		scaffolding projects, curated icon sets, and a guide for building new components on top of
		Rokkit's controller and navigator patterns.
	</p>

	<h2>Overview</h2>
	<p>
		Rokkit's toolchain consists of <code>@rokkit/themes</code> (UnoCSS preset and theme CSS),
		<code>@rokkit/ui</code> (component library), and <code>@rokkit/app</code> (theme switching,
		density control, the <code>vibe</code> store). All packages are ESM-only and work with
		Vite-based toolchains. See <a href="/docs/toolchain/overview">Overview</a> for full details.
	</p>

	<h2>CLI</h2>
	<p>
		The Rokkit CLI automates project setup — adding Rokkit to a new project, verifying your
		configuration, and managing icon collections. See <a href="/docs/toolchain/cli">CLI reference</a>
		for all commands.
	</p>

	<h2>Icon Sets</h2>
	<p>
		Rokkit ships curated icon sets (auth, app, component, ui) in Iconify JSON format with
		tree-shaking via UnoCSS. See <a href="/docs/toolchain/icon-sets">Icon Sets</a> for available
		collections and configuration.
	</p>
</article>
