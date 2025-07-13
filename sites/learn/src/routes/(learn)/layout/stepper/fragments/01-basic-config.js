const data = [
  {
    text: '1',
    label: 'Personal Info',
    completed: true,
    active: false
  },
  {
    text: '2',
    label: 'Contact Details',
    completed: true,
    active: false
  },
  {
    text: '3',
    label: 'Preferences',
    active: true
  },
  {
    text: '4',
    label: 'Review',
    disabled: true
  },
  {
    text: '5',
    label: 'Complete',
    disabled: true
  }
]

// Usage
<Stepper {data} bind:value />