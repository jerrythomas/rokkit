/**
 * @typedef {Object.<string, Function>} EventHandlers
 * An object where keys are event names and values are event handler functions.
 */

/**
 * Component map to be used to render the item.
 * @typedef {Object<string, import('svelte').SvelteComponent>} ComponentMap
 */

/**
 * Options for the sort order of the column.
 *
 * @typedef {'ascending'|'descending'|'none'} SortOptions
 */

/**
 * @typedef {'checked'|'unchecked'|'indeterminate'} SelectionState
 */

/**
 * Options for the horizontal alignment of the column content.
 *
 * @typedef {'left'|'middle'|'right'} HorizontalAlignOptions
 */

/**
 * Options for the action type of the column.
 *
 * @typedef {'select'|'edit'|'delete'} ActionTypes
 */

/**
 * Structure to map custom fields for rendering. This is used to identofy the attributes for various purposes.
 *
 * @typedef FieldMapping
 * @property {string} [id='id']              Unique id for the item
 * @property {string} [text='text']          the text to render
 * @property {string} [value='value']        the value associated with the item
 * @property {string} [url='url']            a URL
 * @property {string} [icon='icon']          icon to render
 * @property {string} [image='image']        the image to render
 * @property {string} [children='children']  children of the item
 * @property {string} [summary='summary']    summary of the item
 * @property {string} [notes='notes']        notes for the item
 * @property {string} [props='props']        additional properties
 * @property {string} [isOpen='_open']       item is open or closed
 * @property {string} [level='level']        level of item
 * @property {string} [parent='parent']      item is a parent
 * @property {string} [currency='currency]   column specifying currency to be used for the current value
 * @property {string} [isDeleted='_deleted'] item is deleted
 * @property {FieldMapping} [fields]         Field mapping to be used on children in the next level
 */

/**
 * Column metadata for the table.
 *
 * @typedef {Object} ColumnMetadata
 *
 * @property {string} name                    - The name of the column.
 * @property {string} dataType                - The data type of the column (e.g., "string", "number", "date").
 * @property {FieldMapping} [fields]          - Additional attributes for the column.
 * @property {number} [digits=0]              - The number of digits for numeric values (defaults to 0).
 * @property {Function} formatter             - A function to format the column value.
 * @property {boolean} [virtual]              - Indicates if the column is virtual (true/false).
 * @property {boolean} [sortable]             - Indicates if the column is sortable (true/false).
 * @property {SortOptions} [sortOrder]        - The sort order of the column.
 * @property {HorizontalAlignOptions} [align] - The alignment of the column content.
 * @property {ActionTypes} [action]           - Action attribute for action columns.
 */

/**
 * Track the state of a row in the table.
 *
 * @typedef {Object} RowState
 * @property {number} index              - The index of the node in the flat list.
 * @property {number} depth              - The depth of the node in the hierarchy.
 * @property {string} [value]            - The value of the hierarchy node.
 * @property {boolean} [isHidden]        - Indicates whether the node is visible (true/false).
 * @property {boolean} [isParent]        - Indicates if this node is a parent (true/false).
 * @property {boolean} [isExpanded]      - Indicates whether the node is expanded (true/false).
 * @property {number} [parentIndex]      - The index of the parent node in the flat list.
 * @property {SelectionState} [selected] - Indicates whether the node is selected (true/false/indeterminate).
 * @property {Array<number>} childred    - The indices of the children in the flat list.
 */

/**
 * Track the state of all rows in the table.
 *
 * @typedef {Object} RowStateMap
 * @property {RowState[]} rows - Flat list of hierarchy nodes.
 */

/**
 * Shade mapping for color variables
 *
 * @typedef {Object} ShadeMapping
 * @property {string} key   - the variable name to be used
 * @property {string} value - the value to be used
 * @property {string} mode  - light or dark mode
 */

/**
 * @typedef {Object} TickMark
 * @property {number} value - The value of the tick mark.
 * @property {string} label - The label for the tick mark.
 * @property {boolean} major - Indicates if the tick mark is a major tick.
 */

/**
 * @typedef {Object} CalendarDay
 * @property {number}  day     - The day of the month.
 * @property {number}  offset  - indicates the offset for positioning
 * @property {date}    date    - Datevalue for the day.
 * @property {string}  text    - formatted text for the day.
 * @property {boolean} holiday - Indicates if the day is a holiday.
 * @property {boolean} weekend - Indicates if the day is on the weekend.
 */

export default {}
