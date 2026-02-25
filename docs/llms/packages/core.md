# @rokkit/core

> Foundation utility library with types, constants, field mapping, theming, and data manipulation functions.

## Position in Dependency Hierarchy
**Depends on**: date-fns, ramda
**Depended on by**: all other @rokkit packages

## Exports

### Classes

#### FieldMapper
Maps custom field names to object properties for flexible data access.

```javascript
const mapper = new FieldMapper({ id: 'key', text: 'label', children: 'items' })
mapper.get('text', item)                    // Gets item[fields.text]
mapper.getValue(item)                       // Gets value with fallback
mapper.getIcon(item)                        // Gets icon with state handling
mapper.getChildren(item)                    // Gets children array
mapper.hasChildren(item)                    // Checks if item has children
mapper.isNested(items)                      // Checks if any item has children
mapper.getChildrenByPath(items, [0, 1])     // Gets nested children by path
mapper.getItemByPath(items, [0, 1])         // Gets nested item by path
mapper.getFormattedText(item, formatter)    // Gets formatted text with currency
mapper.getChildMapper()                     // Gets mapper for nested level
```

#### Theme
Manages color palettes, theme mappings, and semantic shortcuts.

```javascript
const theme = new Theme({ colors: defaultColors, mapping: defaultThemeMapping })
theme.colors                                // Get/set color palettes
theme.mapping                               // Get/set theme mapping
theme.getColorRules(mapping)                // Gets color rules for theme
theme.getPalette(mapping)                   // Gets CSS variable palette
theme.getShortcuts(name)                    // Gets semantic shortcuts for color
```

### Functions

#### Utility
| Export | Signature | Description |
|--------|-----------|-------------|
| `id(prefix)` | `(string) => string` | Random unique ID with optional prefix |
| `noop()` | `() => void` | No-operation function |
| `isObject(val)` | `(*) => boolean` | Checks if JSON object (not Date/null) |
| `toString(value)` | `(*) => string` | Converts to string (JSON for objects) |
| `compact(obj)` | `(Object) => Object` | Removes undefined/null values |
| `detectDirection()` | `() => 'ltr' \| 'rtl'` | Detects text direction from HTML |
| `isRTL()` | `() => boolean` | Checks if document direction is RTL |
| `getClosestAncestorWithAttribute(el, attr)` | `(HTMLElement, string) => HTMLElement \| null` | Finds ancestor with attribute |
| `getKeyFromPath(path)` | `(string[]) => string` | Path array → key string |
| `getPathFromKey(key)` | `(string) => string[]` | Key string → path array |
| `getSnippet(obj, key, default)` | `(Object, string, Function) => Function` | Gets snippet function |
| `hex2rgb(hex)` | `(string) => string` | Hex color → 'r,g,b' format |
| `getImage(str)` | `(string) => string \| null` | Validates image URL or data URL |
| `createEmitter(props, defaults)` | `(Object, string[]) => EventHandlers` | Extracts on* handlers from props |

#### String
| Export | Signature | Description |
|--------|-----------|-------------|
| `toInitCapCase(text)` | `(string) => string` | Capitalizes first letter |
| `toPascalCase(text)` | `(string) => string` | hyphen-case → PascalCase |
| `toHyphenCase(text)` | `(string) => string` | PascalCase → hyphen-case |
| `compareStrings(a, b)` | `(string, string) => -1\|0\|1` | Simple string comparison |
| `sortByParts(a, b, sep)` | `(string, string, string) => number` | Sorts by split parts |
| `uniqueId(prefix, sep)` | `(string, string) => string` | Timestamp-based unique ID |
| `toHexString(value, size)` | `(number, number) => string` | Number → padded hex |

#### Field Mapping
| Export | Signature | Description |
|--------|-----------|-------------|
| `getValue(node, fields)` | `(*, FieldMapping) => *` | Extracts value via mapping |
| `getText(node, fields)` | `(*, FieldMapping) => string` | Extracts text via mapping |
| `getAttribute(node, attr)` | `(*, string) => *` | Gets attribute from node |
| `getFormattedText(node, fields, formatter)` | `(*, FieldMapping, Function) => string` | Formatted text with currency |
| `getIcon(value, fields)` | `(*, FieldMapping) => string \| null` | Gets icon name with state handling |
| `getComponent(value, fields, using)` | `(*, FieldMapping, Object) => SvelteComponent` | Gets component for item |
| `hasChildren(item, fields)` | `(*, FieldMapping) => boolean` | Checks for children array |
| `isExpanded(item, fields)` | `(*, FieldMapping) => boolean` | Checks if expanded parent |
| `getNestedFields(fields)` | `(FieldMapping) => FieldMapping` | Gets child-level field mapping |

#### Hierarchy
| Export | Signature | Description |
|--------|-----------|-------------|
| `flattenNestedList(items, fields, level)` | `(Array, FieldMapping, number) => Array` | Flattens nested list with level/parent flags |
| `findValueFromPath(slug, data, fields)` | `(string, Array, FieldMapping) => any` | Finds item by path slug |
| `getLineTypes(hasChildren, parentTypes, position)` | `(boolean, LineType[], LineType) => LineType[]` | Tree line connector types |

#### Theme/Color
| Export | Signature | Description |
|--------|-----------|-------------|
| `shadesOf(name, modifier)` | `(string, 'hsl'\|'rgb'\|'none') => Object` | CSS variable shades for color |
| `themeRules(mapping, colors)` | `(Object, Object) => Object` | CSS color rules from theme |
| `semanticShortcuts(name)` | `(string) => Array` | UnoCSS shortcuts for semantic tones |
| `contrastShortcuts(name)` | `(string) => Array` | 'text-on-{name}' contrast shortcuts |
| `iconShortcuts(icons, collection, variants)` | `(string[], string, string) => Object` | Icon shortcuts for collection |

#### Calendar/Date
| Export | Signature | Description |
|--------|-----------|-------------|
| `getCalendarDays(value, holidays, fixed)` | `(Date, Array, boolean) => CalendarDay[]` | Calendar day grid |
| `weekdays` | `string[]` | Weekday names (Sun–Sat) |
| `generateTicks(lower, upper, minor, major)` | `(number, number, number, number) => TickMark[]` | Tick marks for range |

### Constants

| Export | Description |
|--------|-------------|
| `defaultFields` | Default field mapping (id, href, icon, text, value, keywords, children, etc.) |
| `defaultColors` | Pre-defined color palettes |
| `defaultPalette` | Default color palette |
| `defaultThemeMapping` | Theme color mapping (surface→slate, primary→orange, etc.) |
| `defaultStateIcons` | State icon mappings (accordion, checkbox, navigate, mode, etc.) |
| `defaultIcons` | Standard icon name array |
| `defaultKeyMap` | Keyboard key mapping (ArrowRight→open, etc.) |
| `defaultOptions` | Default option mapping (id, label, value, checked) |
| `TONE_MAP` | Tone mappings (z0–z10 → shade 50–950) |
| `shades` | Array of color shade values |
| `syntaxColors` | Syntax highlighting colors |
| `DATA_IMAGE_REGEX` | Regex for data image URIs |

### Types (JSDoc)

| Export | Description |
|--------|-------------|
| `FieldMapping` | Field mapping structure (id, text, value, url, icon, image, children, etc.) |
| `ColumnMetadata` | Column metadata (name, dataType, fields, formatter, sortable, align, action) |
| `RowState` | Row state (index, depth, value, isHidden, isParent, isExpanded, selected) |
| `LineType` | 'child' \| 'last' \| 'sibling' \| 'empty' \| 'icon' |
| `CalendarDay` | Calendar day (day, offset, date, text, holiday, weekend) |
| `ColorPalette` | Color palette with shades 50–950 |
| `ColorMapping` | Mapping for primary, secondary, tertiary, surface, info, success, warning, error |
