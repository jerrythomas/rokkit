# Toast component

- Mac style dismissable toast messages
- types info, error, warning, success
- Click to take action
- Delay timer for disappearing messages

Includes a visual display and a state store. The state store can be sent messages containing toast messages. The alert component would be added to root layout and would display the current active messages. Some messages can have a timer, auto dismiss. Others may need user to click to dismiss. on dismiss event can be wired by user to perform an action. Follows similar approach used by list and other components. Customizable via fields props, and custom snippet.
