/**
 * Gets horizontal movement actions based on text direction
 * @param {Object} handlers - Handler functions
 * @param {string} [dir='ltr'] - Text direction ('ltr' or 'rtl')
 * @returns {Object} Object mapping arrow keys to movement handlers
 */
function getHorizontalMovementActions(handlers, dir = 'ltr') {
  return dir === 'rtl'
    ? { ArrowRight: handlers.previous, ArrowLeft: handlers.next }
    : { ArrowLeft: handlers.previous, ArrowRight: handlers.next }
}

/**
 * Gets vertical movement actions (not affected by direction)
 * @param {Object} handlers - Handler functions
 * @returns {Object} Object mapping arrow keys to movement handlers
 */
function getVerticalMovementActions(handlers) {
  return { ArrowUp: handlers.previous, ArrowDown: handlers.next }
}

/**
 * Gets horizontal expand/collapse actions (not affected by direction)
 * @param {Object} handlers - Handler functions
 * @returns {Object} Object mapping arrow keys to expand/collapse handlers
 */
function getHorizontalExpandActions(handlers) {
  return { ArrowUp: handlers.collapse, ArrowDown: handlers.expand }
}

/**
 * Gets vertical expand/collapse actions based on text direction
 * @param {Object} handlers - Handler functions
 * @param {string} [dir='ltr'] - Text direction ('ltr' or 'rtl')
 * @returns {Object} Object mapping arrow keys to expand/collapse handlers
 */
function getVerticalExpandActions(handlers, dir = 'ltr') {
  return dir === 'rtl'
    ? { ArrowRight: handlers.collapse, ArrowLeft: handlers.expand }
    : { ArrowLeft: handlers.collapse, ArrowRight: handlers.expand }
}

/**
 * Gets common selection actions
 * @param {Object} handlers - Handler functions
 * @returns {Object} Object mapping keys to selection handlers
 */
function getCommonActions(handlers) {
  return {
    Enter: handlers.select,
    ' ': handlers.select
  }
}

// Default navigation options
export const defaultNavigationOptions = {
  orientation: 'vertical',
  dir: 'ltr',
  nested: false,
  enabled: true
}

/**
 * Gets keyboard action handlers based on orientation and direction
 * @param {Object} options - Configuration options
 * @param {Object} handlers - Event handler functions
 * @returns {Object} Object mapping key presses to handler functions
 */
export function getKeyboardActions(options, handlers) {
  const { orientation, dir, nested, enabled } = { ...defaultNavigationOptions, ...options }
  
  if (!enabled) return {}

  const common = getCommonActions(handlers)
  
  // Determine movement actions based on orientation
  const isHorizontal = orientation === 'horizontal'
  const movement = isHorizontal 
    ? getHorizontalMovementActions(handlers, dir)
    : getVerticalMovementActions(handlers)
  
  // If not nested, we don't need expand/collapse actions
  if (!nested) {
    return { ...common, ...movement }
  }
  
  // Determine expand/collapse actions based on orientation
  const expandCollapse = isHorizontal 
    ? getHorizontalExpandActions(handlers)
    : getVerticalExpandActions(handlers, dir)
  
  return { ...common, ...movement, ...expandCollapse }
}

/**
 * Creates a keyboard action mapping based on navigation options
 *
 * @param {Object} options - Navigation options
 * @param {string} options.orientation - Whether navigation is horizontal or vertical
 * @param {string} options.dir - Text direction ('ltr' or 'rtl') 
 * @param {boolean} options.nested - Whether navigation is nested
 * @returns {Object} Mapping of keys to actions
 */
export function createKeyboardActionMap(options) {
  const { orientation, dir, nested } = options
  const isHorizontal = orientation === 'horizontal'

  // Define movement actions based on orientation and direction
  let movementActions = {}
  if (isHorizontal) {
    movementActions = dir === 'rtl' 
      ? { ArrowRight: 'previous', ArrowLeft: 'next' }
      : { ArrowLeft: 'previous', ArrowRight: 'next' }
  } else {
    movementActions = { ArrowUp: 'previous', ArrowDown: 'next' }
  }

  // Define expand/collapse actions for nested option
  let nestedActions = {}
  if (nested) {
    if (isHorizontal) {
      nestedActions = { ArrowUp: 'collapse', ArrowDown: 'expand' }
    } else {
      nestedActions = dir === 'rtl'
        ? { ArrowRight: 'collapse', ArrowLeft: 'expand' }
        : { ArrowLeft: 'collapse', ArrowRight: 'expand' }
    }
  }

  // Common actions regardless of options
  const commonActions = {
    Enter: 'select',
    ' ': 'select',
    Home: 'first',
    End: 'last'
  }

  // Combine all possible actions
  return {
    ...commonActions,
    ...movementActions,
    ...nestedActions
  }
}

/**
 * Creates a keyboard action mapping for modifier keys based on navigation options
 *
 * @param {Object} options - Navigation options
 * @param {string} options.orientation - Whether navigation is horizontal or vertical
 * @returns {Object} Mapping of keys to actions
 */
export function createModifierKeyboardActionMap(options) {
  const isHorizontal = options.orientation === 'horizontal'
  const common = { ' ': 'extend', Home: 'first', End: 'last' }
  const directional = isHorizontal
    ? { ArrowLeft: 'first', ArrowRight: 'last' }
    : { ArrowUp: 'first', ArrowDown: 'last' }
  return { ...common, ...directional }
}

/**
 * Gets the keyboard action for a key event
 * @param {KeyboardEvent} event - The keyboard event
 * @param {Object} options - Configuration options
 * @returns {string|null} The action to perform, or null if no action is defined
 */
export function getKeyboardAction(event, options = {}) {
  const { key, ctrlKey, metaKey } = event

  // Use updated options with defaults
  const mergedOptions = { ...defaultNavigationOptions, ...options }

  // Check for modifier keys first (highest priority)
  if (ctrlKey || metaKey) {
    const modifierMap = createModifierKeyboardActionMap(mergedOptions)
    return modifierMap[key] || null
  }

  // Get the action map based on options
  const actionMap = createKeyboardActionMap(mergedOptions)

  // Return the action or null if no matching key
  return actionMap[key] || null
}