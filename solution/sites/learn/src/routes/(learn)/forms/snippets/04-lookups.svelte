import { createLookup } from '@rokkit/forms'

const lookups = {
  // URL template — interpolates field values
  city: createLookup({
    url: '/api/cities?country={country}',
    dependsOn: ['country']
  }),

  // Async fetch hook — full control
  department: createLookup({
    fetch: async (formData) => {
      const res = await fetch(`/api/departments/${formData.company}`)
      return res.json()
    },
    dependsOn: ['company']
  }),

  // Client-side filter — no network request
  filteredRole: createLookup({
    source: allRoles,
    filter: (source, formData) =>
      source.filter(r => r.level <= formData.accessLevel)
  })
}

<FormRenderer bind:data {schema} {lookups} />
