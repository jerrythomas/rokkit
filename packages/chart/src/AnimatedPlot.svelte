<script>
	import { onMount, onDestroy } from 'svelte'
	import { tweened } from 'svelte/motion'
	import { sineInOut } from 'svelte/easing'
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
	 *   fill?: string,
	 *   pattern?: string,
	 *   symbol?: string,
	 *   geom?: string,
	 *   stat?: string,
	 *   geoms?: import('./lib/plot/types.js').GeomSpec[],
	 *   helpers?: import('./lib/plot/types.js').PlotHelpers,
	 *   width?: number,
	 *   height?: number,
	 *   mode?: 'light' | 'dark',
	 *   grid?: boolean,
	 *   legend?: boolean,
	 *   tween?: boolean,
	 *   sorted?: boolean,
	 *   dynamicDomain?: boolean,
	 *   label?: boolean | string | ((data: Record<string, unknown>) => string),
	 *   children?: import('svelte').Snippet
	 * }}
	 */
	let {
		data = [],
		animate,
		x,
		y,
		color,
		fill = undefined,
		pattern = undefined,
		symbol = undefined,
		geom = 'bar',
		stat = 'identity',
		geoms = [],
		helpers = {},
		width = 600,
		height = 400,
		mode = 'light',
		grid = true,
		legend = false,
		tween = true,
		sorted = false,
		dynamicDomain = false,
		label = false,
		children
	} = $props()

	// Effective geom list: explicit array takes precedence; otherwise build from shorthand props
	const effectiveGeoms = $derived(
		geoms.length > 0
			? geoms
			: [
					{
						type: geom,
						stat,
						...(fill !== undefined && { fill }),
						...(pattern !== undefined && { pattern }),
						...(symbol !== undefined && { symbol })
					}
				]
	)

	// Pre-aggregate and complete frames when any geom has a non-identity stat
	const prepared = $derived.by(() => {
		const firstNonIdentity = effectiveGeoms.find((g) => g.stat && g.stat !== 'identity')
		if (!firstNonIdentity) return { data, geoms: effectiveGeoms }

		const aggChannels = { y }
		if (x) aggChannels.x = x
		if (color) aggChannels.color = color
		aggChannels.frame = animate.by

		const aggregated = applyGeomStat(
			data,
			{ stat: firstNonIdentity.stat, channels: aggChannels },
			helpers
		)
		const completeData = completeFrames(aggregated, { x, y, color }, animate.by)
		return { data: completeData, geoms: effectiveGeoms.map((g) => ({ ...g, stat: 'identity' })) }
	})

	// Extract frames and compute stable domains from the full prepared dataset
	const rawFrames = $derived(extractFrames(prepared.data, animate.by))
	const frameKeys = $derived([...rawFrames.keys()])

	const channels = $derived({ x, y, color })
	const staticDomains = $derived(
		x && y
			? computeStaticDomains(prepared.data, channels)
			: { xDomain: undefined, yDomain: undefined }
	)

	// Tweened x-domain for dynamic axis animation (opt-in via dynamicDomain prop)
	const xDomainTween = tweened([0, 1], { duration: 0 })
	let xDomainInitialized = false

	// Playback state
	let currentIndex = $state(0)
	let playing = $state(false)
	let speed = $state(1)

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

	// Animation timing
	const baseDuration = $derived(animate.duration ?? 800)
	const msPerFrame = $derived(Math.round(baseDuration / speed))

	// rAF-based frame timer — advances currentIndex every msPerFrame ms.
	// Separate from the tween: the tween handles visual interpolation only.
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
		// msPerFrame is a tracked dependency: re-runs on speed change, resetting lastTime=0
		const _ms = msPerFrame
		if (playing && !prefersReducedMotion) {
			lastTime = 0
			rafId = requestAnimationFrame(tick)
		} else {
			cancelAnimationFrame(rafId)
		}
		return () => cancelAnimationFrame(rafId)
	})

	// Reduced motion: step frames on interval instead of rAF
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

	function handlePlay() { playing = true }
	function handlePause() { playing = false }
	function handleScrub(index) { playing = false; currentIndex = index }
	function handleSpeed(s) { speed = s }

	// Detect horizontal bar chart race: sorted=true AND y is a categorical string field
	const isHorizontalRace = $derived.by(() => {
		if (!sorted || !prepared.data.length) return false
		const sample = prepared.data[0]
		return y && typeof sample[y] === 'string'
	})

	// Number of unique entities (y categories) for horizontal race yDomain
	const entityCount = $derived.by(() => {
		if (!isHorizontalRace) return 0
		return new Set(prepared.data.map((d) => d[y])).size
	})

	// Tweened display data — smoothly interpolates values between frames.
	// Tween duration is 1.1× the frame interval so tweens always overlap:
	// when the next frame fires, the previous tween is ~91% complete.
	// displayTween.set() starts from the current in-flight value → seamless continuous motion.
	const displayTween = tweened([], { duration: 0 })

	$effect(() => {
		const raw = currentFrameData
		const xField = x
		const yField = y

		// Build display target for this frame
		let target
		if (isHorizontalRace) {
			const ranked = raw.slice().sort((a, b) => Number(b[xField]) - Number(a[xField]))
			const n = ranked.length
			target = ranked.map((row, i) => ({
				...row,
				_entity: row[yField],
				_rank: n - 1 - i
			}))
		} else if (sorted) {
			target = raw.slice().sort((a, b) => Number(b[yField]) - Number(a[yField]))
		} else {
			target = raw
		}

		// Tween duration slightly longer than frame interval → guaranteed overlap, no pause
		const tweenDuration = Math.round(msPerFrame * 1.1)

		if (!tween || prefersReducedMotion) {
			displayTween.set(target, { duration: 0 })
		} else if (isHorizontalRace) {
			displayTween.set(target, {
				duration: tweenDuration,
				easing: sineInOut,
				interpolate: (a, b) => {
					const aMap = new Map(a.map((r) => [r._entity, r]))
					return (t) =>
						b.map((r) => {
							const p = aMap.get(r._entity) ?? r
							return {
								...r,
								[xField]: Number(p[xField] ?? 0) * (1 - t) + Number(r[xField]) * t,
								_rank: Number(p._rank ?? r._rank) * (1 - t) + Number(r._rank) * t
							}
						})
				}
			})
		} else if (sorted) {
			displayTween.set(target, {
				duration: tweenDuration,
				easing: sineInOut,
				interpolate: (a, b) => {
					const aMap = new Map(a.map((r) => [r[xField], r]))
					return (t) =>
						b.map((r) => {
							const p = aMap.get(r[xField]) ?? r
							return { ...r, [yField]: Number(p[yField] ?? 0) * (1 - t) + Number(r[yField]) * t }
						})
				}
			})
		} else {
			// Unsorted: if y is categorical (string), key by y-value and lerp x (bar width).
			// This keeps bars at stable band positions while widths animate smoothly.
			const yCategorical = yField && raw.length > 0 && typeof raw[0][yField] === 'string'
			if (yCategorical) {
				displayTween.set(target, {
					duration: tweenDuration,
					easing: sineInOut,
					interpolate: (a, b) => {
						const aMap = new Map(a.map((r) => [r[yField], r]))
						return (t) =>
							b.map((r) => {
								const p = aMap.get(r[yField]) ?? r
								return { ...r, [xField]: Number(p[xField] ?? 0) * (1 - t) + Number(r[xField]) * t }
							})
					}
				})
			} else {
				displayTween.set(target, {
					duration: tweenDuration,
					easing: sineInOut,
					interpolate: (a, b) => (t) =>
						b.map((r, i) => ({
							...r,
							[yField]: Number(a[i]?.[yField] ?? 0) * (1 - t) + Number(r[yField]) * t
						}))
				})
			}
		}
	})

	// Tween the x-domain per frame for dynamic axis animation (opt-in).
	// First update is instant to avoid a jarring jump when toggled.
	$effect(() => {
		if (!dynamicDomain || !x || !currentFrameData.length) {
			if (!dynamicDomain) xDomainInitialized = false
			return
		}
		const vals = currentFrameData.map((d) => Number(d[x])).filter((v) => !isNaN(v))
		if (vals.length === 0) return
		const max = Math.max(...vals)
		xDomainTween.set([0, max], {
			duration: xDomainInitialized ? Math.round(msPerFrame * 1.1) : 0,
			easing: sineInOut
		})
		xDomainInitialized = true
	})

	// For horizontal race: inject orientation, label, and labelInside into each geom
	const raceGeoms = $derived(
		prepared.geoms.map((g) => ({
			...g,
			...(label && { label: '_entity' }),
			options: {
				...(g.options ?? {}),
				orientation: 'horizontal',
				...(label && { labelInside: true })
			}
		}))
	)

	const xDomainForFrame = $derived(
		isHorizontalRace && dynamicDomain ? $xDomainTween : staticDomains.xDomain
	)
	const frameSpec = $derived({
		data: $displayTween,
		x,
		y: isHorizontalRace ? '_rank' : y,
		color,
		geoms: isHorizontalRace ? raceGeoms : prepared.geoms,
		xDomain: xDomainForFrame,
		yDomain: isHorizontalRace ? [0, entityCount - 1] : staticDomains.yDomain,
		orientation: isHorizontalRace ? 'horizontal' : undefined
	})
</script>

<div data-plot-animated>
	<PlotChart spec={frameSpec} {helpers} {width} {height} {mode} {grid} {legend}>
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
