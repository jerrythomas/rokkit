<script>
	import { Tree } from '@rokkit/core'
	import { CodeSnippet } from '@rokkit/markdown'
	import { getContext } from 'svelte'

	const story = getContext('tutorial')
	const media = getContext('media')

	let currentFile
	let code
	let language
	let fields = { text: 'name', icon: 'type', children: 'children' }
	let icons = {
		opened: 'i-rokkit:folder-opened',
		closed: 'i-rokkit:folder-closed'
	}
	// let size = 'small'
	let active = 'code'

	function handleSelect({ detail }) {
		currentFile = detail
		if (!$media.large) active = 'code'
	}
	$: codeVisible = $media.large || active === 'code'
	$: filesVisible = $media.large || active !== 'code'
	$: hasFiles = $story.files && $story.files.length > 0
	$: if (hasFiles) currentFile = $story.files[0].children[0]
	$: if (currentFile && currentFile.content) {
		code = currentFile.content
		language = currentFile.type
	}
	// $: console.log($story.files)
</script>

{#if hasFiles}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<nav
		class="flex px-4 bg-skin-subtle border-t border-t-skin-inset text-sm w-full h-8 cursor-pointer items-center lg:hidden"
		on:click={() => (active = active == 'code' ? 'files' : 'code')}
	>
		{[currentFile.path, currentFile.name].join('/')}
	</nav>
	<section class="flex flex-row w-full h-full overflow-auto relative">
		<aside
			class="flex flex-col bg-skin-inset min-w-full lg:min-w-40 h-full"
			class:-translate-x-full={!filesVisible}
		>
			<Tree
				items={$story.files}
				{fields}
				{icons}
				value={currentFile}
				on:select={handleSelect}
				class="folder-tree"
			/>
		</aside>
		{#if code}
			<CodeSnippet
				{code}
				{language}
				class={filesVisible
					? 'w-full h-full'
					: 'w-full h-full absolute left-0 w-full'}
			/>
		{/if}
	</section>
{/if}
