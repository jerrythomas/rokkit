<script>
  /**
   * @type {{
   *   frameKeys: unknown[],
   *   currentIndex: number,
   *   playing: boolean,
   *   speed: number,
   *   onplay: () => void,
   *   onpause: () => void,
   *   onscrub: (index: number) => void,
   *   onspeed: (speed: number) => void
   * }}
   */
  let {
    frameKeys = [],
    currentIndex = 0,
    playing = false,
    speed = 1,
    onplay,
    onpause,
    onscrub,
    onspeed
  } = $props()

  const frameLabel = $derived(frameKeys[currentIndex] ?? '')

  const SPEEDS = [0.5, 1, 1.5, 2, 4]
</script>

<div class="timeline" data-plot-timeline>
  <!-- Play / Pause -->
  <button
    class="play-pause"
    aria-label={playing ? 'Pause' : 'Play'}
    onclick={() => playing ? onpause?.() : onplay?.()}
    data-plot-timeline-playpause
  >
    {playing ? '⏸' : '▶'}
  </button>

  <!-- Frame label -->
  <span class="frame-label" data-plot-timeline-label>{frameLabel}</span>

  <!-- Scrub slider -->
  <input
    type="range"
    min="0"
    max={frameKeys.length - 1}
    value={currentIndex}
    class="scrub"
    aria-label="Animation timeline"
    oninput={(e) => onscrub?.(Number(e.currentTarget.value))}
    data-plot-timeline-scrub
  />

  <!-- Speed selector -->
  <select
    aria-label="Playback speed"
    value={speed}
    onchange={(e) => onspeed?.(Number(e.currentTarget.value))}
    data-plot-timeline-speed
  >
    {#each SPEEDS as s (s)}
      <option value={s}>{s}×</option>
    {/each}
  </select>
</div>

<style>
  .timeline {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    font-size: 12px;
  }
  .play-pause {
    font-size: 16px;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
  }
  .scrub {
    flex: 1;
  }
  .frame-label {
    min-width: 4ch;
    text-align: right;
  }
</style>
