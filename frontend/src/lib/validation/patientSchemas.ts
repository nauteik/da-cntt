/**
 * Shared Zod validation schemas for patient-related forms
 * Ensures consistency across all patient forms and matches backend DTOs
 */

import { z } from "zod";
import {
  VALIDATION_REGEX,
  VALIDATION_MESSAGES,
  FIELD_CONSTRAINTS,
} from "@/lib/validation/validation";

// ===== REUSABLE FIELD SCHEMAS =====

/**
 * Phone number field - matches backend pattern
 */
export const phoneSchema = z
  .string()
  .regex(VALIDATION_REGEX.PHONE, VALIDATION_MESSAGES.PHONE_INVALID);

/**
 * Optional phone number field
 */
export const phoneOptionalSchema = z
  .string()
  .regex(VALIDATION_REGEX.PHONE, VALIDATION_MESSAGES.PHONE_INVALID)
  .optional()
  .or(z.literal(""));

/**
 * Email field
 */
export const emailSchema = z
  .string()
  .email(VALIDATION_MESSAGES.EMAIL_INVALID)
  .max(FIELD_CONSTRAINTS.EMAIL_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.EMAIL_MAX));

/**
 * Optional email field
 */
export const emailOptionalSchema = z
  .string()
  .email(VALIDATION_MESSAGES.EMAIL_INVALID)
  .max(FIELD_CONSTRAINTS.EMAIL_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.EMAIL_MAX))
  .optional()
  .or(z.literal(""));

/**
 * ZIP/Postal code field
 */
export const zipCodeSchema = z
  .string()
  .regex(VALIDATION_REGEX.ZIP_CODE, VALIDATION_MESSAGES.ZIP_INVALID)
  .max(FIELD_CONSTRAINTS.ZIP_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.ZIP_MAX));

/**
 * SSN field
 */
export const ssnSchema = z
  .string()
  .regex(VALIDATION_REGEX.SSN, VALIDATION_MESSAGES.SSN_INVALID)
  .max(FIELD_CONSTRAINTS.SSN_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.SSN_MAX))
  .optional()
  .or(z.literal(""));

/**
 * Numeric ID field (for client ID, medicaid ID, agency ID)
 */
export const numericIdSchema = (maxLength: number, fieldName: string) =>
  z
    .string()
    .regex(VALIDATION_REGEX.NUMERIC_ONLY, `${fieldName} must contain only numbers`)
    .max(maxLength, VALIDATION_MESSAGES.MAX_LENGTH(maxLength))
    .optional();

// ===== FORM SCHEMAS =====

/**
 * Patient Identifiers Form Schema
 * Matches UpdatePatientIdentifiersDTO.java
 */
export const identifiersSchema = z.object({
  clientId: numericIdSchema(FIELD_CONSTRAINTS.CLIENT_ID_MAX, "Client ID"),
  medicaidId: numericIdSchema(FIELD_CONSTRAINTS.MEDICAID_ID_MAX, "Medicaid ID"),
  ssn: ssnSchema,
  agencyId: numericIdSchema(FIELD_CONSTRAINTS.AGENCY_ID_MAX, "Agency ID"),
});

/**
 * Patient Personal Information Form Schema
 * Matches UpdatePatientPersonalDTO.java
 */
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .max(FIELD_CONSTRAINTS.NAME_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.NAME_MAX))
    .regex(/^[A-Za-z\s]*$/, "First name must contain only letters and spaces")
    .optional(),
  lastName: z
    .string()
    .max(FIELD_CONSTRAINTS.NAME_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.NAME_MAX))
    .regex(/^[A-Za-z\s]*$/, "Last name must contain only letters and spaces")
    .optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  primaryLanguage: z.string().optional(),
});

/**
 * Patient Address Form Schema
 * Matches UpdatePatientAddressDTO.java
 */
export const addressSchema = z.object({
  label: z
    .string()
    .max(FIELD_CONSTRAINTS.LABEL_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.LABEL_MAX))
    .optional()
    .or(z.literal("")),
  type: z.enum(["HOME", "COMMUNITY", "SENIOR", "BUSINESS"] as const),
  line1: z
    .string()
    .min(1, "Address line 1 is required")
    .max(
      FIELD_CONSTRAINTS.ADDRESS_LINE_MAX,
      VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.ADDRESS_LINE_MAX)
    ),
  line2: z
    .string()
    .max(
      FIELD_CONSTRAINTS.ADDRESS_LINE_MAX,
      VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.ADDRESS_LINE_MAX)
    )
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .min(1, "City is required")
    .max(FIELD_CONSTRAINTS.CITY_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.CITY_MAX)),
  state: z
    .string()
    .min(1, "State is required")
    .max(FIELD_CONSTRAINTS.STATE_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.STATE_MAX)),
  postalCode: z
    .string()
    .min(1, "ZIP code is required")
    .regex(VALIDATION_REGEX.ZIP_CODE, VALIDATION_MESSAGES.ZIP_INVALID)
    .max(FIELD_CONSTRAINTS.ZIP_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.ZIP_MAX)),
  county: z
    .string()
    .min(1, "County is required")
    .max(FIELD_CONSTRAINTS.COUNTY_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.COUNTY_MAX)),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(VALIDATION_REGEX.PHONE, VALIDATION_MESSAGES.PHONE_INVALID),
  email: emailOptionalSchema,
  isMain: z.boolean(),
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional()
    .nullable(),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional()
    .nullable(),
});

/**
 * Name validation schema - for first and last names
 */
const namePartSchema = z
  .string()
  .min(1, "This field is required")
  .max(FIELD_CONSTRAINTS.NAME_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.NAME_MAX))
  .regex(/^[A-Za-z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
  .refine((val) => val.trim().length > 0, "Name cannot be only spaces");

/**
 * Patient Contact Form Schema
 * Matches UpdatePatientContactDTO.java
 * Note: Backend uses single 'name' field, but form uses firstName/lastName for better UX
 * The name field will be computed from firstName + lastName when submitting
 */
export const contactSchema = z.object({
  relation: z
    .string()
    .min(1, "Relation is required")
    .max(
      FIELD_CONSTRAINTS.RELATION_MAX,
      VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.RELATION_MAX)
    ),
  firstName: namePartSchema,
  lastName: namePartSchema,
  // name is computed from firstName + lastName when submitting, not validated in form
  name: z.string().optional(),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(VALIDATION_REGEX.PHONE, VALIDATION_MESSAGES.PHONE_INVALID),
  email: emailOptionalSchema,
  line1: z.string().max(255).optional().or(z.literal("")),
  line2: z.string().max(255).optional().or(z.literal("")),
  isPrimary: z.boolean(),
});

// ===== TYPE EXPORTS =====

export type IdentifiersFormData = z.infer<typeof identifiersSchema>;
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;

