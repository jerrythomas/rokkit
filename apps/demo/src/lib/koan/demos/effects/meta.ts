import type { DemoMeta } from '../../types'
import { effectsDocs } from './docs'

const meta: DemoMeta = {
	id: 'effects',
	title: 'Effects',
	description: 'Tilt + Shine + Reveal — pointer-tracking + scroll-reveal wrappers compose with any content.',
	keywords: [
		'effects', 'tilt', 'shine', 'reveal', 'animation', 'motion',
		'pointer-track', 'scroll-reveal', 'glossy', 'parallax'
	],
	category: 'content',
	icon: '光',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_effects',
		description: 'Mount the Effects gallery (Tilt / Shine / Reveal) on the canvas.',
		parameters: {}
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: '— Tilt —', type: 'wrapper', desc: 'maxRotation (deg, default 10), perspective (px, default 600), setBrightness (boolean)' },
			{ name: '— Shine —', type: 'wrapper', desc: 'color, radius, depth, surfaceScale, specularConstant, specularExponent' },
			{ name: '— Reveal —', type: 'wrapper', desc: 'direction (up/down/left/right/none), distance, duration, delay, stagger, once, threshold, easing' }
		],
		events: [],
		attrs: [
			{ selector: 'Tilt root', desc: 'Wraps the child; applies a 3D-rotation transform on mousemove' },
			{ selector: 'Shine root', desc: 'Wraps the child; renders an SVG specular filter that follows the pointer' },
			{ selector: 'Reveal root', desc: 'Wraps the child; uses IntersectionObserver to fade/slide in on viewport entry' }
		]
	},
	snippets: [
		{
			id: 'tilt',
			title: 'Tilt — pointer-tracking rotation',
			lang: 'svelte',
			code: `<Tilt maxRotation={12} setBrightness>
  <Card>
    <h3>Hover me</h3>
    <p>The card tilts toward the cursor.</p>
  </Card>
</Tilt>`
		},
		{
			id: 'shine',
			title: 'Shine — specular highlight',
			lang: 'svelte',
			code: `<Shine color="rgb(var(--accent))">
  <Card class="glossy">
    <h3>Glossy surface</h3>
    <p>Hover for a specular highlight.</p>
  </Card>
</Shine>`
		},
		{
			id: 'reveal',
			title: 'Reveal — staggered scroll-in',
			lang: 'svelte',
			code: `<Reveal direction="up" stagger={120}>
  <Card>First card</Card>
  <Card>Second card</Card>
  <Card>Third card</Card>
</Reveal>`
		},
		{
			id: 'compose',
			title: 'Compose all three',
			lang: 'svelte',
			code: `<Reveal direction="up">
  <Tilt maxRotation={8}>
    <Shine>
      <Card>Reveals → tilts → shines</Card>
    </Shine>
  </Tilt>
</Reveal>`
		}
	],
	docs: effectsDocs
}

export default meta
