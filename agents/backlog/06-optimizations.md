# Backlog: Optimizations

High complexity functions will be difficult to maintain. We need some focussed work to reduce complexity.

## kbd.js

- Line 111-118, looks pretty similar to getHorizontalMovementActions. 
- Line 120-131, looks similar to getVerticalExpandActions. one is a mapping and another maps handlers. 

This could be cleaned up or simplified to create a lookup `key:action` and the lookup object can be mapped to handlers. We could have smaller functions like the get---actions functions to create the lookups and simplify the createKeyboardActionMap funtion.

Analyze the patterns and provide an approach that simplifies the implementation, maintaining the current capability.
