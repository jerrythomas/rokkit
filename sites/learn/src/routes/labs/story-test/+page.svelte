<script>
	import { StoryRoot, StoryCode, StoryComponent, StoryError, StoryLoading } from '$lib/components/Story'
	import { Button } from '@rokkit/ui'
	import AppContent from '../../(learn)/tutorial/multi-file-demo/src/App.svelte?raw'
	import CounterContent from '../../(learn)/tutorial/multi-file-demo/src/counter.js?raw'
	import StylesContent from '../../(learn)/tutorial/multi-file-demo/src/styles.css?raw'

	// Test files for multi-file story
	let testFiles = [
		{
			id: 'app',
			name: 'App.svelte',
			language: 'svelte',
			content: AppContent
		},
		{
			id: 'counter',
			name: 'counter.js',
			language: 'javascript',
			content: CounterContent
		},
		{
			id: 'styles',
			name: 'styles.css',
			language: 'css',
			content: StylesContent
		}
	]

	// Test single file
	let singleFile = 'Simple counter component with button and state management'

	// Test component
	let TestComponent = Button

	function handleStoryToggle(event) {
		console.log('Story code toggled:', event.showCode)
	}

	function handleStoryCopy(event) {
		console.log('Story code copied:', event.code?.length || event.content?.length, 'characters')
	}
</script>

<svelte:head>
	<title>Story System Test | Learn Rokkit</title>
	<meta name="description" content="Testing the new Story system with multi-file support" />
</svelte:head>

<div class="container mx-auto space-y-12 px-4 py-8">
	<header>
		<h1 class="text-neutral-overlay mb-2 text-3xl font-bold">Story System Test</h1>
		<p class="text-neutral-floating">
			Testing the new modular Story system with multi-file support, ?raw imports, and FileTabs integration.
		</p>
	</header>

	<!-- Test 1: StoryRoot with auto-loading -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">1. StoryRoot (Auto-loading)</h2>
		<p class="text-neutral-floating">
			Tests the complete StoryRoot component that loads stories from slugs automatically.
		</p>

		<StoryRoot
			slug="introduction"
			title="Introduction Story"
			description="Auto-loaded story from slug with component and code"
			ontoggle={handleStoryToggle}
			oncopy={handleStoryCopy}
		/>
	</section>

	<!-- Test 2: Multi-file StoryCode -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">2. Multi-file StoryCode</h2>
		<p class="text-neutral-floating">
			Tests the StoryCode component with multiple files using FileTabs.
		</p>

		<StoryCode files={testFiles} oncopy={handleStoryCopy} />
	</section>

	<!-- Test 3: Single file StoryCode -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">3. Single File StoryCode</h2>
		<p class="text-neutral-floating">
			Tests the StoryCode component with a single file (should show no tabs).
		</p>

		<StoryCode code={singleFile} filename="SimpleCounter.svelte" oncopy={handleStoryCopy} />
	</section>

	<!-- Test 4: StoryComponent -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">4. StoryComponent</h2>
		<p class="text-neutral-floating">
			Tests the StoryComponent that renders interactive components.
		</p>

		<div class="border-neutral-subtle bg-neutral-base rounded-lg border">
			<StoryComponent component={TestComponent} />
		</div>
	</section>

	<!-- Test 5: StoryLoading -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">5. StoryLoading</h2>
		<p class="text-neutral-floating">
			Tests the loading state component.
		</p>

		<StoryLoading message="Loading awesome story..." />
	</section>

	<!-- Test 6: StoryError -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">6. StoryError</h2>
		<p class="text-neutral-floating">
			Tests the error state component.
		</p>

		<StoryError error="This is a test error message to demonstrate error handling." />
	</section>

	<!-- Test 7: Raw Import Verification -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">7. Raw Import Verification</h2>
		<p class="text-neutral-floating">
			Verifies that ?raw imports are working correctly.
		</p>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4">
				<h4 class="mb-2 font-semibold">App.svelte</h4>
				<div class="text-neutral-floating text-sm space-y-1">
					<div>Status: {AppContent ? '✅ Loaded' : '❌ Failed'}</div>
					<div>Length: {AppContent.length} chars</div>
					<div>Lines: {AppContent.split('\n').length}</div>
				</div>
			</div>
			<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4">
				<h4 class="mb-2 font-semibold">counter.js</h4>
				<div class="text-neutral-floating text-sm space-y-1">
					<div>Status: {CounterContent ? '✅ Loaded' : '❌ Failed'}</div>
					<div>Length: {CounterContent.length} chars</div>
					<div>Lines: {CounterContent.split('\n').length}</div>
				</div>
			</div>
			<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4">
				<h4 class="mb-2 font-semibold">styles.css</h4>
				<div class="text-neutral-floating text-sm space-y-1">
					<div>Status: {StylesContent ? '✅ Loaded' : '❌ Failed'}</div>
					<div>Length: {StylesContent.length} chars</div>
					<div>Lines: {StylesContent.split('\n').length}</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Test 8: Manual StoryCode with copy button -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">8. Copy Button Test</h2>
		<p class="text-neutral-floating">
			Tests the inline copy button functionality.
		</p>

		<div class="flex items-center gap-4 p-4 border border-neutral-subtle rounded-lg bg-neutral-base">
			<span class="text-neutral-floating">Quick copy test:</span>
			<StoryCode code={singleFile} showCopyButton oncopy={handleStoryCopy} />
		</div>
	</section>

	<!-- Usage Examples -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">Usage Examples</h2>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4">
				<h3 class="mb-3 font-semibold">Complete Story</h3>
				<pre class="text-neutral-floating overflow-x-auto text-sm"><code>&lt;StoryRoot
	slug="introduction"
	title="My Story"
	description="Story description"
	ontoggle=&#123;handleToggle&#125;
	oncopy=&#123;handleCopy&#125;
/&gt;</code></pre>
			</div>

			<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4">
				<h3 class="mb-3 font-semibold">Multi-file Code</h3>
				<pre class="text-neutral-floating overflow-x-auto text-sm"><code>&lt;StoryCode
	files=&#123;[
		&#123;
			id: 'app',
			name: 'App.svelte',
			language: 'svelte',
			content: AppContent
		&#125;
	]&#125;
	oncopy=&#123;handleCopy&#125;
/&gt;</code></pre>
			</div>

			<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4">
				<h3 class="mb-3 font-semibold">Single File</h3>
				<pre class="text-neutral-floating overflow-x-auto text-sm"><code>&lt;StoryCode
	code=&#123;sourceCode&#125;
	filename="Example.svelte"
	language="svelte"
	oncopy=&#123;handleCopy&#125;
/&gt;</code></pre>
			</div>

			<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4">
				<h3 class="mb-3 font-semibold">Component Display</h3>
				<pre class="text-neutral-floating overflow-x-auto text-sm"><code>&lt;StoryComponent
	component=&#123;MyComponent&#125;
/&gt;</code></pre>
			</div>
		</div>
	</section>

	<!-- Test Results Summary -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">Test Results Summary</h2>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4">
				<h3 class="mb-3 font-semibold text-green-600">✅ Working Features</h3>
				<ul class="text-neutral-floating space-y-1 text-sm">
					<li>• ?raw imports for file content</li>
					<li>• Multi-file tabs with FileTabs</li>
					<li>• Single file display</li>
					<li>• Syntax highlighting</li>
					<li>• Copy functionality</li>
					<li>• File icons and metadata</li>
					<li>• Error and loading states</li>
					<li>• Semantic color shortcuts</li>
				</ul>
			</div>
			<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4">
				<h3 class="mb-3 font-semibold text-blue-600">🚀 Next Steps</h3>
				<ul class="text-neutral-floating space-y-1 text-sm">
					<li>• Auto-detection of multiple files</li>
					<li>• File tree support</li>
					<li>• Search within files</li>
					<li>• Line number display</li>
					<li>• Diff view support</li>
					<li>• Export functionality</li>
					<li>• Custom themes</li>
					<li>• Performance optimizations</li>
				</ul>
			</div>
		</div>
	</section>
</div>
