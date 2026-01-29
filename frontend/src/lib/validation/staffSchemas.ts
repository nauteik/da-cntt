import { z } from "zod";
import {
  VALIDATION_REGEX,
  VALIDATION_MESSAGES,
  FIELD_CONSTRAINTS,
} from "@/lib/validation/validation";

/**
 * Validation schemas for Staff forms
 * Based on backend DTOs and validation rules
 */

// ===== REUSABLE FIELD SCHEMAS =====

/**
 * Phone number field - matches backend pattern
 */
export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
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
 * Name validation schema - for first and last names
 */
const namePartSchema = z
  .string()
  .min(1, "This field is required")
  .max(FIELD_CONSTRAINTS.NAME_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.NAME_MAX))
  .regex(/^[A-Za-z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
  .refine((val) => val.trim().length > 0, "Name cannot be only spaces");

// ===== FORM SCHEMAS =====

// Staff Identifiers Schema
export const staffIdentifiersSchema = z.object({
  ssn: z
    .string()
    .min(1, "SSN is required")
    .regex(VALIDATION_REGEX.SSN, VALIDATION_MESSAGES.SSN_INVALID)
    .max(FIELD_CONSTRAINTS.SSN_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.SSN_MAX)),
  employeeId: z
    .string()
    .min(1, "Employee ID is required")
    .max(50, "Employee ID must not exceed 50 characters"),
  nationalProviderId: z
    .string()
    .max(50, "National Provider ID must not exceed 50 characters")
    .optional()
    .or(z.literal("")),
  isSupervisor: z.boolean().optional(),
  isActive: z.boolean(),
  position: z
    .string()
    .min(1, "Position is required")
    .max(100, "Position must not exceed 100 characters"),
  supervisorId: z.string().uuid("Invalid supervisor ID").optional().or(z.literal("")),
  officeId: z.string().uuid("Invalid office ID").optional().or(z.literal("")),
  effectiveDate: z
    .string()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      const today = new Date();
      // strip time
      d.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      return d <= today;
    }, "Effective date must be today or in the past")
    .optional()
    .or(z.literal("")),
  hireDate: z
    .string()
    .min(1, "Hire date is required")
    .refine((val) => {
      const d = new Date(val);
      const today = new Date();
      d.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      return d <= today;
    }, "Hire date must be today or in the past"),
});

export type StaffIdentifiersFormData = z.infer<typeof staffIdentifiersSchema>;

// Staff Personal Info Schema
export const staffPersonalInfoSchema = z.object({
  firstName: namePartSchema,
  lastName: namePartSchema,
  dob: z
    .string()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      return date < new Date();
    }, "Date of birth must be in the past")
    .optional()
    .or(z.literal("")),
  gender: z
    .string()
    .max(20, "Gender must not exceed 20 characters")
    .optional()
    .or(z.literal("")),
  primaryLanguage: z
    .string()
    .max(50, "Primary language must not exceed 50 characters")
    .optional()
    .or(z.literal("")),
});

export type StaffPersonalInfoFormData = z.infer<typeof staffPersonalInfoSchema>;

// Staff Address Schema
export const staffAddressSchema = z.object({
  label: z
    .string()
    .max(FIELD_CONSTRAINTS.LABEL_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.LABEL_MAX))
    .optional()
    .or(z.literal("")),
  // Address Type: required with friendly message
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
  isMain: z.boolean().optional(),
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

export type StaffAddressFormData = z.infer<typeof staffAddressSchema>;

// Staff Contact Schema
export const staffContactSchema = z.object({
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
  phone: phoneOptionalSchema,
  email: emailOptionalSchema,
  line1: z.string().max(255).optional().or(z.literal("")),
  line2: z.string().max(255).optional().or(z.literal("")),
  isPrimary: z.boolean().optional(),
});

export type StaffContactFormData = z.infer<typeof staffContactSchema>;
