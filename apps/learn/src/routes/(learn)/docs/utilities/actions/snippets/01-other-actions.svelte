<script>
  import { ripple, hoverLift, reveal, magnetic, dismissable } from '@rokkit/actions'
</script>

<!-- Ripple effect on click -->
<button use:ripple>Click me</button>

<!-- Hover lift / depth animation -->
<div use:hoverLift>Card content</div>

<!-- Scroll-triggered reveal animation -->
<section use:reveal>Revealed on scroll</section>

<!-- Magnetic cursor attraction -->
<button use:magnetic>Magnetic button</button>

<!-- Dismiss on click-outside or Escape -->
<div use:dismissable={{ onDismiss: () => (open = false) }}>Popover</div>
