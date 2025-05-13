<script>
	let { children } = $props()
</script>

<figure class="inset-ring inset-ring-neutral-50 flex flex-col gap-1 rounded-xl bg-neutral-50 p-1">
	<div
		class="not-prose bg-neutral-inset outline-neutral-base overflow-auto rounded-lg p-8 outline dark:bg-gray-950/50"
	>
		{@render children?.()}
	</div>
	<div>
		<div
			class="in-data-stack:mt-0 in-data-stack:rounded-none in-[figure]:-mx-1 in-[figure]:-mb-1 in-data-stack:[:first-child>&amp;]:rounded-t-xl in-data-stack:[:first-child>&amp;]:*:rounded-t-xl in-data-stack:[:last-child>&amp;]:rounded-b-xl in-data-stack:[:last-child>&amp;]:*:rounded-b-xl rounded-xl bg-gray-950"
		>
			<div
				class="scheme-dark in-data-stack:rounded-none dark:inset-ring dark:inset-ring-white/10 in-data-stack:dark:inset-ring-0 not-prose rounded-xl p-1 text-sm dark:bg-white/5"
			>
				<div
					class="*:bg-white/10! dark:*:bg-white/5! **:[.line]:isolate **:[.line]:not-last:min-h-[1lh] *:inset-ring *:inset-ring-white/10 dark:*:inset-ring-white/5 *:flex *:*:max-w-none *:*:shrink-0 *:*:grow *:overflow-auto *:rounded-lg *:p-5"
				>
					<pre
						class="shiki tailwindcss-theme"
						style="background-color:transparent;color:var(--color-slate-50)"
						tabindex="0"><code
							><div class="line"><span style="color:var(--color-slate-400)">&lt;</span><span
									style="color:var(--color-pink-400)">p</span
								><span style="color:var(--color-slate-300)"> class</span><span
									style="color:var(--color-slate-400)">=</span
								><span style="color:var(--color-sky-300)">"</span><span
									style="color:var(--color-sky-300)"
									class="highlighted-word before:-inset-y-0.25 [.highlighted-word_+_&amp;]:before:rounded-l-none relative before:absolute before:-inset-x-0.5 before:-z-10 before:block before:rounded-sm before:bg-[lab(19.93_-1.66_-9.7)]"
									>underline</span
								><span style="color:var(--color-sky-300)">"</span><span
									style="color:var(--color-slate-400)">&gt;</span
								><span style="color:var(--color-slate-50)">The quick brown fox...</span><span
									style="color:var(--color-slate-400)">&lt;/</span
								><span style="color:var(--color-pink-400)">p</span><span
									style="color:var(--color-slate-400)">&gt;</span
								></div><div class="line"></div></code
						></pre>
				</div>
			</div>
		</div>
	</div>
</figure>
