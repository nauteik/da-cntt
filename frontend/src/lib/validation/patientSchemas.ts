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
    .optional(),
  lastName: z
    .string()
    .max(FIELD_CONSTRAINTS.NAME_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.NAME_MAX))
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
    .optional(),
  type: z.enum(["HOME", "COMMUNITY", "SENIOR", "BUSINESS"] as const, {
    required_error: "Address type is required",
  }),
  line1: z
    .string()
    .min(1, VALIDATION_MESSAGES.ADDRESS_LINE1_REQUIRED)
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
    .optional(),
  city: z
    .string()
    .min(1, VALIDATION_MESSAGES.CITY_REQUIRED)
    .max(FIELD_CONSTRAINTS.CITY_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.CITY_MAX)),
  state: z
    .string()
    .min(1, VALIDATION_MESSAGES.STATE_REQUIRED)
    .max(FIELD_CONSTRAINTS.STATE_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.STATE_MAX)),
  postalCode: zipCodeSchema,
  county: z
    .string()
    .min(1, VALIDATION_MESSAGES.COUNTY_REQUIRED)
    .max(FIELD_CONSTRAINTS.COUNTY_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.COUNTY_MAX)),
  phone: phoneSchema,
  email: emailOptionalSchema,
  isMain: z.boolean(),
});

/**
 * Patient Contact Form Schema
 * Matches UpdatePatientContactDTO.java
 */
export const contactSchema = z.object({
  relation: z
    .string()
    .min(1, VALIDATION_MESSAGES.RELATION_REQUIRED)
    .max(
      FIELD_CONSTRAINTS.RELATION_MAX,
      VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.RELATION_MAX)
    ),
  name: z
    .string()
    .min(1, VALIDATION_MESSAGES.NAME_REQUIRED)
    .max(FIELD_CONSTRAINTS.NAME_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.NAME_MAX)),
  phone: phoneSchema,
  email: emailOptionalSchema,
  line1: z.string().max(255).optional(),
  line2: z.string().max(255).optional(),
  isPrimary: z.boolean(),
});

// ===== TYPE EXPORTS =====

export type IdentifiersFormData = z.infer<typeof identifiersSchema>;
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;

