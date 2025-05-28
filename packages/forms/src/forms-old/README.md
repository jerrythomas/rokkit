# Dynamic Forms Library

## Current Design Analysis

The Dynamic Forms Library is built to create and manage complex forms with configurable layouts, inputs, and schemas. It uses a component-based architecture with Svelte to render dynamic forms based on JSON schemas and layouts.

### Core Components

- **Form**: The top-level component that wraps the form structure and provides a submit button.
- **DataEditor**: Processes schema and layout information, setting up the registry of components.
- **FieldLayout**: Renders fields according to schema and layout configurations.
- **ListEditor**: Handles editing of array/list data.
- **CheckBox**, **Icon**, **Item**: Specialized input and display components.
- **Tabs**: Navigation component for forms with multiple sections.
- **Wrapper**: Layout wrapper for grouping fields.

### Architecture Patterns

1. **Registry Pattern**: Components are registered in a context accessible throughout the form hierarchy, allowing customization of renderers.
2. **Schema-Driven Rendering**: Forms are rendered based on schema definitions that describe data structure.
3. **Layout-Driven UI**: UI arrangement is determined by layout configurations separate from schema.
4. **Dynamic Type Handling**: Input components are selected based on field types defined in the schema.

### Key Concepts

#### Schema

Schema defines the structure and constraints of the data:

```javascript
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "number", "min": 0, "max": 100 },
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" }
      }
    }
  }
}
```

#### Layout

Layout defines how the form is rendered visually:

```javascript
{
  "type": "vertical",
  "elements": [
    {
      "scope": "#/name",
      "label": "Full Name"
    },
    {
      "scope": "#/age",
      "label": "Age"
    },
    {
      "type": "vertical",
      "scope": "#/address",
      "title": "Address",
      "elements": [
        { "scope": "#/address/street", "label": "Street" },
        { "scope": "#/address/city", "label": "City" }
      ]
    }
  ]
}
```

### Helper Utilities

- **deriveSchemaFromValue**: Automatically generates schema from a data value.
- **deriveLayoutFromValue**: Automatically generates layout from a data structure.
- **getSchemaWithLayout**: Combines schema and layout information.
- **flattenObject**, **flattenAttributes**: Utilities for nested data handling.

## Current Limitations and Gaps

1. **Validation**

   - No comprehensive validation framework
   - Missing client-side validation integration
   - No validation visualization in the UI
   - No support for conditional validation rules

2. **Internationalization**

   - No built-in support for label translations
   - Error messages are hard-coded without i18n support
   - No RTL layout support

3. **User Experience**

   - Limited feedback mechanisms for form state
   - No standardized approach for field-level help/tooltips
   - Lack of accessibility considerations in some components

4. **Data Handling**

   - List editing capabilities are basic
   - No built-in pagination for large lists
   - Limited tree navigation for hierarchical data
   - Missing handlers for add/delete operations in nested structures

5. **Component Integration**
   - Registration process for custom components is cumbersome
   - Component overriding mechanism could be simplified with snippets

## Proposed Redesign Approach

### Core Architecture

The redesigned forms library should maintain the separation of concerns between data schema, layout definition, and rendering components, while improving the integration points and adding new capabilities:

1. **Enhanced Registry System**

   - Leverage Svelte 5 snippets for component customization
   - Create a more flexible component registration system
   - Support for component-level props inheritance

2. **Validation Framework**

   - Integrate valibot for schema-based validation
   - Support for custom validation rules
   - Visual feedback for validation errors
   - Field-level and form-level validation

3. **Internationalization**

   - Pluggable translation system for labels, help text, and error messages
   - Support for RTL languages
   - Locale-aware formatting for dates, numbers, and currencies

4. **Layout Engines**

   - Base LayoutEngine for standard form rendering
   - WizardLayoutEngine for step-by-step form completion
   - ListEditor for array data editing with pagination
   - TreeNavigator for hierarchical data editing

5. **Advanced UI Features**
   - Form-level and field-level help systems
   - Interactive validation feedback
   - Conditional field visibility
   - Dynamic field dependencies

## Implementation Plan

### Phase 1: Core Forms Rendering

1. **Basic Form Renderer**

   - Vertical layout with field-label pairs
   - Support for all primitive data types
   - Basic validation using valibot
   - Form-level help component

   ```svelte
   <!-- Form.svelte -->
   <script>
     import { validate } from 'valibot'
     import FieldRenderer from './FieldRenderer.svelte'

     let {
       schema,
       layout,
       value = $bindable({}),
       helpText = '',
       onsubmit = $bindable(null)
     } = $props()

     let errors = $state({})

     function validateForm() {
       try {
         validate(schema, value)
         errors = {}
         return true
       } catch (validationErrors) {
         errors = validationErrors.reduce((acc, err) => {
           acc[err.path.join('.')] = err.message
           return acc
         }, {})
         return false
       }
     }

     function handleSubmit(e) {
       e.preventDefault()
       if (validateForm()) {
         onsubmit?.(value)
       }
     }
   </script>

   <form onsubmit={handleSubmit}>
     {#if helpText}
       <help-panel>{helpText}</help-panel>
     {/if}

     <FieldRenderer {schema} {layout} bind:value {errors} />

     <div class="form-controls">
       <slot name="controls">
         <button type="submit">Submit</button>
       </slot>
     </div>
   </form>
   ```

2. **Component Registration System**

   - Simplified registry using Svelte 5 snippets
   - Default component set for common input types
   - Documentation for component creation

   ```svelte
   <!-- FieldRenderer.svelte -->
   <script>
     import { getContext } from 'svelte'
     import DefaultField from './fields/DefaultField.svelte'

     // Accept registry from context or create default
     const registry = getContext('form-registry') || {
       components: {
         string: DefaultTextField,
         number: DefaultNumberField,
         boolean: DefaultCheckbox
         // Add more defaults...
       }
     }

     let {
       fieldType = 'string',
       path = [],
       schema = {},
       value = $bindable(null),
       errors = {}
     } = $props()

     // Get the appropriate component for this field type
     let Component = $derived(registry.components[fieldType] || DefaultField)

     // Format the field key for error lookup
     let fieldKey = $derived(path.join('.'))
     let fieldError = $derived(errors[fieldKey])
   </script>

   <div data-form-field data-error={fieldError ? 'true' : 'false'}>
     <Component bind:value {schema} {path} error={fieldError} />

     {#if fieldError}
       <div data-error-message>{fieldError}</div>
     {/if}
   </div>
   ```

   ```js
   // Example of registry setup with Svelte 5 snippets
   import { createRegistry } from './forms'

   const registry = createRegistry({
     components: {
       // Override default text field with custom component
       string: MyCustomTextField,

       // Use snippets for inline customization
       'custom-field': (props) => {
         const { label, value } = props

         return function CustomField() {
           return `
             <div class="custom-field">
               <label>{label}</label>
               <input type="text" bind:value />
             </div>
           `
         }
       }
     }
   })

   // Set registry to context
   setContext('form-registry', registry)
   ```

### Phase 2: Advanced Form Features

1. **Enhanced Layout Options**

   - Horizontal layouts
   - Grid-based layouts
   - Responsive layout adjustments
   - Tabs and accordion layouts for complex forms

   ```svelte
   <!-- LayoutRenderer.svelte -->
   <script>
     import { getContext } from 'svelte'
     import FieldRenderer from './FieldRenderer.svelte'

     let { layout, schema, value = $bindable({}), errors = {}, path = [] } = $props()

     const layouts = getContext('form-layouts') || {
       vertical: VerticalLayout,
       horizontal: HorizontalLayout,
       grid: GridLayout,
       tabs: TabsLayout,
       accordion: AccordionLayout
     }

     // Get appropriate layout component
     let LayoutComponent = $derived(layouts[layout.type] || layouts.vertical)

     function filterErrorsByPrefix(errors, prefix) {
       const result = {}
       for (const [key, value] of Object.entries(errors)) {
         if (key.startsWith(`${prefix}.`)) {
           result[key.substring(prefix.length + 1)] = value
         }
       }
       return result
     }
   </script>

   <div data-layout-container data-layout-type={layout.type}>
     <LayoutComponent {layout} {schema}>
       {#each layout.elements as element (element.key)}
         <div data-layout-element data-element-type={element.type} data-element-key={element.key}>
           {#if element.elements}
             <svelte:self
               layout={element}
               {schema}
               bind:value={value[element.key]}
               errors={filterErrorsByPrefix(errors, element.key)}
               path={[...path, element.key]}
             />
           {:else}
             <FieldRenderer
               fieldType={element.type}
               path={[...path, element.key]}
               schema={schema.properties[element.key]}
               bind:value={value[element.key]}
               {errors}
             />
           {/if}
         </div>
       {/each}
     </LayoutComponent>
   </div>
   ```

2. **Validation and Feedback**

   - Real-time validation with visual indicators
   - Field-level validation messages
   - Form-level validation summary
   - Custom validation rule support

   ```js
   // validation-schema.js
   import { object, string, number, minLength, maxValue, custom, validate } from 'valibot'
   import { m } from '@paraglide/messages'

   // Create schema with valibot and paraglide messages
   export const userSchema = object({
     name: string([minLength(2, m.validation_minLength({ field: m.fields_name(), length: 2 }))]),
     age: number([maxValue(120, m.validation_maxValue({ field: m.fields_age(), value: 120 }))]),
     email: string([
       custom(
         (email) => /^[^@]+@[^@]+\.[^@]+$/.test(email),
         m.validation_emailFormat({ field: m.fields_email() })
       )
     ])
   })

   // Create form validation wrapper using paraglide
   export function createValidator(schema) {
     function validateData(value) {
       try {
         validate(schema, value)
         return { valid: true, errors: {} }
       } catch (validationErrors) {
         const errors = validationErrors.reduce((acc, err) => {
           // Message function from paraglide is already translated
           const message = typeof err.message === 'function' ? err.message() : err.message

           acc[err.path.join('.')] = message
           return acc
         }, {})

         return { valid: false, errors }
       }
     }

     return { validate: validateData }
   }
   ```

3. **Internationalization with Paraglide**

   - Integration with Paraglide for compiled translations
   - Message functions for all text elements
   - Locale-specific formatting with parameters

   ```svelte
   <!-- TranslatedField.svelte -->
   <script>
     import { m } from '@paraglide/messages'

     let {
       fieldKey = '',
       label = '',
       helpText = '',
       placeholder = '',
       errorMessage = '',
       children
     } = $props()

     // Get field-specific translations from Paraglide
     let translatedLabel = $derived(() => {
       const msgKey = `fields_${fieldKey}_label`
       return msgKey in m ? m[msgKey]() : label
     })

     let translatedHelp = $derived(() => {
       const msgKey = `fields_${fieldKey}_help`
       return msgKey in m ? m[msgKey]() : helpText
     })

     let translatedPlaceholder = $derived(() => {
       const msgKey = `fields_${fieldKey}_placeholder`
       return msgKey in m ? m[msgKey]() : placeholder
     })

     // Error messages from validation are already translated function results
     let translatedError = $derived(errorMessage || '')
   </script>

   <div data-field data-field-key={fieldKey}>
     <label data-field-label>{translatedLabel}</label>
     {#if translatedHelp}
       <div data-field-help>{translatedHelp}</div>
     {/if}
     {@render children?.({ placeholder: translatedPlaceholder })}
     {#if translatedError}
       <div data-field-error>{translatedError}</div>
     {/if}
   </div>
   ```

### Phase 3: Complex Data Editing

1. **List Editor Engine**

   - Paginated list editing
   - Sorting and filtering capabilities
   - Bulk operations on list items
   - In-line item editing

   ```svelte
   <!-- ListEditor.svelte -->
   <script>
     import Pagination from './Pagination.svelte'
     import ListItem from './ListItem.svelte'
     import ItemEditor from './ItemEditor.svelte'

     let {
       items = $bindable([]),
       schema,
       pageSize = 10,
       sortField = $bindable(null),
       sortDirection = $bindable('asc'),
       onselect = $bindable(null),
       onupdate = $bindable(null),
       onremove = $bindable(null)
     } = $props()

     let currentPage = $state(0)
     let selectedItem = $state(null)
     let selectedIndex = $state(-1)
     let editMode = $state(false)

     // Calculate paginated items
     let start = $derived(currentPage * pageSize)
     let end = $derived(start + pageSize)
     let visibleItems = $derived(sortItems(items, sortField, sortDirection).slice(start, end))
     let totalPages = $derived(Math.ceil(items.length / pageSize))

     function sortItems(items, field, direction) {
       if (!field) return items

       return [...items].sort((a, b) => {
         const aValue = field.split('.').reduce((obj, key) => obj?.[key], a)
         const bValue = field.split('.').reduce((obj, key) => obj?.[key], b)

         if (aValue < bValue) return direction === 'asc' ? -1 : 1
         if (aValue > bValue) return direction === 'asc' ? 1 : -1
         return 0
       })
     }

     function selectItem(item, index) {
       selectedItem = item
       selectedIndex = index + start
       editMode = true
       onselect?.({ item, index: selectedIndex })
     }

     function saveItem() {
       if (selectedIndex >= 0) {
         items[selectedIndex] = selectedItem
         onupdate?.({ item: selectedItem, index: selectedIndex })
       }
       editMode = false
     }

     function addItem() {
       const newItem = {}
       items = [...items, newItem]
       selectItem(newItem, items.length - 1)
     }

     function removeItem(index) {
       const realIndex = index + start
       items = [...items.slice(0, realIndex), ...items.slice(realIndex + 1)]
       if (selectedIndex === realIndex) {
         selectedItem = null
         selectedIndex = -1
         editMode = false
       }
       onremove?.({ index: realIndex })
     }

     function handlePageChange(page) {
       currentPage = page
     }

     function toggleSortDirection() {
       sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
     }
   </script>

   <div data-list-editor>
     <div data-list-controls>
       <button data-control="add" onclick={addItem}>Add Item</button>

       <!-- Sorting controls -->
       <div data-sorting-controls>
         <select bind:value={sortField} data-sort-field-selector>
           <option value={null}>No sorting</option>
           {#each Object.keys(schema.properties) as field}
             <option value={field}>{field}</option>
           {/each}
         </select>

         <button data-sort-direction={sortDirection} onclick={toggleSortDirection}>
           {sortDirection === 'asc' ? '↑' : '↓'}
         </button>
       </div>
     </div>

     <div data-list-view>
       {#each visibleItems as item, index (index + start)}
         <ListItem
           {item}
           {schema}
           selected={index + start === selectedIndex}
           onclick={() => selectItem(item, index)}
           onremove={() => removeItem(index)}
           data-item-index={index + start}
           data-item-selected={index + start === selectedIndex ? 'true' : 'false'}
         />
       {/each}
     </div>

     <Pagination {currentPage} {totalPages} onchange={handlePageChange} data-pagination />

     {#if editMode && selectedItem}
       <ItemEditor
         bind:item={selectedItem}
         {schema}
         onsave={saveItem}
         oncancel={() => (editMode = false)}
       />
     {/if}
   </div>
   ```

2. **Tree Navigator Engine**

   - Hierarchical data visualization
   - Expand/collapse functionality
   - Context-aware operations
   - Path-based navigation

   ```svelte
   <!-- TreeNavigator.svelte -->
   <script>
     import TreeNode from './TreeNode.svelte'
     import ItemEditor from './ItemEditor.svelte'

     let {
       data = $bindable({}),
       schema,
       onselect = $bindable(null),
       onupdate = $bindable(null),
       getSchemaForPath = (schema, path) => schema // Default implementation
     } = $props()

     let expandedPaths = $state(new Set(['/']))
     let selectedPath = $state(null)
     let selectedItem = $state(null)

     function toggleNode(path) {
       if (expandedPaths.has(path)) {
         expandedPaths.delete(path)
       } else {
         expandedPaths.add(path)
       }
     }

     function selectNode(path, item) {
       selectedPath = path
       selectedItem = item
       onselect?.({ path, item })
     }

     function updateNode() {
       if (selectedPath && selectedItem) {
         // Update the data at the selected path
         let current = data
         const pathParts = selectedPath.split('/').filter(Boolean)

         // Navigate to the parent object
         for (let i = 0; i < pathParts.length - 1; i++) {
           current = current[pathParts[i]]
         }

         // Update the selected item
         if (pathParts.length > 0) {
           const lastKey = pathParts[pathParts.length - 1]
           current[lastKey] = selectedItem
         }

         onupdate?.({ path: selectedPath, item: selectedItem })
       }
     }
   </script>

   <div class="tree-navigator">
     <div class="tree-view">
       <TreeNode
         path="/"
         node={data}
         {schema}
         expanded={expandedPaths.has('/')}
         selected={selectedPath === '/'}
         ontoggle={() => toggleNode('/')}
         onselect={() => selectNode('/', data)}
         {expandedPaths}
         {toggleNode}
         {selectNode}
       />
     </div>

     {#if selectedPath && selectedItem}
       <div class="item-editor">
         <ItemEditor
           bind:item={selectedItem}
           schema={getSchemaForPath(schema, selectedPath)}
           onsave={updateNode}
         />
       </div>
     {/if}
   </div>
   ```

### Phase 4: Smart Form Interactions

1. **Wizard Layout Engine**

   - Step-by-step form completion
   - Progress tracking
   - Conditional step navigation
   - Summary view

   ```svelte
   <!-- WizardForm.svelte -->
   <script>
     import { validate } from 'valibot'
     import StepRenderer from './StepRenderer.svelte'

     let { steps = [], value = $bindable({}), oncomplete = $bindable(null) } = $props()

     let currentStepIndex = $state(0)
     let completedSteps = $state(new Set())
     let errors = $state({})

     let currentStep = $derived(steps[currentStepIndex])
     let isFirstStep = $derived(currentStepIndex === 0)
     let isLastStep = $derived(currentStepIndex === steps.length - 1)
     let progress = $derived((completedSteps.size / steps.length) * 100)

     // Check if we can navigate to a specific step (conditional navigation)
     function canGoToStep(step, index) {
       // If step depends on previous steps being completed
       if (step.requirePreviousSteps) {
         for (let i = 0; i < index; i++) {
           if (!completedSteps.has(i)) return false
         }
       }

       // If step has custom condition function
       if (step.condition && !step.condition(value)) {
         return false
       }

       return true
     }

     // Validate current step and mark as completed if valid
     function validateCurrentStep() {
       try {
         if (currentStep.schema) {
           // Extract relevant portion of data for this step
           const stepData = currentStep.fields.reduce((acc, field) => {
             acc[field] = value[field]
             return acc
           }, {})

           validate(currentStep.schema, stepData)
         }

         completedSteps.add(currentStepIndex)
         errors = {}
         return true
       } catch (validationErrors) {
         errors = validationErrors.reduce((acc, err) => {
           acc[err.path.join('.')] = err.message
           return acc
         }, {})
         return false
       }
     }

     function goToNextStep() {
       if (validateCurrentStep() && !isLastStep) {
         let nextIndex = currentStepIndex + 1

         // Find next available step
         while (nextIndex < steps.length && !canGoToStep(steps[nextIndex], nextIndex)) {
           nextIndex++
         }

         if (nextIndex < steps.length) {
           currentStepIndex = nextIndex
         }
       }
     }

     function goToPreviousStep() {
       if (!isFirstStep) {
         let prevIndex = currentStepIndex - 1

         // Find previous available step
         while (prevIndex >= 0 && !canGoToStep(steps[prevIndex], prevIndex)) {
           prevIndex--
         }

         if (prevIndex >= 0) {
           currentStepIndex = prevIndex
         }
       }
     }

     function complete() {
       if (validateCurrentStep()) {
         oncomplete?.(value)
       }
     }

     function handleStepClick(step, i) {
       if (canGoToStep(step, i)) {
         currentStepIndex = i
       }
     }
   </script>

   <div data-wizard-form>
     <div data-progress-bar>
       <div data-progress style="width: {progress}%"></div>
     </div>

     <div data-step-indicators>
       {#each steps as step, i}
         <div
           data-step-indicator
           data-active={i === currentStepIndex ? 'true' : 'false'}
           data-completed={completedSteps.has(i) ? 'true' : 'false'}
           data-disabled={!canGoToStep(step, i) ? 'true' : 'false'}
           onclick={() => handleStepClick(step, i)}
         >
           {i + 1}. {step.title}
         </div>
       {/each}
     </div>

     <div data-step-content>
       <h2>{currentStep.title}</h2>

       <StepRenderer step={currentStep} bind:value {errors} />
     </div>

     <div data-step-controls>
       {#if !isFirstStep}
         <button data-control="previous" onclick={goToPreviousStep}>Previous</button>
       {/if}

       {#if isLastStep}
         <button data-control="complete" onclick={complete}>Complete</button>
       {:else}
         <button data-control="next" onclick={goToNextStep}>Next</button>
       {/if}
     </div>
   </div>
   ```

2. **AI-Assisted Form Filling**

   - Chat interface for data input
   - Natural language parsing of user input
   - Schema-based data normalization
   - Validation guidance for users

   ```svelte
   <!-- AIChatForm.svelte -->
   <script>
     import { validate } from 'valibot'
     import FormPreview from './FormPreview.svelte'

     let { schema, value = $bindable({}), apiEndpoint = '/api/chat' } = $props()

     let messages = $state([
       {
         role: 'system',
         content:
           'I can help you fill out this form. Just tell me what information you want to provide.'
       }
     ])
     let userInput = $state('')
     let isProcessing = $state(false)
     let errors = $state({})

     // Function to validate the current form data
     function validateForm() {
       try {
         validate(schema, value)
         errors = {}
         return { valid: true }
       } catch (validationErrors) {
         errors = validationErrors.reduce((acc, err) => {
           acc[err.path.join('.')] = err.message
           return acc
         }, {})
         return { valid: false, errors }
       }
     }

     // Get missing fields that need to be filled
     function getMissingFields() {
       const required = schema.required || Object.keys(schema.properties)
       return required.filter(
         (field) => !value[field] || (errors[field] && errors[field].length > 0)
       )
     }

     async function sendMessage() {
       if (!userInput.trim()) return

       // Add user message to conversation
       messages = [...messages, { role: 'user', content: userInput }]

       const currentInput = userInput
       userInput = ''
       isProcessing = true

       try {
         // Send message to AI service with current form context
         const response = await fetch(apiEndpoint, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             messages,
             schema,
             currentValue: value,
             errors
           })
         })

         if (!response.ok) throw new Error('Failed to get response')

         const data = await response.json()

         // Update conversation with AI response
         messages = [...messages, { role: 'assistant', content: data.message }]

         // Update form data if AI provided values
         if (data.formData) {
           value = { ...value, ...data.formData }
           validateForm()
         }
       } catch (error) {
         messages = [
           ...messages,
           { role: 'assistant', content: 'Sorry, I had trouble processing that. Please try again.' }
         ]
       } finally {
         isProcessing = false
       }
     }

     // Generate helpful prompt based on current form state using Paraglide messages
     function generateHelpPrompt() {
       const missing = getMissingFields()
       if (missing.length === 0) {
         return m.form_complete()
       } else {
         return m.missing_fields({
           fields: missing
             .map((field) => {
               const fieldKey = `fields_${field}`
               return fieldKey in m ? m[fieldKey]() : field
             })
             .join(', ')
         })
       }
     }

     function handleKeydown(e) {
       if (e.key === 'Enter') {
         sendMessage()
       }
     }
   </script>

   <div data-ai-chat-form>
     <div data-form-preview>
       <FormPreview {value} {schema} {errors} />
     </div>

     <div data-chat-interface>
       <div data-messages>
         {#each messages as message}
           <div data-message data-role={message.role}>
             <p>{message.content}</p>
           </div>
         {/each}

         {#if isProcessing}
           <div data-message data-role="assistant" data-thinking="true">
             <p>Thinking...</p>
           </div>
         {/if}
       </div>

       <div data-help-prompt>
         {generateHelpPrompt()}
       </div>

       <div data-input-area>
         <input
           bind:value={userInput}
           placeholder="Tell me what information you want to provide..."
           onkeydown={handleKeydown}
           data-chat-input
         />
         <button
           onclick={sendMessage}
           disabled={isProcessing}
           data-send-button
           data-processing={isProcessing ? 'true' : 'false'}>Send</button
         >
       </div>
     </div>
   </div>
   ```

## Integration with External Libraries

- **Valibot**: For schema validation
- **@rokkit/forms**: For base input components
- **@rokkit/core**: For utility functions
- **i18next** (suggested): For internationalization

## Directory Structure

```
/forms
├── README.md                 # Documentation
├── Form.svelte               # Main Form component
├── FormBuilder.svelte        # UI for creating forms (future)
├── LayoutEngine.svelte       # Layout rendering engine
├── components/               # Form components
│   ├── fields/               # Field components
│   │   ├── TextField.svelte      # Text input
│   │   ├── NumberField.svelte    # Number input
│   │   ├── SelectField.svelte    # Select dropdown
│   │   ├── CheckboxField.svelte  # Checkbox input
│   │   └── ...                   # Other input types
│   ├── layout/               # Layout components
│   │   ├── VerticalLayout.svelte    # Vertical field arrangement
│   │   ├── HorizontalLayout.svelte  # Horizontal field arrangement
│   │   ├── GridLayout.svelte        # Grid-based layout
│   │   ├── TabsLayout.svelte        # Tabbed interface
│   │   └── AccordionLayout.svelte   # Accordion interface
│   └── navigation/           # Navigation components
│       ├── Pagination.svelte     # Pagination controls
│       └── TreeView.svelte       # Tree navigation
├── engines/                  # Specialized form engines
│   ├── WizardEngine.svelte       # Step-by-step form
│   ├── ListEngine.svelte         # List editing
│   ├── TreeEngine.svelte         # Tree data editing
│   └── AIChatEngine.svelte       # AI-assisted form filling
├── lib/                      # Utility libraries
│   ├── schema.js                 # Schema utilities
│   ├── layout.js                 # Layout utilities
│   ├── validation.js             # Validation utilities
│   └── translation.js            # Paraglide integration utilities
├── types/                    # TypeScript type definitions
│   ├── schema.d.ts               # Schema types
│   ├── layout.d.ts               # Layout types
│   └── validation.d.ts           # Validation types
└── themes/                   # Styling examples and utilities
    ├── default.css               # Default theme
    ├── dark.css                  # Dark theme
    └── README.md                 # Documentation on data attributes
```

## Migration Strategy

The implementation should aim for incremental improvements while maintaining backward compatibility where possible:

1. **Parallel Implementation**:

   - Create new components alongside existing ones
   - Keep backward compatibility with current schema and layout formats
   - Add new features incrementally

2. **Adapters and Utilities**:

   ```javascript
   // Example schema adapter
   export function adaptLegacySchema(legacySchema) {
     return {
       type: 'object',
       properties: Object.entries(legacySchema.properties).reduce((acc, [key, prop]) => {
         acc[key] = {
           type: prop.type,
           ...prop
         }
         return acc
       }, {})
     }
   }

   // Example layout adapter
   export function adaptLegacyLayout(legacyLayout) {
     return {
       type: legacyLayout.type || 'vertical',
       elements: legacyLayout.elements.map((element) => ({
         key: element.key,
         type: element.props?.type || 'string',
         label: element.props?.label || element.key,
         ...element
       }))
     }
   }
   ```

3. **Documentation**:

   - Provide clear examples of old vs. new formats
   - Create migration guides for each component
   - Include codemod scripts for automated migration when possible

4. **Feature Flags**:

   ```javascript
   // Example usage with feature flags
   import Form from './forms/Form.svelte'

   const form = new Form({
     target: document.body,
     props: {
       schema: mySchema,
       layout: myLayout,
       value: myData,
       features: {
         useNewValidation: true,
         useNewLayoutEngine: false,
         useI18n: true
       }
     }
   })
   ```

## Getting Started Example

```svelte
<script>
  import { Form } from './forms'
  import { object, string, number, minValue } from 'valibot'

  // Define schema
  const schema = object({
    name: string(),
    age: number([minValue(18)])
  })

  // Define layout
  const layout = {
    type: 'vertical',
    elements: [
      {
        key: 'name',
        label: 'Full Name',
        placeholder: 'Enter your name'
      },
      {
        key: 'age',
        label: 'Age',
        type: 'number',
        min: 18
      }
    ]
  }

  // Initial data
  let formData = $state({
    name: '',
    age: null
  })

  function handleSubmit(data) {
    console.log('Form submitted:', data)
    // Process form data...
  }

  const helpText = 'Please fill out all fields to continue.'

  function Controls() {
    return `
      <button type="button">Cancel</button>
      <button type="submit">Submit</button>
    `
  }
</script>

<Form {schema} {layout} bind:value={formData} onsubmit={handleSubmit} {helpText}>
  {@render Controls()}
</Form>
```

## Core Concepts

### Schema

The schema defines the data structure and validation rules:

```javascript
// Basic schema
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2 },
    age: { type: 'number', min: 0, max: 120 },
    email: { type: 'string', format: 'email' }
  },
  required: ['name', 'email']
}

// With valibot integration
import { object, string, number, minLength, maxValue, email } from 'valibot'

const valiSchema = object({
  name: string([minLength(2)]),
  age: number([maxValue(120)]),
  email: string([email()])
})
```

### Layout

The layout defines how fields are rendered and organized:

```javascript
// Basic vertical layout
const layout = {
  type: 'vertical',
  elements: [
    { key: 'name', label: 'Full Name' },
    { key: 'age', label: 'Age', help: 'Must be between 0-120' },
    { key: 'email', label: 'Email Address' }
  ]
}

// Complex nested layout with different layout types
const advancedLayout = {
  type: 'vertical',
  elements: [
    { key: 'title', label: 'Title', component: 'select' },
    {
      type: 'horizontal',
      elements: [
        { key: 'firstName', label: 'First Name', span: 6 },
        { key: 'lastName', label: 'Last Name', span: 6 }
      ]
    },
    {
      type: 'tabs',
      elements: [
        {
          title: 'Contact Information',
          type: 'vertical',
          elements: [
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' }
          ]
        },
        {
          title: 'Address',
          type: 'vertical',
          elements: [
            { key: 'address.street', label: 'Street' },
            {
              type: 'horizontal',
              elements: [
                { key: 'address.city', label: 'City', span: 6 },
                { key: 'address.state', label: 'State', span: 3 },
                { key: 'address.zip', label: 'ZIP', span: 3 }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### Component Registry

The component registry allows customization of rendering:

```javascript
// Example registry setup
const registry = {
  // Field components
  components: {
    string: DefaultTextField,
    number: DefaultNumberField,
    boolean: DefaultCheckbox,
    date: DatePicker,
    'custom-rating': StarRating
  },

  // Layout components
  layouts: {
    vertical: VerticalLayout,
    horizontal: HorizontalLayout,
    tabs: TabsLayout
  },

  // Navigation components
  navigation: {
    pagination: Pagination,
    tree: TreeView
  }
}
```

## Conclusion

The current forms library provides a solid foundation but requires significant enhancements to address validation, internationalization, and complex data editing needs. By leveraging Svelte 5 features like snippets and maintaining a clear separation between schema, layout, and rendering concerns, the redesigned library can offer a more flexible, robust solution for dynamic form creation and management.

This implementation plan provides a roadmap from simple forms to complex, AI-assisted form filling, with a focus on modularity, extensibility, and user experience. The incremental approach allows for testing and refinement at each phase while building towards a comprehensive form solution.
