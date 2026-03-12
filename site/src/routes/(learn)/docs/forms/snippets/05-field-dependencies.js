// Country → City cascade
const lookups = {
  city: createLookup({
    url: '/api/cities?country={country}',
    dependsOn: ['country'],
    fields: { label: 'name', value: 'id' }
  })
}

// When 'country' changes:
// 1. city value is cleared
// 2. city options re-fetch with new country
// 3. city field is disabled until country has a value
