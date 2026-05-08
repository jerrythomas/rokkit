<script>
	import Sparkline from '$lib/components/Sparkline.svelte'
	import EnsoRing from '$lib/components/EnsoRing.svelte'
	import { Button } from '@rokkit/ui'
	import { m } from '$lib/paraglide/messages.js'

	const { data } = $props()
</script>

<div class="max-w-[1060px] mx-auto px-[48px] pt-[36px] pb-[48px]">

	<!-- ─── Greeting + FTR ─────────────────────────────────────────────── -->
	<div class="greeting-row flex justify-between items-baseline mb-8">
		<div class="flex flex-col gap-1">
			<span class="mono text-[10.5px] uppercase text-surface-z5 tracking-[0.06em]">{data.greeting.date}</span>
			<h1 class="font-display text-[28px] font-light text-surface-z9 m-0">{m.greeting_morning({ name: data.greeting.name })}</h1>
		</div>
		<div class="flex gap-4 items-center">
			<EnsoRing score={data.ftr.score} size={110} />
			<div class="flex flex-col gap-1 min-w-[150px]">
				<span class="mono text-[11px] text-surface-z5">{m.ftr_label()} · {data.ftr.period}</span>
				<Sparkline data={data.ftr.trend} width={150} height={36} />
				<span class="mono text-[11px] text-surface-z7">
					{m.ftr_vs_prior({ delta: Math.abs(data.ftr.delta).toString() })}
				</span>
			</div>
		</div>
	</div>

	<!-- ─── Hero Koan ──────────────────────────────────────────────────── -->
	<section
		class="koan-hero grid gap-[28px] p-[32px_34px_30px] bg-surface-z1 border border-surface-z2 rounded-lg mb-9"
		style="grid-template-columns: auto 1fr"
	>
		<div class="relative">
			<span class="kanji text-[96px] text-primary-z5 leading-none">{data.koan.kanji}</span>
		</div>
		<div class="flex flex-col gap-3">
			<h2 class="font-display text-[28px] font-normal text-surface-z9 m-0">{data.koan.title}</h2>
			<p class="text-[14.5px] text-surface-z7 leading-relaxed m-0">{data.koan.explanation}</p>
			<div class="flex gap-4 flex-wrap items-center mt-auto">
				<Button label={m.koan_action()} />
				<span class="text-[12px] text-primary-z5">{m.koan_projected_ftr({ pct: '14' })} · {data.koan.impact}</span>
				<span class="flex-1"></span>
				<span class="mono text-[10.5px] text-surface-z4">{data.koan.evidence}</span>
			</div>
		</div>
	</section>

	<!-- ─── Insights + Adopted (two-column) ────────────────────────────── -->
	<div class="grid gap-[30px] mb-10" style="grid-template-columns: 1.4fr 1fr">
		<section class="insights-col">
			<h3 class="font-display text-[17px] font-normal text-surface-z9 m-0 mb-[14px]">{m.section_insights()}</h3>
			<div class="flex flex-col gap-[2px]">
				{#each data.insights as insight (insight.id)}
					<div
						class="grid gap-3 p-[10px_12px] rounded-md transition-colors hover:bg-surface-z1"
						style="grid-template-columns: auto 1fr"
					>
						<span class="kanji text-[19px] {insight.tone === 'warn' ? 'text-warning-z5' : insight.tone === 'good' ? 'text-success-z5' : 'text-surface-z5'}">{insight.kanji}</span>
						<div class="flex flex-col gap-[2px]">
							<span class="text-[10.5px] uppercase tracking-[0.04em] text-surface-z5 font-medium">{insight.title}</span>
							<span class="text-[13.5px] text-surface-z7 leading-[1.5]">{insight.body}</span>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section>
			<h3 class="font-display text-[17px] font-normal text-surface-z9 m-0 mb-[14px]">{m.section_adopted()}</h3>
			<div class="flex flex-col gap-[10px]">
				{#each data.adoptedTeachings as teaching (teaching)}
					<div
						class="px-[14px] py-3 bg-surface-z1 rounded-r-md"
						style="border-left: 2px solid color-mix(in oklch, oklch(var(--color-primary-z5) / 1) 12%, transparent)"
					>
						<span class="text-[13px] text-surface-z7 leading-[1.5]">{teaching}</span>
					</div>
				{/each}
			</div>
		</section>
	</div>

	<!-- ─── Recent Sessions ────────────────────────────────────────────── -->
	<section class="sessions-section">
		<h3 class="font-display text-[17px] font-normal text-surface-z9 m-0 mb-[14px]">{m.section_sessions()}</h3>
		<div class="sessions-table flex flex-col">
			{#each data.sessions as session (session.id)}
				<div
					class="grid items-center gap-4 px-1 py-[9px] border-b border-surface-z2 transition-colors hover:bg-surface-z1"
					style="grid-template-columns: auto 120px 1fr auto auto auto"
				>
					<span class="w-2 h-2 rounded-full {session.ftr ? 'bg-success-z5' : 'bg-surface-z4'}"></span>
					<span class="mono text-[11.5px] text-surface-z5">{session.project}</span>
					<span class="text-[13px] text-surface-z9 whitespace-nowrap overflow-hidden text-ellipsis">{session.title}</span>
					<span class="mono text-[10.5px] text-surface-z5 text-right">
						{session.corrections === 0 ? m.session_first_try() : m.session_corrections({ count: session.corrections.toString() })}
					</span>
					<span class="mono text-[11px] text-surface-z5 text-right">{session.duration}</span>
					<span class="mono text-[10.5px] text-surface-z4 text-right">{session.time}</span>
				</div>
			{/each}
		</div>
	</section>
</div>
