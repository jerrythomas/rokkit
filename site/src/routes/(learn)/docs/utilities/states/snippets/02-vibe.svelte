<script>
  import { vibe } from '@rokkit/states'

  // vibe is a reactive store tracking current theme attributes
  // vibe.style   — current data-style value ('rokkit' | 'minimal' | 'material')
  // vibe.mode    — current data-mode value ('light' | 'dark')
  // vibe.palette — current data-palette value
</script>

<p>Current style: {vibe.style}</p>
<p>Current mode: {vibe.mode}</p>
