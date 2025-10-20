# Shared Validation Schemas

This directory contains reusable Zod validation schemas that ensure consistency across all forms in the application.

## 📁 Structure

```
schemas/
├── patientSchemas.ts    # Patient-related form schemas
└── README.md           # This file
```

## 🎯 Purpose

- **Consistency**: All forms use the same validation rules
- **Maintainability**: Update validation in one place
- **Type Safety**: TypeScript types derived from schemas
- **Backend Alignment**: Matches backend DTO validation

## 📝 Available Schemas

### Patient Forms

Located in `patientSchemas.ts`:

#### 1. `identifiersSchema`
Used in: `EditIdentifiersForm.tsx`

Validates patient identifiers (Client ID, Medicaid ID, SSN, Agency ID)

```typescript
import { identifiersSchema, type IdentifiersFormData } from "@/schemas/patientSchemas";

const form = useForm<IdentifiersFormData>({
  resolver: zodResolver(identifiersSchema),
});
```

#### 2. `personalInfoSchema`
Used in: `EditPersonalInfoForm.tsx`

Validates personal information (name, DOB, gender, language)

```typescript
import { personalInfoSchema, type PersonalInfoFormData } from "@/schemas/patientSchemas";
```

#### 3. `addressSchema`
Used in: `EditAddressForm.tsx`

Validates address fields (line1, city, state, ZIP, phone, email)

```typescript
import { addressSchema, type AddressFormData } from "@/schemas/patientSchemas";
```

#### 4. `contactSchema`
Used in: `EditContactForm.tsx`

Validates emergency contact fields (relation, name, phone, email)

```typescript
import { contactSchema, type ContactFormData } from "@/schemas/patientSchemas";
```

## 🔧 Reusable Field Schemas

These can be imported individually for custom forms:

```typescript
import {
  phoneSchema,         // Required phone validation
  phoneOptionalSchema, // Optional phone validation
  emailSchema,         // Required email validation
  emailOptionalSchema, // Optional email validation
  zipCodeSchema,       // ZIP code validation
  ssnSchema,           // SSN validation
  numericIdSchema,     // Numeric ID validation (function)
} from "@/schemas/patientSchemas";
```

### Example: Custom Form

```typescript
import { z } from "zod";
import { phoneSchema, emailOptionalSchema } from "@/schemas/patientSchemas";

const customSchema = z.object({
  officePhone: phoneSchema,
  officeEmail: emailOptionalSchema,
  // ... other fields
});
```

## 📚 Constants

Validation constants and select options are in `@/constants/validation`:

```typescript
import {
  VALIDATION_REGEX,      // Regex patterns
  VALIDATION_MESSAGES,   // Error messages
  FIELD_CONSTRAINTS,     // Max lengths, etc.
  ADDRESS_TYPES,         // Select options for address types
  GENDER_OPTIONS,        // Select options for gender
  RELATIONSHIP_OPTIONS,  // Select options for relationships
  LANGUAGE_OPTIONS,      // Select options for languages
  US_STATES,            // Select options for US states
} from "@/constants/validation";
```

## 🔍 Backend Alignment

All schemas match their corresponding backend DTOs:

| Frontend Schema        | Backend DTO                     |
|------------------------|--------------------------------|
| `identifiersSchema`    | `UpdatePatientIdentifiersDTO`  |
| `personalInfoSchema`   | `UpdatePatientPersonalDTO`     |
| `addressSchema`        | `UpdatePatientAddressDTO`      |
| `contactSchema`        | `UpdatePatientContactDTO`      |

### Validation Rules Match

**Example: Phone Number**

Backend (Java):
```java
@Pattern(regexp = "^(\\(\\d{3}\\)\\s?|\\d{3}-)\\d{3}-\\d{4}$", 
         message = "Phone must be in format (XXX) XXX-XXXX or XXX-XXX-XXXX")
```

Frontend (TypeScript):
```typescript
export const phoneSchema = z
  .string()
  .regex(VALIDATION_REGEX.PHONE, VALIDATION_MESSAGES.PHONE_INVALID);

// VALIDATION_REGEX.PHONE = /^((\(\d{3}\)\s?)|\d{3}-)\d{3}-\d{4}$/
```

## ✨ Best Practices

### 1. Always Use Shared Schemas

❌ **Bad:**
```typescript
// Inline validation in component
const schema = z.object({
  phone: z.string().regex(/phone-pattern/, "Invalid phone"),
  email: z.string().email(),
});
```

✅ **Good:**
```typescript
// Import from shared schemas
import { contactSchema } from "@/schemas/patientSchemas";
```

### 2. Extend Schemas When Needed

If you need to add custom fields:

```typescript
import { addressSchema } from "@/schemas/patientSchemas";

const extendedAddressSchema = addressSchema.extend({
  notes: z.string().optional(),
  priority: z.number(),
});
```

### 3. Use Constants for Options

❌ **Bad:**
```typescript
<Select options={[
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" }
]} />
```

✅ **Good:**
```typescript
import { GENDER_OPTIONS } from "@/constants/validation";

<Select options={GENDER_OPTIONS} />
```

### 4. Keep Error Messages Consistent

Use `VALIDATION_MESSAGES` instead of hardcoding:

```typescript
import { VALIDATION_MESSAGES } from "@/constants/validation";

const schema = z.object({
  name: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED),
});
```

## 🔄 Updating Validations

When backend DTOs change:

1. Update regex/constraints in `constants/validation.ts`
2. Update schemas in `schemas/patientSchemas.ts`
3. Test affected forms
4. Update this README if needed

### Example Change

**Backend adds new field:**
```java
// UpdatePatientAddressDTO.java
@Size(max = 50)
private String apartment;
```

**Update frontend:**

1. Add to constants:
```typescript
// constants/validation.ts
export const FIELD_CONSTRAINTS = {
  // ...
  APARTMENT_MAX: 50,
};
```

2. Add to schema:
```typescript
// schemas/patientSchemas.ts
export const addressSchema = z.object({
  // ...existing fields
  apartment: z
    .string()
    .max(FIELD_CONSTRAINTS.APARTMENT_MAX, VALIDATION_MESSAGES.MAX_LENGTH(50))
    .optional(),
});
```

3. Update form component to use new field.

## 🧪 Testing Validation

Example test:

```typescript
import { addressSchema } from "@/schemas/patientSchemas";

describe("addressSchema", () => {
  it("should validate valid address", () => {
    const result = addressSchema.safeParse({
      line1: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      county: "Manhattan",
      phone: "(555) 123-4567",
      isMain: true,
    });
    
    expect(result.success).toBe(true);
  });
  
  it("should reject invalid ZIP code", () => {
    const result = addressSchema.safeParse({
      // ... other valid fields
      postalCode: "ABC",
    });
    
    expect(result.success).toBe(false);
  });
});
```

## 📖 References

- [Zod Documentation](https://zod.dev/)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- Backend DTOs: `backend/src/main/java/com/example/backend/model/dto/`

