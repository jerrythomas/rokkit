// Example of dynamic validation with form integration
function validatePassword(password) {
  return [
    {
      text: 'At least 8 characters long',
      valid: password.length >= 8,
      status: password.length >= 8 ? 'pass' : 'fail'
    },
    {
      text: 'Contains uppercase letter',
      valid: /[A-Z]/.test(password),
      status: /[A-Z]/.test(password) ? 'pass' : 'fail'
    },
    {
      text: 'Contains lowercase letter',
      valid: /[a-z]/.test(password),
      status: /[a-z]/.test(password) ? 'pass' : 'fail'
    },
    {
      text: 'Contains number',
      valid: /\d/.test(password),
      status: /\d/.test(password) ? 'pass' : 'fail'
    },
    {
      text: 'Contains special character',
      valid: /[!@#$%^&*]/.test(password),
      status: /[!@#$%^&*]/.test(password) ? 'pass' : 'warn',
      optional: true
    }
  ]
}

// Usage in component
const password = ''
$: validationItems = validatePassword(password)