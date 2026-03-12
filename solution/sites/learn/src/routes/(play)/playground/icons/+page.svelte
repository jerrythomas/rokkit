<script>
  // @ts-nocheck
  import authIcons from '@rokkit/icons/auth.json'
  import appIcons from '@rokkit/icons/app.json'
  import componentIcons from '@rokkit/icons/components.json'
  import baseIcons from '@rokkit/icons/ui.json'
  import solidIcons from '@rokkit/icons/solid.json'
  import lightIcons from '@rokkit/icons/light.json'

  const AUTH_CATEGORIES = {
    'Auth Platforms': ['supabase', 'firebase', 'convex', 'auth0', 'amplify', 'cognito',
      'clerk', 'okta', 'keycloak', 'nextauth', 'pocketbase', 'appwrite', 'azure', 'microsoft'],
    'Social Auth': ['google', 'github', 'apple', 'twitter', 'facebook'],
    'Auth Methods': ['email', 'phone', 'password', 'magic', 'incognito', 'authy', 'passkey', 'mfa']
  }

  const VARIANT_ORDER = ['', '-white', '-black', '-outline', '-duotone', '-duotone-outline',
    '-logo', '-logo-white', '-logo-black', '-wordmark', '-wordmark-white']

  function getAuthFamilies(bases, icons) {
    return bases.map((base) => {
      const variants = VARIANT_ORDER
        .map((suffix) => ({ suffix, key: base + suffix, icon: icons[base + suffix] }))
        .filter((v) => v.icon)
      return { base, variants }
    }).filter((f) => f.variants.length > 0)
  }

  function iconList(collection) {
    return Object.entries(collection.icons).map(([name, icon]) => ({ name, icon }))
  }

  let copied = $state(null)

  function copyName(prefix, name) {
    const cls = `i-${prefix}:${name}`
    navigator.clipboard.writeText(cls)
    copied = cls
    setTimeout(() => (copied = null), 1500)
  }

  const TABS = ['Auth', 'App', 'Components', 'Base', 'Solid', 'Light']
  let activeTab = $state('Auth')
  let search = $state('')

  function filtered(list) {
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter((i) => i.name.includes(q))
  }

  function iconSVG(icon, collection) {
    const w = icon.width ?? collection.width ?? 24
    const h = icon.height ?? collection.height ?? 24
    return `<svg width="24" height="${Math.round(24 * h / w)}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg">${icon.body}</svg>`
  }

  const COLLECTIONS = {
    Auth:       { collection: authIcons,      prefix: 'logo' },
    App:        { collection: appIcons,        prefix: 'app' },
    Components: { collection: componentIcons,  prefix: 'component' },
    Base:       { collection: baseIcons,       prefix: 'base' },
    Solid:      { collection: solidIcons,      prefix: 'solid' },
    Light:      { collection: lightIcons,      prefix: 'light' },
  }
</script>

<div class="p-6 space-y-6 min-h-0">
  <div class="flex items-center justify-between gap-4">
    <div>
      <h1 class="text-xl font-semibold text-surface-z8">Icon Browser</h1>
      <p class="text-sm text-surface-z5 mt-0.5">Click any icon to copy its class name</p>
    </div>
    {#if copied}
      <div class="text-xs bg-success-z3 text-success-z8 px-3 py-1.5 rounded-md font-mono transition-opacity">
        Copied: {copied}
      </div>
    {/if}
  </div>

  <div class="flex gap-1 border-b border-surface-z3">
    {#each TABS as tab (tab)}
      <button
        class="px-4 py-2 text-sm font-medium rounded-t-md transition-colors {activeTab === tab
          ? 'bg-surface-z2 text-surface-z8 border border-b-0 border-surface-z3'
          : 'text-surface-z5 hover:text-surface-z7'}"
        onclick={() => { activeTab = tab; search = '' }}
      >{tab}</button>
    {/each}
  </div>

  {#if activeTab === 'Auth'}
    {#each Object.entries(AUTH_CATEGORIES) as [category, bases] (category)}
      {@const families = getAuthFamilies(bases, authIcons.icons)}
      {#if families.length}
        <section class="space-y-3">
          <h2 class="text-xs font-semibold text-surface-z5 uppercase tracking-widest">{category}</h2>
          <div class="space-y-2">
            {#each families as family (family.base)}
              <div class="flex items-center gap-1 flex-wrap">
                <span class="text-xs text-surface-z4 w-28 shrink-0 font-mono">{family.base}</span>
                {#each family.variants as v (v.key)}
                  <button
                    class="group relative flex items-center justify-center w-10 h-10 rounded-md
                      bg-surface-z2 hover:bg-surface-z3 border border-transparent hover:border-surface-z4 transition-colors"
                    title={v.key}
                    onclick={() => copyName('logo', v.key)}
                  >
                    {@html iconSVG(v.icon, authIcons)}
                    <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-surface-z4
                      whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {v.suffix || 'default'}
                    </span>
                  </button>
                {/each}
              </div>
            {/each}
          </div>
        </section>
      {/if}
    {/each}

  {:else}
    {@const { collection, prefix } = COLLECTIONS[activeTab]}
    {@const icons = filtered(iconList(collection))}
    <div class="flex items-center gap-3">
      <input
        bind:value={search}
        placeholder="Search icons…"
        class="w-64 px-3 py-1.5 text-sm rounded-md bg-surface-z2 border border-surface-z3
          text-surface-z8 placeholder:text-surface-z4 focus:outline-none focus:border-primary-z5"
      />
      <span class="text-xs text-surface-z4">{icons.length} icons</span>
    </div>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
      {#each icons as { name, icon } (name)}
        <button
          class="flex flex-col items-center gap-1.5 p-2 rounded-md bg-surface-z2
            hover:bg-surface-z3 border border-transparent hover:border-surface-z4 transition-colors group"
          title="i-{prefix}:{name}"
          onclick={() => copyName(prefix, name)}
        >
          <div class="flex items-center justify-center w-8 h-8">
            {@html iconSVG(icon, collection)}
          </div>
          <span class="text-[10px] text-surface-z5 group-hover:text-surface-z7 text-center
            leading-tight break-all line-clamp-2 font-mono">{name}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
