# @rokkit/ui

A collection of data-driven UI components for Svelte applications that improve developer experience.

## Installation

```sh
npm install @rokkit/ui
```

or

```sh
bun add @rokkit/ui
```

## Components

### Basic Components

- **Button** - Versatile button component with support for variants, icons, and different button types
- **Icon** - Display icons with consistent styling
- **Item** - Base component for displaying individual items within lists
- **Pill** - Compact label component for status indicators or tags
- **ProgressBar** - Visual indicator of progress or completion
- **Separator** - Visual divider between content sections
- **Connector** - Visual connector between elements
- **Summary** - Display summary information
- **ValidationReport** - Display validation results and error messages

### Layout Components

- **Accordion** - Collapsible content panels
- **Card** - Container for displaying content with consistent styling
- **ResponsiveGrid** - Grid layout that adjusts based on screen size
- **SlidingColumns** - Multi-column layout with sliding navigation
- **Tabs** - Tabbed interface for organizing content
- **Overlay** - Modal overlay for dialogs and popups
- **Message** - Styled message display

### Navigation Components

- **BreadCrumbs** - Navigation breadcrumb trail
- **Link** - Styled link component
- **PageNavigator** - Component for paginating through content
- **NestedPaginator** - Pagination for nested data structures

### Form Components

- **InputField** - Base component for form inputs
- **Form** - Container for form elements with built-in validation
- **FieldLayout** - Layout component for form fields
- **CheckBox** - Checkbox input component
- **RadioGroup** - Group of radio button options
- **Toggle** - Toggle switch component
- **Switch** - Switch control component
- **Select** - Dropdown select component
- **MultiSelect** - Multiple selection dropdown component
- **DropDown** - Dropdown menu component
- **DropSearch** - Searchable dropdown component
- **Range** - Range selection component
- **RangeMinMax** - Range with minimum and maximum values
- **RangeSlider** - Slider control for selecting from a range
- **RangeTick** - Range with tick marks
- **Calendar** - Date selection calendar
- **Rating** - Star rating component

### Data Components

- **DataEditor** - Component for editing structured data
- **ListEditor** - Component for editing lists
- **NestedEditor** - Component for editing nested data structures
- **List** - Display a list of items
- **ListBody** - Container for list items
- **NestedList** - Display nested/hierarchical lists
- **Table** - Table component for structured data (alias for TreeTable)
- **TreeTable** - Table component with support for hierarchical data
- **Tree** - Tree view for hierarchical data
- **Node** - Individual node within a tree

### Progress & Navigation Components

- **Stepper** - Step-by-step process indicator
- **ProgressDots** - Progress indicator using dots
- **Carousel** - Image or content carousel

### Visual Effect Components

- **Shine** - Add shine effect to elements
- **Tilt** - Add tilt effect to elements
- **Scrollable** - Scrollable container with custom scrollbars

### Theme Components

- **ToggleThemeMode** - Toggle between light and dark themes

## Usage Example

```svelte
<script>
  import { Button, Icon, Card } from '@rokkit/ui'
</script>

<Card>
  <h2>Example Card</h2>
  <p>This is an example of using the Card component</p>
  <Button variant="primary" label="Click Me" leftIcon="check" />
</Card>
```

## Dependencies

- @rokkit/actions
- @rokkit/core
- @rokkit/data
- @rokkit/input
- @rokkit/states
- d3-scale
- date-fns
- ramda

## License

MIT
