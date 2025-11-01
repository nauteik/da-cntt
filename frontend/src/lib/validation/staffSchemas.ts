import { z } from "zod";

/**
 * Validation schemas for Staff forms
 * Based on backend DTOs and validation rules
 */

// Staff Identifiers Schema
export const staffIdentifiersSchema = z.object({
  ssn: z
    .string()
    .min(1, "SSN is required")
    .regex(/^\d{3}-?\d{2}-?\d{4}$/, "SSN must be in format XXX-XX-XXXX")
    .max(11, "SSN must not exceed 11 characters"),
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
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must not exceed 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must not exceed 100 characters"),
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
    .max(100, "Label must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  // Address Type: required with friendly message
  type: z.enum(["HOME", "COMMUNITY", "SENIOR", "BUSINESS"], "Address type is required"),
  line1: z
    .string()
    .min(1, "Address line 1 is required")
    .max(255, "Address line 1 must not exceed 255 characters"),
  line2: z
    .string()
    .max(255, "Address line 2 must not exceed 255 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must not exceed 100 characters"),
  state: z
    .string()
    .length(2, "State must be 2 characters"),
  postalCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Postal code must be in format XXXXX or XXXXX-XXXX")
    .max(10, "Postal code must not exceed 10 characters"),
  county: z
    .string()
    .min(1, "County is required")
    .max(100, "County must not exceed 100 characters"),
  phone: z
    .string()
    .regex(
      /^(\(\d{3}\)\s?\d{3}-\d{4}|\d{3}-\d{3}-\d{4})$/,
      "Phone must be in format (XXX) XXX-XXXX or XXX-XXX-XXXX"
    ),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters")
    .optional()
    .or(z.literal("")),
  isMain: z.boolean().optional(),
});

export type StaffAddressFormData = z.infer<typeof staffAddressSchema>;

// Staff Contact Schema
export const staffContactSchema = z.object({
  relation: z
    .string()
    .max(100, "Relation must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  name: z
    .string()
    .max(255, "Name must not exceed 255 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(
      /^(\(\d{3}\)\s?\d{3}-\d{4}|\d{3}-\d{3}-\d{4})$/,
      "Phone must be in format (XXX) XXX-XXXX or XXX-XXX-XXXX"
    )
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters")
    .optional()
    .or(z.literal("")),
  line1: z
    .string()
    .max(255, "Address line 1 must not exceed 255 characters")
    .optional()
    .or(z.literal("")),
  line2: z
    .string()
    .max(255, "Address line 2 must not exceed 255 characters")
    .optional()
    .or(z.literal("")),
  isPrimary: z.boolean().optional(),
});

export type StaffContactFormData = z.infer<typeof staffContactSchema>;
