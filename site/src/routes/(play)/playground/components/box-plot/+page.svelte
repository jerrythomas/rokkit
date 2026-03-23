<script>
  // @ts-nocheck
  import { BoxPlot } from '@rokkit/chart'
  import { FormRenderer, InfoField } from '@rokkit/forms'
  import PlaySection from '$lib/components/PlaySection.svelte'

  const chartData = [
    { category: 'Control',   score: 52, cohort: 'A' }, { category: 'Control',   score: 61, cohort: 'A' },
    { category: 'Control',   score: 48, cohort: 'A' }, { category: 'Control',   score: 70, cohort: 'A' },
    { category: 'Control',   score: 55, cohort: 'A' }, { category: 'Control',   score: 43, cohort: 'A' },
    { category: 'Control',   score: 66, cohort: 'A' }, { category: 'Control',   score: 58, cohort: 'A' },
    { category: 'Treatment', score: 71, cohort: 'A' }, { category: 'Treatment', score: 83, cohort: 'A' },
    { category: 'Treatment', score: 65, cohort: 'A' }, { category: 'Treatment', score: 90, cohort: 'A' },
    { category: 'Treatment', score: 78, cohort: 'A' }, { category: 'Treatment', score: 62, cohort: 'A' },
    { category: 'Treatment', score: 88, cohort: 'A' }, { category: 'Treatment', score: 75, cohort: 'A' },
    { category: 'Placebo',   score: 50, cohort: 'B' }, { category: 'Placebo',   score: 54, cohort: 'B' },
    { category: 'Placebo',   score: 47, cohort: 'B' }, { category: 'Placebo',   score: 63, cohort: 'B' },
    { category: 'Placebo',   score: 51, cohort: 'B' }, { category: 'Placebo',   score: 58, cohort: 'B' },
    { category: 'Placebo',   score: 44, cohort: 'B' }, { category: 'Placebo',   score: 60, cohort: 'B' }
  ]

  let props = $state({ fillField: 'category', grid: true, legend: false })

  const schema = {
    type: 'object',
    properties: {
      fillField: { type: 'string' },
      grid: { type: 'boolean' },
      legend: { type: 'boolean' }
    }
  }

  const layout = {
    type: 'vertical',
    elements: [
      { scope: '#/fillField', label: 'fill', props: { options: ['', 'category', 'cohort'] } },
      { scope: '#/grid',   label: 'grid' },
      { scope: '#/legend', label: 'legend' },
      { type: 'separator' }
    ]
  }
</script>

<PlaySection>
  {#snippet preview()}
    <div class="flex flex-col gap-8 p-6">
      <div>
        <h4 class="text-surface-z5 m-0 mb-3 text-xs uppercase tracking-widest font-semibold">
          Score Distribution by Group
        </h4>
        <BoxPlot
          data={chartData}
          x="category"
          y="score"
          fill={props.fillField || undefined}
          grid={props.grid}
          legend={props.legend}
          width={560}
          height={320}
        />
      </div>
    </div>
  {/snippet}

  {#snippet controls()}
    <FormRenderer bind:data={props} {schema} {layout} />
    <InfoField label="x" value="category" />
    <InfoField label="y" value="score (raw observations)" />
  {/snippet}

  {#snippet data()}
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-surface-z2 border-b">
            {#each Object.keys(chartData[0]) as col}
              <th class="text-surface-z4 py-1 pr-3 text-left font-medium">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each chartData as row}
            <tr class="border-surface-z2 border-b last:border-0">
              {#each Object.values(row) as val}
                <td class="py-1 pr-3">{val}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/snippet}
</PlaySection>
