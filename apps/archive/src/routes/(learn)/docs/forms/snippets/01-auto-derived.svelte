const data = { count: 25, name: 'Alice', active: true }

// Auto-derived schema:
// { type: 'object', properties: {
//   count: { type: 'integer' },
//   name: { type: 'string' },
//   active: { type: 'boolean' }
// } }

<FormRenderer bind:data />
