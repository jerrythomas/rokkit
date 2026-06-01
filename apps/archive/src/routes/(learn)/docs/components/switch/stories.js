import { StoryBuilder } from '$lib/builder.svelte.js'

const modules = import.meta.glob('./*/**/App.svelte', { import: 'default' })
const sources = import.meta.glob('./*/**/*', { query: '?raw', import: 'default' })

export const storyBuilder = new StoryBuilder(sources, modules)
