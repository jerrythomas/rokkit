// Public surface for `@rokkit/graph/schema` — the ER/schema-flavoured views.

export { default as EntityView } from './EntityView.svelte'
export { default as EntitiesView } from './EntitiesView.svelte'
export { default as NoteBlocks } from './NoteBlocks.svelte'
export { SCHEMA_FIELDS, fromSchemaModel } from './fromSchemaModel.js'
export { inlineSegs, noteBlocks } from './notes.js'
export { baseType, typeSize } from './column-type.js'
export type { Block, Seg } from './notes.js'
