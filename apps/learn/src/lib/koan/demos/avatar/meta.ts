import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'avatar',
	title: 'Avatar',
	description: 'User identity glyph — image with initials fallback, presence indicator, five sizes.',
	keywords: ['avatar', 'avatars', 'profile', 'user', 'picture', 'photo', 'initials', 'presence'],
	category: 'feedback',
	icon: '人',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_avatar',
		description: 'Mount an Avatar gallery — sizes, initials fallback, presence dots.',
		parameters: { src: 'image URL', name: 'derives initials' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'src', type: 'string', desc: 'Image source URL' },
			{ name: 'alt', type: 'string', desc: 'Alt text for the image' },
			{ name: 'initials', type: 'string', desc: 'Explicit initials (overrides auto-derive from name)' },
			{ name: 'name', type: 'string', desc: 'Full name — auto-derives initials when `initials` is unset' },
			{ name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", desc: 'Size variant' },
			{ name: 'status', type: "'online' | 'offline' | 'away' | 'busy'", desc: 'Online presence indicator' },
			{ name: 'shape', type: "'circle' | 'square'", default: "'circle'", desc: 'Avatar shape' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		attrs: [
			{ selector: '[data-avatar]', desc: 'Root container (carries data-size, data-shape, data-status)' },
			{ selector: '[data-avatar-image]', desc: 'Image element when src is set' },
			{ selector: '[data-avatar-initials]', desc: 'Initials fallback element' },
			{ selector: '[data-avatar-status]', desc: 'Presence dot element' }
		]
	},
	snippets: [
		{ id: 'intro', title: 'Basic', lang: 'svelte', code: `<Avatar name="Ada Lovelace" />` },
		{ id: 'image', title: 'With image', lang: 'svelte',
			code: `<Avatar src="/ada.jpg" alt="Ada" name="Ada Lovelace" size="lg" />` },
		{ id: 'status', title: 'Presence', lang: 'svelte',
			code: `<Avatar name="Online" status="online" />` }
	],
	docs
}

export default meta
