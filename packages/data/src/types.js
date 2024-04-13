/**
 * @typedef {import('@rokkit/core').FieldMapping} FieldMapping
 * @typedef {import('@rokkit/core').SortOptions} SortOptions
 * @typedef {import('@rokkit/core').HorizontalAlignOptions} HorizontalAlignOptions
 * @typedef {import('@rokkit/core').ActionTypes} ActionTypes
 * @typedef {import('@rokkit/core').SelectionState} SelectionState
 */

/**
 * @typedef {Object} ColumnSorter
 * @property {string}   name
 * @property {function} sorter
 *
 * @typedef {string|[string,boolean]|ColumnSorter} SortableColumn
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
 * Column metadata for the table.
 *
 * @typedef {Object} ColumnMetadata
 *
 * @property {string}                 name        - The name of the column.
 * @property {string}                 type        - The data type of the column (e.g., "string", "number", "date").
 * @property {FieldMapping}           [field] - The field mapping for the column.
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
 * @typedef {Object} TreeTableNode
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
 * @typedef {Object} TreeTable
 * @property {TreeTableNode[]} rows - Flat list of hierarchy nodes.
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

/**
 * DataView
 * @typedef {Object} DataView
 * @property {TreeTable} hierarchy - The state of the rows in the table.
 * @property {Metadata} columns      - The metadata for the columns in the table.
 * @property {Function} sortBy       - Sort the DataView by the specified columns.
 * @property {Function} clearSort    - Clear the sorting of the DataView.
 * @property {Function} filter       - Filter the DataView by the specified columns.
 * @property {Function} toggle      - toggle expand or collapse the DataView by the specified columns.
 * @property {Function} select      - select the DataView by the specified columns.
 */

export default null
