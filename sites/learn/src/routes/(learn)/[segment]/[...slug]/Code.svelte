<script>
	import { Tree } from '@rokkit/core'
	import { CodeSnippet } from '@rokkit/markdown'
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

	$: filesVisible = $media.large || active !== 'code'
	$: hasFiles = $story.files && $story.files.length > 0
	$: if (hasFiles) currentFile = $story.files[0].children[0]
	$: if (currentFile && currentFile.content) {
		code = currentFile.content
		language = currentFile.type
	}
</script>

{#if hasFiles}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<source-files class="flex flex-col h-full border-t-2px border-t-skin-inset">
		<nav
			class="flex h-8 px-4 text-sm w-full bg-skin-subtle border-t border-t-skin-inset cursor-pointer items-center lg:hidden"
			on:click={() => (active = active == 'code' ? 'files' : 'code')}
		>
			{[currentFile.path, currentFile.name].join('/')}
		</nav>
		<section class="flex flex-row w-full h-full overflow-auto relative">
			<aside
				class="flex flex-col min-w-full bg-skin-inset lg:min-w-50 h-full"
				class:-translate-x-full={!filesVisible}
			>
				<Tree
					items={$story.files}
					{fields}
					value={currentFile}
					on:select={handleSelect}
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
	</source-files>
{/if}
