import { FormBuilder } from '@rokkit/forms'

const builder = new FormBuilder(data, schema, layout, lookups)

// Read/write fields
builder.updateField('#/email', 'alice@example.com')
builder.getValue('#/email')

// Validation
builder.validate()          // Validate all fields
builder.isValid             // true/false
builder.errors              // [{ path, text }, ...]

// Dirty tracking
builder.isDirty             // Any field changed?
builder.dirtyFields         // Set of changed paths
builder.reset()             // Reset to initial values
builder.snapshot()          // Update baseline (after save)

// Pass to FormRenderer
<FormRenderer {builder} />
