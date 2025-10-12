# Edit Patient Forms Implementation

## Overview

This document describes the implementation of edit functionality for patient identifiers and personal information, including backend DTOs, API endpoints, and frontend form integration.

## Backend Changes

### 1. DTOs Created

#### UpdatePatientIdentifiersDTO.java

- **Location**: `backend/src/main/java/com/example/backend/model/dto/UpdatePatientIdentifiersDTO.java`
- **Fields**:
  - `clientId` (required, max 50 chars)
  - `medicaidId` (required, max 50 chars)
  - `ssn` (optional, format: XXX-XX-XXXX)
  - `agencyId` (optional, max 50 chars)
- **Validation**: Bean Validation annotations for all fields

#### UpdatePatientPersonalDTO.java

- **Location**: `backend/src/main/java/com/example/backend/model/dto/UpdatePatientPersonalDTO.java`
- **Fields**:
  - `firstName` (required, max 100 chars)
  - `lastName` (required, max 100 chars)
  - `dob` (optional, must be in the past)
  - `gender` (optional, max 20 chars)
  - `primaryLanguage` (optional, max 50 chars)
- **Validation**: Bean Validation annotations for all fields

### 2. Repository Methods Added

#### PatientRepository.java

- `Optional<Patient> findByClientId(String clientId)` - Find patient by client ID
- `Optional<Patient> findBySsn(String ssn)` - Find patient by SSN

### 3. Service Methods

#### PatientService.java (Interface)

- `PatientHeaderDTO updatePatientIdentifiers(UUID patientId, UpdatePatientIdentifiersDTO updateDTO)`
- `PatientPersonalDTO updatePatientPersonal(UUID patientId, UpdatePatientPersonalDTO updateDTO)`

#### PatientServiceImpl.java (Implementation)

##### updatePatientIdentifiers

1. Finds patient by ID
2. Validates medicaid ID uniqueness (if changed)
3. Validates client ID uniqueness (if changed)
4. Validates SSN uniqueness (if provided and changed)
5. Updates patient identifiers
6. Returns updated patient header DTO

##### updatePatientPersonal

1. Finds patient with relationships
2. Updates personal information fields
3. Saves patient
4. Returns updated patient personal DTO

### 4. Controller Endpoints

#### PatientController.java

##### PUT /api/patients/{id}/identifiers

- **Authorization**: ADMIN or MANAGER role required
- **Request Body**: UpdatePatientIdentifiersDTO
- **Response**: ApiResponse<PatientHeaderDTO>
- **Status**: 200 OK on success
- **Errors**:
  - 404 if patient not found
  - 409 if medicaid ID, client ID, or SSN already exists

##### PUT /api/patients/{id}/personal

- **Authorization**: ADMIN or MANAGER role required
- **Request Body**: UpdatePatientPersonalDTO
- **Response**: ApiResponse<PatientPersonalDTO>
- **Status**: 200 OK on success
- **Errors**:
  - 404 if patient not found

## Frontend Changes

### 1. EditIdentifiersForm.tsx

#### New Props Added

- `patientId: string` - Patient UUID for API endpoint
- `onUpdateSuccess?: () => void` - Callback when update succeeds

#### Changes Made

- Added `useApiMutation` hook for PUT request to `/patients/{id}/identifiers`
- Added `showSuccess` state for success message
- Implemented `onSubmit` function:
  - Calls mutation with form data
  - Shows success message for 3 seconds
  - Calls `onUpdateSuccess` callback if provided
  - Errors handled automatically by useApiMutation
- Added error message display (shows mutation error)
- Added success message display with CheckCircleOutlined icon
- Updated footer buttons:
  - Disabled during mutation
  - Show loading state on submit button
  - Changed text to uppercase (CANCEL, SAVE)

### 2. EditPersonalInfoForm.tsx

#### New Props Added

- `patientId: string` - Patient UUID for API endpoint
- `onUpdateSuccess?: () => void` - Callback when update succeeds

#### Changes Made

- Added `useApiMutation` hook for PUT request to `/patients/{id}/personal`
- Added `showSuccess` state for success message
- Implemented `onSubmit` function:
  - Calls mutation with form data
  - Shows success message for 3 seconds
  - Calls `onUpdateSuccess` callback if provided
  - Errors handled automatically by useApiMutation
- Added error message display (shows mutation error)
- Added success message display with CheckCircleOutlined icon
- Updated footer buttons:
  - Disabled during mutation
  - Show loading state on submit button
  - Changed text to uppercase (CANCEL, SAVE)

### 3. PatientPersonal.tsx

#### Changes Made

- Added `useQueryClient` hook from `@tanstack/react-query`
- Updated EditIdentifiersForm usage:
  - Added `patientId={patient.id}` prop
  - Added `onUpdateSuccess` callback that invalidates React Query cache:
    - Invalidates `patient-header` query
    - Invalidates `patient-personal` query
- Updated EditPersonalInfoForm usage:
  - Added `patientId={patient.id}` prop
  - Added `onUpdateSuccess` callback that invalidates React Query cache:
    - Invalidates `patient-header` query
    - Invalidates `patient-personal` query

#### Cache Invalidation Strategy

After a successful update, the component invalidates both the header and personal data queries. This triggers React Query to refetch the data from the server, ensuring the UI displays the latest information without requiring a page refresh (F5).

## Success/Error Message Behavior

### Success Messages

- **Display**: Green text with CheckCircleOutlined icon
- **Duration**: 3 seconds (auto-hide)
- **Location**: Between form content and footer
- **Behavior**: Form does NOT close automatically (per requirement)

### Error Messages

- **Display**: Red text
- **Duration**: Until form is closed or submission succeeds
- **Location**: Between form content and footer
- **Content**: Shows error message from backend API

## Testing Checklist

### Backend

- [ ] Create patient and verify identifiers can be updated
- [ ] Verify duplicate medicaid ID is rejected
- [ ] Verify duplicate client ID is rejected
- [ ] Verify duplicate SSN is rejected
- [ ] Verify personal information can be updated
- [ ] Verify authorization works (only ADMIN/MANAGER can update)

### Frontend

- [ ] Open edit identifiers form and submit changes
- [ ] Verify success message appears for 3 seconds
- [ ] Verify form stays open after success
- [ ] Open edit personal info form and submit changes
- [ ] Verify success message appears for 3 seconds
- [ ] Verify form stays open after success
- [ ] Test error scenarios (duplicate IDs)
- [ ] Verify error messages display correctly
- [ ] Verify loading states on buttons
- [ ] Verify buttons are disabled during submission

## API Examples

### Update Identifiers

```bash
PUT /api/patients/3c46e553-ffc9-43e6-8964-a822915914c3/identifiers
Authorization: Bearer {token}
Content-Type: application/json

{
  "clientId": "CL-ABC123",
  "medicaidId": "M987654321",
  "ssn": "123-45-6789",
  "agencyId": "AG-001"
}
```

### Update Personal Information

```bash
PUT /api/patients/3c46e553-ffc9-43e6-8964-a822915914c3/personal
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-01-15",
  "gender": "Male",
  "primaryLanguage": "English"
}
```

## Notes

- Forms use React Hook Form with Zod validation
- API calls use the custom `useApiMutation` hook from `useApi.ts`
- Success messages auto-hide after 3 seconds but form remains open
- Error messages persist until dismissed or form succeeds
- Both endpoints require authentication and ADMIN/MANAGER role
