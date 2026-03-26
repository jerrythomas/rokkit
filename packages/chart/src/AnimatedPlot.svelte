<script>
  import { onMount, onDestroy } from 'svelte'
  import { extractFrames, completeFrames, computeStaticDomains } from './lib/plot/frames.js'
  import { applyGeomStat } from './lib/plot/stat.js'
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

  // Pre-aggregate and complete frames when any geom has a non-identity stat:
  //   1. applyGeomStat: aggregate data by (x, color?, by) → one row per combination
  //   2. completeFrames: alignBy(by) ensures all frame values appear for every (x, color?)
  //      group, filling missing rows with y=0 so bars animate smoothly
  // Geoms are returned with stat: 'identity' so PlotChart renders the pre-aggregated values as-is.
  const prepared = $derived.by(() => {
    const firstNonIdentity = geoms.find((g) => g.stat && g.stat !== 'identity')
    if (!firstNonIdentity) return { data, geoms }

    const aggChannels = { y }
    if (x) aggChannels.x = x
    if (color) aggChannels.color = color
    aggChannels.frame = animate.by  // 'frame' is not a value channel, so it becomes a group-by

    const aggregated = applyGeomStat(
      data,
      { stat: firstNonIdentity.stat, channels: aggChannels },
      helpers
    )
    const completeData = completeFrames(aggregated, { x, y, color }, animate.by)

    return { data: completeData, geoms: geoms.map((g) => ({ ...g, stat: 'identity' })) }
  })

  // Extract frames and compute stable domains from the full prepared dataset
  const rawFrames = $derived(extractFrames(prepared.data, animate.by))
  const frameKeys = $derived([...rawFrames.keys()])

  const channels = $derived({ x, y, color })
  const staticDomains = $derived(
    x && y ? computeStaticDomains(prepared.data, channels) : { xDomain: undefined, yDomain: undefined }
  )

  // Playback state
  let currentIndex = $state(0)
  let playing      = $state(false)
  let speed        = $state(1)

  // Current frame data — already complete (all x/color combos present)
  const currentFrameData = $derived.by(() => {
    const key = frameKeys[currentIndex]
    return rawFrames.get(key) ?? []
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

  function advanceFrame() {
    currentIndex = currentIndex + 1
    if (currentIndex >= frameKeys.length) {
      if (animate.loop ?? false) currentIndex = 0
      else playing = false
    }
  }

  function tick(time) {
    if (!playing) return
    if (time - lastTime >= msPerFrame) {
      lastTime = time
      advanceFrame()
      if (!playing) return
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
    geoms: prepared.geoms,
    xDomain: staticDomains.xDomain,
    yDomain: staticDomains.yDomain
  })
</script>

<div data-plot-animated>
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
  [data-plot-animated] {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
