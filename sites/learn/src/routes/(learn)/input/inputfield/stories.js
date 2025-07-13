import { StoryBuilder } from '$lib/components/Story/builder.svelte.js'

const modules = import.meta.glob('./*/**/App.svelte', { import: 'default' })
const sources = import.meta.glob('./*/**/*', { query: '?raw', import: 'default' })

export const storyBuilder = new StoryBuilder(sources, modules)