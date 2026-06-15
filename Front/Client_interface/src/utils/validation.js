// Validation utility with clear error messages

export const validateField = (name, value, rules = {}) => {
  const errors = []

  // Required validation
  if (rules.required && (!value || value.trim() === '')) {
    const fieldName = rules.fieldName || name
    errors.push(`${fieldName} should not be empty`)
    return errors
  }

  // Email validation
  if (name === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      errors.push('Please enter a valid email address')
    }
  }

  // Phone validation
  if (name === 'phone' && value) {
    // Remove all non-numeric characters for validation
    const phoneDigits = value.replace(/\D/g, '')
    if (rules.required && phoneDigits.length === 0) {
      errors.push('Phone should not be empty')
    } else if (phoneDigits.length > 0 && phoneDigits.length < 7) {
      errors.push('Phone number must be at least 7 digits')
    } else if (phoneDigits.length > 15) {
      errors.push('Phone number must not exceed 15 digits')
    }
  }

  // Password validation
  if (name === 'password' && value) {
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`Password must be at least ${rules.minLength} characters long`)
    }
    if (rules.required && value.trim() === '') {
      errors.push('Password should not be empty')
    }
  }

  // Password confirmation validation
  if (name === 'password_confirmation' && value && rules.password) {
    if (value !== rules.password) {
      errors.push('Passwords do not match')
    }
  }

  // Message/Description validation
  if ((name === 'message' || name === 'description') && value) {
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`Message must be at least ${rules.minLength} characters long`)
    }
  }

  // Name validation
  if (name === 'name' && value) {
    if (value.trim().length < 2) {
      errors.push('Name must be at least 2 characters long')
    }
  }

  // Company name validation
  if (name === 'company_name' && value) {
    if (value.trim().length < 2) {
      errors.push('Company name must be at least 2 characters long')
    }
  }

  return errors
}

export const validateForm = (formData, validationRules) => {
  const errors = {}
  let hasErrors = false

  Object.keys(validationRules).forEach((fieldName) => {
    const rules = validationRules[fieldName]
    const value = formData[fieldName]
    const fieldErrors = validateField(fieldName, value, {
      ...rules,
      fieldName: rules.fieldName || fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/_/g, ' '),
      password: formData.password, // For password confirmation
    })

    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors[0] // Return first error
      hasErrors = true
    }
  })

  return { errors, hasErrors }
}

// Common validation rules
export const validationRules = {
  register: {
    name: { required: true, fieldName: 'Name' },
    email: { required: true, fieldName: 'Email' },
    phone: { required: true, fieldName: 'Phone' },
    company_name: { required: true, fieldName: 'Company name' },
    password: { required: true, minLength: 8, fieldName: 'Password' },
    password_confirmation: { required: true, fieldName: 'Confirm password' },
  },
  contact: {
    name: { required: true, fieldName: 'Name' },
    email: { required: true, fieldName: 'Email' },
    phone: { required: true, fieldName: 'Phone' },
    company_name: { required: true, fieldName: 'Company name' },
    message: { required: true, minLength: 10, fieldName: 'Message' },
  },
  profile: {
    name: { required: true, fieldName: 'Name' },
    phone: { required: true, fieldName: 'Phone' },
    company_name: { required: true, fieldName: 'Company name' },
  },
  admin: {
    name: { required: true, fieldName: 'Name' },
    email: { required: true, fieldName: 'Email' },
    phone: { required: true, fieldName: 'Phone' },
    password: { required: true, minLength: 8, fieldName: 'Password' },
    password_confirmation: { required: true, fieldName: 'Confirm password' },
  },
}

