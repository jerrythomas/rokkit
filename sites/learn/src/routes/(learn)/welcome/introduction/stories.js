import { fetchStories } from '$lib/components/Story/stories'

const modules = import.meta.glob('./*/**/App.svelte', { import: 'default' })
const sources = import.meta.glob('./*/**/*', { query: '?raw', import: 'default' })

export const stories = fetchStories(sources, modules)
