<script>
	import { onMount } from 'svelte'
	import { Tree } from '@rokkit/core'
	import { page } from '$app/stores'
	let component
	let preview
	async function loadComponent(path) {
		const content = `/src/lib/stories/${path}/README.md`
		const module = await import(/* @vite-ignore */ content)
		component = module.default
		preview = (
			await import(/* @vite-ignore */ `/src/lib/stories/${path}/App.svelte`)
		).default
	}

	let data = [
		{
			name: 'src',
			type: 'folder',
			_open: true,
			data: [
				{ name: 'App.svelte', type: 'i-file:svelte' },
				{ name: 'data.js', type: 'i-file:js' }
			]
		}
	]
	let fields = { text: 'name', icon: 'type' }
	let icons = {
		opened: 'i-rokkit:folder-opened',
		closed: 'i-rokkit:folder-closed'
	}

	onMount(() => {
		loadComponent($page.params.slug)
	})
</script>

{#if component}
	<split-view class="flex w-full h-full overflow-auto">
		<notes
			class="markdown-body font-thin p-8 w-full h-full overflow-auto max-w-150 border-r border-r-skin-subtle"
			slot="a"
		>
			<svelte:component this={component} />
		</notes>
		<section class="grid grid-rows-2">
			<div class="flex flex-col p-8 gap-4">
				<svelte:component this={preview} />
			</div>
			<app-source class="flex">
				<aside class="flex flex-col bg-skin-inset w-60 h-full">
					<Tree
						items={data}
						{fields}
						linesVisible={true}
						{icons}
						class="folder-tree"
					/>
				</aside>
				<div class="flex">{JSON.stringify($page.params)}</div>
			</app-source>
		</section>
	</split-view>
{:else}
	<p>Loading component...</p>
{/if}
