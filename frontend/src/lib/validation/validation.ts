/**
 * Shared validation constants and regex patterns
 * Ensures consistency between frontend validation and backend DTOs
 */

// ===== REGEX PATTERNS =====

export const VALIDATION_REGEX = {
  // Phone number: (XXX) XXX-XXXX or XXX-XXX-XXXX
  PHONE: /^((\(\d{3}\)\s?)|\d{3}-)\d{3}-\d{4}$/,
  
  // ZIP/Postal code: XXXXX or XXXXX-XXXX
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  
  // SSN: XXX-XX-XXXX (with or without dashes)
  SSN: /^\d{3}-?\d{2}-?\d{4}$/,
  
  // Email (uses built-in validator, but can be customized)
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Numeric only (for IDs)
  NUMERIC_ONLY: /^\d+$/,
} as const;

// ===== ERROR MESSAGES =====

export const VALIDATION_MESSAGES = {
  // Required fields
  REQUIRED: "This field is required",
  
  // Phone
  PHONE_INVALID: "Phone must be in format (XXX) XXX-XXXX or XXX-XXX-XXXX",
  PHONE_REQUIRED: "Phone number is required",
  
  // ZIP Code
  ZIP_INVALID: "ZIP code must be in format XXXXX or XXXXX-XXXX",
  ZIP_REQUIRED: "ZIP code is required",
  
  // SSN
  SSN_INVALID: "SSN must be in format XXX-XX-XXXX",
  
  // Email
  EMAIL_INVALID: "Invalid email address",
  
  // Address
  ADDRESS_LINE1_REQUIRED: "Address line 1 is required",
  CITY_REQUIRED: "City is required",
  STATE_REQUIRED: "State is required",
  COUNTY_REQUIRED: "County is required",
  
  // Contact
  RELATION_REQUIRED: "Relation is required",
  NAME_REQUIRED: "Name is required",
  
  // Size limits
  MAX_LENGTH: (max: number) => `Must not exceed ${max} characters`,
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
} as const;

// ===== FIELD CONSTRAINTS =====

export const FIELD_CONSTRAINTS = {
  // String lengths
  LABEL_MAX: 100,
  NAME_MAX: 255,
  ADDRESS_LINE_MAX: 255,
  CITY_MAX: 100,
  STATE_MAX: 2,
  ZIP_MAX: 10,
  COUNTY_MAX: 100,
  EMAIL_MAX: 255,
  PHONE_MAX: 20,
  RELATION_MAX: 100,
  
  // Identifiers
  CLIENT_ID_MAX: 50,
  MEDICAID_ID_MAX: 50,
  SSN_MAX: 11,
  AGENCY_ID_MAX: 50,
} as const;

// ===== SELECT OPTIONS =====

export const ADDRESS_TYPES = [
  { value: "HOME", label: "Home" },
  { value: "COMMUNITY", label: "Community" },
  { value: "SENIOR", label: "Senior" },
  { value: "BUSINESS", label: "Business" },
];

export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export const RELATIONSHIP_OPTIONS = [
  { value: "Spouse", label: "Spouse" },
  { value: "Parent", label: "Parent" },
  { value: "Child", label: "Child" },
  { value: "Sibling", label: "Sibling" },
  { value: "Guardian", label: "Guardian" },
  { value: "Friend", label: "Friend" },
  { value: "Caregiver", label: "Caregiver" },
  { value: "Other", label: "Other" },
];

export const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Chinese", label: "Chinese" },
  { value: "Japanese", label: "Japanese" },
  { value: "Korean", label: "Korean" },
  { value: "Vietnamese", label: "Vietnamese" },
  { value: "Other", label: "Other" },
];

export const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

