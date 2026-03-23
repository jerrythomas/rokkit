<script>
  // @ts-nocheck
  import { BubbleChart } from '@rokkit/chart'
  import { FormRenderer, InfoField } from '@rokkit/forms'
  import PlaySection from '$lib/components/PlaySection.svelte'

  const chartData = [
    { country: 'USA',     gdp: 63000, lifeExp: 78, population: 331, region: 'Americas' },
    { country: 'China',   gdp: 10500, lifeExp: 77, population: 1411, region: 'Asia' },
    { country: 'Germany', gdp: 46000, lifeExp: 81, population: 83,   region: 'Europe' },
    { country: 'India',   gdp: 2100,  lifeExp: 70, population: 1393, region: 'Asia' },
    { country: 'Brazil',  gdp: 7700,  lifeExp: 75, population: 214,  region: 'Americas' },
    { country: 'France',  gdp: 42000, lifeExp: 82, population: 68,   region: 'Europe' },
    { country: 'Nigeria', gdp: 2100,  lifeExp: 55, population: 211,  region: 'Africa' },
    { country: 'Japan',   gdp: 40000, lifeExp: 84, population: 125,  region: 'Asia' },
    { country: 'Mexico',  gdp: 9900,  lifeExp: 75, population: 130,  region: 'Americas' },
    { country: 'Egypt',   gdp: 3600,  lifeExp: 72, population: 102,  region: 'Africa' },
    { country: 'UK',      gdp: 40000, lifeExp: 81, population: 68,   region: 'Europe' },
    { country: 'South Korea', gdp: 31000, lifeExp: 83, population: 52, region: 'Asia' }
  ]

  let props = $state({ colorField: 'region', symbolField: '', grid: true, legend: true })

  const schema = {
    type: 'object',
    properties: {
      colorField: { type: 'string' },
      symbolField: { type: 'string' },
      grid: { type: 'boolean' },
      legend: { type: 'boolean' }
    }
  }

  const layout = {
    type: 'vertical',
    elements: [
      { scope: '#/colorField',  label: 'color',  props: { options: ['', 'region'] } },
      { scope: '#/symbolField', label: 'symbol', props: { options: ['', 'region'] } },
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
          GDP vs Life Expectancy (bubble = population)
        </h4>
        <BubbleChart
          data={chartData}
          x="gdp"
          y="lifeExp"
          size="population"
          color={props.colorField || undefined}
          symbol={props.symbolField || undefined}
          grid={props.grid}
          legend={props.legend}
          width={560}
          height={380}
        />
      </div>
    </div>
  {/snippet}

  {#snippet controls()}
    <FormRenderer bind:data={props} {schema} {layout} />
    <InfoField label="x" value="gdp" />
    <InfoField label="y" value="lifeExp" />
    <InfoField label="size" value="population" />
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
