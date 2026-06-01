export const carouselDocs = `## Sliding panel with dots, arrows, swipe & autoplay

Carousel cycles through a fixed number of slides with bindable
\`current\` index. Each slide is rendered through the \`slide\`
snippet, which receives the slide index — keeping the underlying
data out of the component and inside your script.

## Basic example

\`\`\`svelte
<script>
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
</Carousel>
\`\`\`

## Navigation

- Dots — one per slide, click to jump. Toggle with \`showDots\`.
- Arrow buttons — prev/next. Toggle with \`showArrows\`.
- Keyboard — ArrowLeft / ArrowRight when the carousel has focus,
  Home / End jump to the boundaries.
- Swipe — drag horizontally on touch / pointer.

## Autoplay

\`autoplay={true}\` advances every \`interval\` ms (default 5000).
Hovering the carousel pauses the timer; the timer resumes on mouse
leave. Set \`loop={false}\` to stop instead of wrapping at the end.

## Transitions

- \`slide\` (default) — horizontal slide between panels.
- \`fade\` — cross-fade in place.
- \`none\` — instant swap (handy for slideshows with their own
  internal animations).
`
