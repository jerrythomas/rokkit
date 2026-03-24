<script>
  import { onMount, onDestroy } from 'svelte'
  import { extractFrames, normalizeFrame, computeStaticDomains } from './lib/plot/frames.js'
  import Timeline from './Plot/Timeline.svelte'
  import PlotChart from './Plot.svelte'

  /**
   * @type {{
   *   data: Object[],
   *   animate: { by: string, duration?: number, loop?: boolean },
   *   x?: string,
   *   y?: string,
   *   color?: string,
   *   geoms?: import('./lib/plot/types.js').GeomSpec[],
   *   helpers?: import('./lib/plot/types.js').PlotHelpers,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   grid?: boolean,
   *   legend?: boolean,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    data = [],
    animate,
    x,
    y,
    color,
    geoms = [],
    helpers = {},
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false,
    children
  } = $props()

  // Extract and normalize frames
  const rawFrames = $derived(extractFrames(data, animate.by))
  const frameKeys = $derived([...rawFrames.keys()])

  const channels = $derived({ x, y, color })
  const allXValues = $derived(x ? [...new Set(data.map((d) => d[x]))] : [])
  const allColorValues = $derived(color ? [...new Set(data.map((d) => d[color]))] : null)

  const staticDomains = $derived(
    x && y ? computeStaticDomains(rawFrames, channels) : { xDomain: undefined, yDomain: undefined }
  )

  // Playback state
  let currentIndex = $state(0)
  let playing      = $state(false)
  let speed        = $state(1)

  // Current frame data (normalized — missing combos filled with 0)
  const currentFrameData = $derived.by(() => {
    const key = frameKeys[currentIndex]
    const raw = rawFrames.get(key) ?? []
    if (!x || !y) return raw
    return normalizeFrame(raw, { x, y, color }, allXValues, allColorValues)
  })

  // Reduced motion preference
  let prefersReducedMotion = $state(false)
  onMount(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion = mq.matches
    const handler = (e) => { prefersReducedMotion = e.matches }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  })

  // Animation loop
  const baseDuration = $derived(animate.duration ?? 800)
  const msPerFrame   = $derived(Math.round(baseDuration / speed))
  let lastTime = 0
  let rafId = 0

  function tick(time) {
    if (!playing) return
    if (time - lastTime >= msPerFrame) {
      lastTime = time
      currentIndex = currentIndex + 1
      if (currentIndex >= frameKeys.length) {
        if (animate.loop ?? false) {
          currentIndex = 0
        } else {
          playing = false
          return
        }
      }
    }
    rafId = requestAnimationFrame(tick)
  }

  $effect(() => {
    // Reading msPerFrame here makes it a tracked dependency — effect re-runs on speed changes,
    // which resets lastTime=0 to re-anchor frame pacing.
    const _ms = msPerFrame
    if (playing && !prefersReducedMotion) {
      lastTime = 0
      rafId = requestAnimationFrame(tick)
    } else {
      cancelAnimationFrame(rafId)
    }
    return () => cancelAnimationFrame(rafId)
  })

  // Reduced motion: step frames on interval instead
  let reducedInterval = 0
  $effect(() => {
    if (!playing || !prefersReducedMotion) {
      clearInterval(reducedInterval)
      return
    }
    reducedInterval = setInterval(() => {
      currentIndex = currentIndex + 1
      if (currentIndex >= frameKeys.length) {
        if (animate.loop ?? false) currentIndex = 0
        else { playing = false; clearInterval(reducedInterval) }
      }
    }, msPerFrame)
    return () => clearInterval(reducedInterval)
  })

  onDestroy(() => {
    cancelAnimationFrame(rafId)
    clearInterval(reducedInterval)
  })

  $effect(() => {
    const len = frameKeys.length
    if (currentIndex >= len && len > 0) {
      currentIndex = len - 1
      playing = false
    } else if (len === 0) {
      currentIndex = 0
      playing = false
    }
  })

  function handlePlay()  { playing = true }
  function handlePause() { playing = false }
  function handleScrub(index) {
    playing = false
    currentIndex = index
  }
  function handleSpeed(s) { speed = s }

  // Build spec for the current frame, with static domain overrides
  const frameSpec = $derived({
    data: currentFrameData,
    x, y, color,
    geoms,
    xDomain: staticDomains.xDomain,
    yDomain: staticDomains.yDomain
  })
</script>

<div class="animated-plot" data-plot-animated>
  <PlotChart
    spec={frameSpec}
    {helpers}
    {width}
    {height}
    {mode}
    {grid}
    {legend}
  >
    {@render children?.()}
  </PlotChart>

  <Timeline
    {frameKeys}
    {currentIndex}
    {playing}
    {speed}
    onplay={handlePlay}
    onpause={handlePause}
    onscrub={handleScrub}
    onspeed={handleSpeed}
  />
</div>

<style>
  .animated-plot {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
