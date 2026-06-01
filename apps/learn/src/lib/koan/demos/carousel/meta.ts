import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'carousel',
	title: 'Carousel',
	description: 'Sliding panel with dots, arrows, swipe + autoplay — pick slide content via a snippet.',
	keywords: [
		'carousel', 'slider', 'slides', 'rotator', 'showcase',
		'swiper', 'autoplay', 'gallery'
	],
	category: 'layout',
	icon: '輪',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_carousel',
		description: 'Mount a Carousel on the canvas.',
		parameters: { count: 'number of slides', autoplay: 'boolean', transition: 'slide | fade | none' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'count', type: 'number', default: '0', desc: 'Total number of slides (required for the snippet form)' },
			{ name: 'current', type: 'number', default: '0', desc: 'Active slide index', bindable: true },
			{ name: 'autoplay', type: 'boolean', default: 'false', desc: 'Auto-advance slides; pauses on hover' },
			{ name: 'interval', type: 'number', default: '5000', desc: 'Autoplay interval in ms' },
			{ name: 'loop', type: 'boolean', default: 'true', desc: 'Wrap around at the boundaries' },
			{ name: 'showDots', type: 'boolean', default: 'true', desc: 'Render the dot navigator' },
			{ name: 'showArrows', type: 'boolean', default: 'true', desc: 'Render the prev/next arrow buttons' },
			{ name: 'transition', type: "'slide' | 'fade' | 'none'", default: "'slide'", desc: 'Transition effect between slides' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [],
		attrs: [
			{ selector: '[data-carousel]', desc: 'Root container (carries data-transition, data-current)' },
			{ selector: '[data-carousel-track]', desc: 'Slide track' },
			{ selector: '[data-carousel-slide]', desc: 'Each slide (carries data-active on the current one)' },
			{ selector: '[data-carousel-dots]', desc: 'Dot navigator container' },
			{ selector: '[data-carousel-arrow]', desc: 'Prev/next arrow button' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — snippet slide',
			lang: 'svelte',
			code: `<script>
  import { Carousel } from '@rokkit/ui'

  let current = $state(0)
  const slides = [
    { title: 'Welcome',     icon: 'i-glyph:star' },
    { title: 'Features',    icon: 'i-glyph:bolt' },
    { title: 'Get Started', icon: 'i-glyph:rocket' }
  ]
</script>

<Carousel count={slides.length} bind:current>
  {#snippet slide(index)}
    <div class="slide">
      <span class={slides[index].icon}></span>
      <h3>{slides[index].title}</h3>
    </div>
  {/snippet}
</Carousel>`
		},
		{
			id: 'autoplay',
			title: 'Autoplay — fade transition',
			lang: 'svelte',
			code: `<Carousel count={3} autoplay interval={3000} transition="fade">
  ...slides...
</Carousel>`
		},
		{
			id: 'noloop',
			title: 'Bounded — no loop, no autoplay',
			lang: 'svelte',
			code: `<Carousel count={3} loop={false} autoplay={false}>
  ...slides...
</Carousel>`
		}
	],
	docs
}

export default meta
