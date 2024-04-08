/**
 * Options for the sort order of the column.
 *
 * @typedef {'ascending'|'descending'|'none'} SortOptions
 */

/**
 * Options for aligning text in a column.
 * @typedef {'left'|'center'|'right'|'justify'} HorizontalAlignOptions
 */

/**
 * Options for the action type of the column.
 * @typedef {'edit'|'delete'|'select'} ActionTypes
 */

/**
 * @typedef {'checked'|'unchecked'|'indeterminate'} SelectionState
 */

/**
 * @typedef {string|[string,boolean]|ColumnSorter} SortableColumn
 */

/**
 * @typedef {Object} ColumnSorter
 * @property {string}   name
 * @property {function} sorter
 */

/**
 * @typedef {Object} ColumnAggregator
 * @property {string}   name
 * @property {function} aggregator
 * @property {string}   suffix
 */

/**
 * Options for joining two data sets
 *
 * @typedef OptionsToRenameKeys
 * @property {string} [prefix]         - Prefix to be added to each attribute
 * @property {string} [suffix]         - Suffix to be added to each attribute
 * @property {string} [separator='_']  - Separator to be used when adding prefix or suffix. defaults to _
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
 * @property {string}                 name        - The name of the column.
 * @property {string}                 type        - The data type of the column (e.g., "string", "number", "date").
 * @property {FieldMapping}           [fields]    - Additional attributes for the column.
 * @property {number}                 [digits=0]  - The number of digits for numeric values (defaults to 0).
 * @property {Function}               formatter   - A function to format the column value.
 * @property {boolean}                [sortable]  - Indicates if the column is sortable (true/false).
 * @property {SortOptions}            [sortOrder] - The sort order of the column.
 * @property {HorizontalAlignOptions} [align]     - The alignment of the column content.
 * @property {ActionTypes}            [action]    - Action attribute for action columns.
 */

/**
 * @typedef {Array<ColumnMetadata>} Metadata
 */

/**
 * @typedef {Object<string,number} ColumnIndexMap
 */

/**
 * Track the state of a row in the table.
 *
 * @typedef {Object} RowState
 * @property {number}         row          - Reference to actual row in the data.
 * @property {number}         depth        - The depth of the node in the hierarchy.
 * @property {string}         [value]      - The value of the hierarchy node.
 * @property {boolean}        [isHidden]   - Indicates whether the node is visible (true/false).
 * @property {boolean}        [isParent]   - Indicates if this node is a parent (true/false).
 * @property {boolean}        [isExpanded] - Indicates whether the node is expanded (true/false).
 * @property {number}         [parent]     - Reference to the parent node in the flat list.
 * @property {SelectionState} [selected]   - Indicates whether the node is selected (true/false/indeterminate).
 * @property {Array<any>}     children     - Reference to the children nodes in the flat list.
 */

/**
 * Track the state of all rows in the table.
 *
 * @typedef {Object} RowStateMap
 * @property {RowState[]} rows - Flat list of hierarchy nodes.
 */

/**
 * @typedef {Object} OverrideConfig
 * @property {string} actual_flag - the field used for identifying filler rows in the data
 * @property {string} children    - the field used for collecting children of a node in rollup
 */

/**
 * @typedef {Object} ReducerConfig
 * @property {string}   field - The target field to hold the reduced value
 * @property {Function} using - The function to use for reducing the data
 */

/**
 * @typedef {Object} SummaryConfig
 * @property {Function}            mapper     - A function used to collect the data for the summary
 * @property {Array<ReducerConfig} reducers   - Array of reducer configurations
 * @property {Metadata}            [metadata] - Array of column metadata for the summary
 */

/**
 * @typedef {Object} DataFrameConfig
 * @property {Array<string>} group_by=[]         - The columns to group by.
 * @property {Array<string>} align_by=[]         - The columns to be aligned during rollup.
 * @property {Array<SummaryConfig>} summaries=[] - Array of summary configurations.
 * @property {any} template={}                   - Template row to be used for filling in missing rows.
 * @extends OverrideConfig
 */

/**
 * @typedef {Function} SortBy
 * @description Sort the DataFrame by the specified columns.
 * @param {SortableColumn} columns - The columns to sort by.
 * @returns {DataFrame}            - The sorted DataFrame.
 */

/**
 * DataFrame-like object with data manipulation methods.
 *
 * @typedef {Object} DataFrame
 * @property {Array<Object>}                         data       - Array of objects representing the rows of data.
 * @property {Metadata}                              metadata   - Array of column metadata for the data.
 * @property {DataFrameConfig}                       config     - Configuration options for the DataFrame.
 * @property {ColumnIndexMap}                        columns    - A map of column names to their index in the metadata.
 * @property {function(OverrideConfig):DataFrame}    override   - Method to override the configuration of the DataFrame.
 * @property {function(...string):DataFrame}         groupBy    - Method to group the DataFrame by specified columns.
 * @property {function(function(any)):DataFrame}     where      - Sets the filter function for the DataFrame
 * @property {function():DataFrame}                  align      - Method to align the DataFrame.
 * @property {function():DataFrame}                  using      - set the template to be used for filling in missing rows.
 * @property {function():DataFrame}                  summarize  - add a summarizer to be used during rollup
 * @property {function(...SortableColumn):DataFrame} sortBy     - Method to sort the DataFrame by specified columns.
 * @property {function():DataFrame}                  join       - perform join with another DataFrame returning a new DataFrmae. Defaults to innerJoin, other join types can be specified.
 * @property {function():DataFrame}                  innerJoin  - perform an ineer join with another DataFrame and return a new DataFrame.
 * @property {function():DataFrame}                  leftJoin   - perform a left join with another DataFrame and return a new DataFrame.
 * @property {function():DataFrame}                  rightJoin  - perform a right join with another DataFrame returning a new DataFrame.
 * @property {function():DataFrame}                  fullJoin   - perform a full join with another DataFrame returning a new DataFrame.
 * @property {function():DataFrame}                  nestedJoin - perform a nested join with another DataFrame returning a new DataFrame.
 * @property {function():DataFrame}                  rename     - Method to rename the columns of the DataFrame.
 * @property {function():DataFrame}                  drop       - Method to drop the columns of the DataFrame.
 * @property {function():DataFrame}                  delete     - Method to delete the rows of the DataFrame.
 * @property {function():DataFrame}                  update     - Method to update the rows of the DataFrame.
 * @property {function():DataFrame}                  union      - Method to combine the rows of the DataFrame with another DataFrame.
 * @property {function():DataFrame}                  minus      - Method to remove the rows of the DataFrame which are present in another DataFrame.
 * @property {function():DataFrame}                  intersect  - Method to keep the rows of the DataFrame which are present in another DataFrame.
 * @property {function():DataFrame}                  rollup     - Method to rollup the DataFrame.
 * @property {function():Arrat<Object>}              select     - Method to select the columns of the DataFrame.

 */

/**
 * @typedef {inner|outer|full|nested} JoinType
 */
/**
 * Options for joining two data sets
 *
 * @typedef JoinOptions
 * @property {boolean} [inner]                - Flag indicating inner join
 * @property {JoinType} [type='inner]         - The join type to use (inner, outer, full, nested).
 * @property {string} [prefix]                - prefix to be used for renaming keys in the second data set.
 * @property {string} [suffix]                - suffix to be used for renaming keys in the second data set.
 * @property {string} [separator='_']         - separator to be used for renaming keys in the second data set.
 */
export {}
