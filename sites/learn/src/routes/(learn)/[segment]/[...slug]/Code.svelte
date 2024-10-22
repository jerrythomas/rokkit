<script>
	import { run } from 'svelte/legacy';

	import { Tree } from '@rokkit/ui'
	import CodeSnippet from '$lib/CodeSnippet.svelte'
	import { getContext } from 'svelte'

	const story = getContext('tutorial')
	const media = getContext('media')

	let currentFile = $state()
	let code = $state()
	let language = $state()
	let fields = { text: 'name', icon: 'type' }

	let active = $state('code')

	function handleSelect({ detail }) {
		currentFile = detail
		if (!$media.large) active = 'code'
	}

	// $: filesVisible = $media.large || active !== 'code'
	let filesVisible = $derived(active !== 'code')
	let hasFiles = $derived($story.files && $story.files.length > 0)
	run(() => {
		if (hasFiles) currentFile = $story.files[0].children[0]
	});
	run(() => {
		if (currentFile && currentFile.content) {
			code = currentFile.content
			language = currentFile.type
		}
	});
</script>

{#if hasFiles}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<source-files class="h-full flex flex-col border-t border-t-neutral-inset">
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<nav
			class="h-8 w-full flex cursor-pointer items-center bg-neutral-subtle px-4 text-sm"
			onclick={() => (active = active == 'code' ? 'files' : 'code')}
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
