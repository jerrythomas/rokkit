# Navigator

The Navigator Action is a utility designed to facilitate keyboard and click navigation within various UI components such as lists, trees, or tables. It aims to provide a consistent and intuitive way for users to navigate through items, select/deselect them, and perform actions based on user inputs.

## Key Goals

- Modularity: The navigator action should be modular and easily adaptable to different UI components and navigation requirements.
- Customizability: Users should be able to configure navigation behavior and options according to specific needs.
- Accessibility: The action should enhance accessibility by providing keyboard navigation support for users who rely on keyboard input.
- Efficiency: Navigation should be efficient, allowing users to quickly move through items, select/deselect them, and perform actions with minimal effort.

## Interaction Flow

1. Keyboard Navigation: Users can navigate through items using arrow keys, page up/down, home/end keys.
2. Selection: Single-clicking on an item selects/deselects it.
3. Expansion/Collapse: Arrow keys, double-clicks, or specific keys like Right/Left arrows expand or collapse items with hierarchical structures.
4. Efficient Navigation: Page up/down keys allow users to navigate through items efficiently, especially in long lists or tables.
5. Drag and Drop: When enabled, users can drag items within the component and drop them onto valid targets.
6. Multi-Select: When multi-select mode is enabled, users can select multiple items using Shift key and arrow keys or mouse click.
7. Modifier Keys: Users can use modifier keys like Shift or Ctrl to modify selection behavior.

## Supported Events and Actions

### Keyboard Events

- Arrow Up
- Arrow Down
- Arrow Right
- Arrow Left
- Page Up
- Page Down
- Home
- End
- Enter/Return

### Extended Selection with Shift Key

- Shift + Arrow Down - In a grid, this will select the next row.
- Shift + Arrow Up - In a grid, this will select the previous row.
- Shift + Arrow Right - In a grid, this will select the next cell
- Shift + Arrow Left - In a grid, this will select the previous cell
- Shift + Page Down - In a grid, this will select the next page of rows.
- Shift + Page Up - In a grid, this will select the previous page of rows.
- Shift + Home
- Shift + End
- Ctrl/Meta + 'X' (Cut)
- Ctrl/Meta + 'C' (Copy)
- Ctrl/Meta + 'V' (Paste)

### Click Events

- Single Click
- Modifier Keys (Shift or Ctrl)
- DoubleClick
- Drag and Drop

## Options

- Multi-Select (default: `false`)
- Page Size (default: 10)
- Allow Drag (default: `false`)
- Allow Drop (default: `false`)
- horizontal (default: `false`)
- vertical (default: `true`)

## Events

- `select`: Triggered when an item is selected.
- `change`: Triggered when the selection changes.
- `expand`: Triggered when an item is expanded.
- `collapse`: Triggered when an item is collapsed.
- `dragstart`: Triggered when an item is dragged.
- `dragover`: Triggered when an item is dragged over a valid drop target.
- `drop`: Triggered when an item is dropped onto a valid target.

## Implementation Considerations

- Maintain a reference to the first clicked or selected item when Shift key is pressed.
- Track the direction of navigation (up or down) to determine which items to include in the selection.
- Update the selection dynamically as the user navigates with arrow keys while holding down the Shift key.
- Implement event handlers for drag start, drag over, and drop events.
- Determine valid drop targets based on the UI component's structure and state.
- Update the component's state based on drag and drop interactions.
- Offload state management to the store or parent component to ensure consistency across multiple instances of the navigator action.
