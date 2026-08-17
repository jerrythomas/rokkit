<script lang="ts">
	type Props = {
		frameKeys?: unknown[]
		currentIndex?: number
		playing?: boolean
		speed?: number
		onplay?: () => void
		onpause?: () => void
		onscrub?: (index: number) => void
		onspeed?: (speed: number) => void
	}

	let {
		frameKeys = [],
		currentIndex = 0,
		playing = false,
		speed = 1,
		onplay,
		onpause,
		onscrub,
		onspeed
	}: Props = $props()

	const safeIndex = $derived(
		frameKeys.length === 0 ? 0 : Math.min(currentIndex, frameKeys.length - 1)
	)
</script>

<div class="timeline" data-plot-timeline>
	<!-- Play / Pause -->
	<button
		class="play-pause"
		aria-label={playing ? 'Pause' : 'Play'}
		onclick={() => (playing ? onpause?.() : onplay?.())}
		disabled={frameKeys.length === 0}
		data-plot-timeline-playpause
	>
		{playing ? '⏸' : '▶'}
	</button>

	<!-- Frame label -->
	<span class="frame-label" data-plot-timeline-label>{frameKeys[safeIndex] ?? ''}</span>

	<!-- Scrub slider -->
	<input
		type="range"
		min="0"
		max={Math.max(0, frameKeys.length - 1)}
		value={safeIndex}
		disabled={frameKeys.length === 0}
		class="scrub"
		aria-label="Animation timeline"
		oninput={(e) => onscrub?.(Number(e.currentTarget.value))}
		data-plot-timeline-scrub
	/>

	<!-- Speed (× multiplier) — themed numeric input -->
	<div class="speed">
		<input
			type="number"
			min="0.25"
			max="8"
			step="0.25"
			value={speed}
			aria-label="Playback speed"
			onchange={(e) => onspeed?.(Math.max(0.25, Number(e.currentTarget.value) || 1))}
			data-plot-timeline-speed
		/>
		<span class="speed-unit" aria-hidden="true">×</span>
	</div>
</div>

<style>
	.timeline {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 0;
		font-size: 12px;
		color: var(--ink-mute, currentColor);
	}
	.play-pause {
		font-size: 16px;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		color: var(--ink, currentColor);
	}
	.scrub {
		flex: 1;
		accent-color: var(--accent, currentColor);
	}
	.frame-label {
		min-width: 4ch;
		text-align: right;
		color: var(--ink, currentColor);
	}
	.speed {
		display: inline-flex;
		align-items: center;
		gap: 2px;
	}
	.speed input {
		width: 3.5em;
		font: inherit;
		color: var(--ink, currentColor);
		background: var(--paper, transparent);
		border: 1px solid var(--paper-edge, currentColor);
		border-radius: 4px;
		padding: 2px 4px;
	}
	.speed input:focus-visible {
		outline: 2px solid var(--accent, currentColor);
		outline-offset: 1px;
	}
	.speed-unit {
		color: var(--ink-mute, currentColor);
	}
</style>
