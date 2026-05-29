<script>
  import { ThemeSwitcherToggle } from '@rokkit/app'
</script>

<!-- Default: cycles system → light → dark -->
<ThemeSwitcherToggle />

<!-- Light/dark only (no system option) -->
<ThemeSwitcherToggle modes={['light', 'dark']} />

<!-- With text labels -->
<ThemeSwitcherToggle showLabels size="md" />
