<script>
	import { Tree } from '@rokkit/ui'
	import CodeSnippet from '$lib/CodeSnippet.svelte'
	import { getContext } from 'svelte'

	const story = getContext('tutorial')
	const media = getContext('media')

	let currentFile
	let code
	let language
	let fields = { text: 'name', icon: 'type' }

	let active = 'code'

	function handleSelect({ detail }) {
		currentFile = detail
		if (!$media.large) active = 'code'
	}

	// $: filesVisible = $media.large || active !== 'code'
	$: filesVisible = active !== 'code'
	$: hasFiles = $story.files && $story.files.length > 0
	$: if (hasFiles) currentFile = $story.files[0].children[0]
	$: if (currentFile && currentFile.content) {
		code = currentFile.content
		language = currentFile.type
	}
</script>

{#if hasFiles}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<source-files class="h-full flex flex-col border-t border-t-neutral-inset">
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<nav
			class="h-8 w-full flex cursor-pointer items-center bg-neutral-subtle px-4 text-sm"
			on:click={() => (active = active == 'code' ? 'files' : 'code')}
		>
			{[currentFile.path, currentFile.name].join('/')}
		</nav>
		<section class="relative h-full w-full flex flex-row-reverse overflow-auto">
			<aside
				class="h-full min-w-full flex flex-col border-r border-neutral-subtle lg:min-w-50"
				class:-translate-x-full={!filesVisible}
			>
				<Tree
					items={$story.files}
					{fields}
					value={currentFile}
					on:select={handleSelect}
					class="text-xs"
				/>
			</aside>
			{#if code}
				<CodeSnippet
					{code}
					{language}
					class="w-full h-full {filesVisible ? '' : 'absolute left-0'}"
				/>
			{/if}
		</section>
	</source-files>
{/if}
