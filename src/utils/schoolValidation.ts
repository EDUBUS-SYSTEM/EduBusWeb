import { UpdateSchoolRequest, SchoolLocationRequest } from "@/services/schoolService/schoolService.types";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  messages: {
    required?: string;
    minLength?: string;
    maxLength?: string;
    min?: string;
    max?: string;
    pattern?: string;
    invalid?: string;
  };
}

// Validation rules matching backend SchoolWriteRequestBase
export const schoolValidationRules: Record<string, ValidationRule> = {
  schoolName: {
    required: true,
    minLength: 1,
    maxLength: 200,
    messages: {
      required: "School name is required.",
      minLength: "School name must be at least 1 character.",
      maxLength: "School name must not exceed 200 characters."
    }
  },
  slogan: {
    required: false,
    maxLength: 300,
    messages: {
      maxLength: "Slogan must not exceed 300 characters."
    }
  },
  shortDescription: {
    required: false,
    maxLength: 500,
    messages: {
      maxLength: "Short description must not exceed 500 characters."
    }
  },
  fullDescription: {
    required: false,
    maxLength: 5000,
    messages: {
      maxLength: "Full description must not exceed 5000 characters."
    }
  },
  email: {
    required: false,
    maxLength: 320,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      maxLength: "Email must not exceed 320 characters.",
      pattern: "Invalid email format."
    }
  },
  phoneNumber: {
    required: false,
    maxLength: 20,
    pattern: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
    messages: {
      maxLength: "Phone number must not exceed 20 characters.",
      pattern: "Invalid phone number format."
    }
  },
  website: {
    required: false,
    maxLength: 500,
    pattern: /^https?:\/\/.+/,
    messages: {
      maxLength: "Website URL must not exceed 500 characters.",
      pattern: "Invalid website URL format. Must start with http:// or https://"
    }
  },
  fullAddress: {
    required: false,
    maxLength: 500,
    messages: {
      maxLength: "Full address must not exceed 500 characters."
    }
  },
  displayAddress: {
    required: false,
    maxLength: 200,
    messages: {
      maxLength: "Display address must not exceed 200 characters."
    }
  },
  latitude: {
    required: false,
    min: -90,
    max: 90,
    messages: {
      min: "Latitude must be between -90 and 90.",
      max: "Latitude must be between -90 and 90.",
      invalid: "Latitude must be a valid number."
    }
  },
  longitude: {
    required: false,
    min: -180,
    max: 180,
    messages: {
      min: "Longitude must be between -180 and 180.",
      max: "Longitude must be between -180 and 180.",
      invalid: "Longitude must be a valid number."
    }
  },
  footerText: {
    required: false,
    maxLength: 500,
    messages: {
      maxLength: "Footer text must not exceed 500 characters."
    }
  },
  internalNotes: {
    required: false,
    maxLength: 2000,
    messages: {
      maxLength: "Internal notes must not exceed 2000 characters."
    }
  }
};

// Location validation rules matching backend SchoolLocationRequest
export const locationValidationRules: Record<string, ValidationRule> = {
  latitude: {
    required: true,
    min: -90,
    max: 90,
    messages: {
      required: "Latitude is required.",
      min: "Latitude must be between -90 and 90.",
      max: "Latitude must be between -90 and 90.",
      invalid: "Latitude must be a valid number."
    }
  },
  longitude: {
    required: true,
    min: -180,
    max: 180,
    messages: {
      required: "Longitude is required.",
      min: "Longitude must be between -180 and 180.",
      max: "Longitude must be between -180 and 180.",
      invalid: "Longitude must be a valid number."
    }
  },
  fullAddress: {
    required: false,
    maxLength: 500,
    messages: {
      maxLength: "Full address must not exceed 500 characters."
    }
  },
  displayAddress: {
    required: false,
    maxLength: 200,
    messages: {
      maxLength: "Display address must not exceed 200 characters."
    }
  }
};

// Validate a single field
export function validateField(
  fieldName: string,
  value: unknown,
  rules: Record<string, ValidationRule> = schoolValidationRules
): ValidationError[] {
  const errors: ValidationError[] = [];
  const rule = rules[fieldName];
  
  if (!rule) return errors;

  // Check required
  if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    errors.push({
      field: fieldName,
      message: rule.messages.required || `${fieldName} is required.`
    });
    return errors; // Don't check other rules if required fails
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return errors;
  }

  // Check string length validations
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      errors.push({
        field: fieldName,
        message: rule.messages.minLength || `${fieldName} must be at least ${rule.minLength} characters.`
      });
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push({
        field: fieldName,
        message: rule.messages.maxLength || `${fieldName} must not exceed ${rule.maxLength} characters.`
      });
    }

    // Check pattern
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push({
        field: fieldName,
        message: rule.messages.pattern || `${fieldName} format is invalid.`
      });
    }
  }

  // Check number range validations
  if (typeof value === 'number') {
    if (isNaN(value)) {
      errors.push({
        field: fieldName,
        message: rule.messages.invalid || `${fieldName} must be a valid number.`
      });
    } else {
      if (rule.min !== undefined && value < rule.min) {
        errors.push({
          field: fieldName,
          message: rule.messages.min || `${fieldName} must be at least ${rule.min}.`
        });
      }

      if (rule.max !== undefined && value > rule.max) {
        errors.push({
          field: fieldName,
          message: rule.messages.max || `${fieldName} must not exceed ${rule.max}.`
        });
      }
    }
  }

  return errors;
}

// Validate entire school form
export function validateSchoolForm(data: UpdateSchoolRequest): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate each field
  Object.keys(schoolValidationRules).forEach(fieldName => {
    const fieldErrors = validateField(
      fieldName,
      data[fieldName as keyof UpdateSchoolRequest]
    );
    errors.push(...fieldErrors);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate location form
export function validateLocationForm(data: SchoolLocationRequest): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate each field
  Object.keys(locationValidationRules).forEach(fieldName => {
    const fieldErrors = validateField(
      fieldName,
      data[fieldName as keyof SchoolLocationRequest],
      locationValidationRules
    );
    errors.push(...fieldErrors);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Get error message for a specific field
export function getFieldError(errors: ValidationError[], fieldName: string): string | null {
  const error = errors.find(err => err.field === fieldName);
  return error ? error.message : null;
}

// Check if a field has error
export function hasFieldError(errors: ValidationError[], fieldName: string): boolean {
  return errors.some(err => err.field === fieldName);
}

// Real-time validation for individual field changes
export function validateFieldOnChange(
  fieldName: string,
  value: unknown
): string | null {
  const errors = validateField(fieldName, value);
  return errors.length > 0 ? errors[0].message : null;
}
