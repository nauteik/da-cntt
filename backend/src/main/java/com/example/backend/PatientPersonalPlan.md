## Implementation Plan: Patient Personal Details Retrieval

This document outlines the plan to implement the retrieval of patient personal details, focusing on efficiency and maintainability.

### 1. Service Layer (`PatientServiceImpl.java`)

#### 1.1. Define Service Method

- **Method Signature:** `PatientPersonalDTO getPatientPersonalDetails(UUID patientId)`
- **Purpose:** Orchestrates the retrieval of patient data and maps it to the `PatientPersonalDTO`.

#### 1.2. Primary Entity Fetch

- **Objective:** Retrieve the core `Patient` entity and associated data efficiently, avoiding the N+1 problem.
- **Strategy:** Use multiple targeted queries within a single `@Transactional` method.

  - **Query 1: Fetch Core Patient Entity**

    - Use `PatientRepository.findById(patientId)` to fetch the core `Patient` entity.

  - **Query 2: Fetch Patient Addresses**

    - Use `PatientAddressRepository.findByPatientId(patientId)` to fetch all `PatientAddress` entities associated with the patient.

  - **Query 3: Fetch Patient Contacts**
    - Use `PatientContactRepository.findByPatientId(patientId)` to fetch all `PatientContact` entities associated with the patient.

#### 1.3. Data Mapping (Manual DTO Transformation)

- **Objective:** Map the fetched entities to the `PatientPersonalDTO` and its nested DTOs (`AddressDTO`, `ContactDTO`).
- **Implementation:**
  - Create a new `PatientPersonalDTO`.
  - Populate the DTO with data from the `Patient` entity.
  - Iterate through the `List<PatientAddress>` and map each `PatientAddress` and its associated `Address` to an `AddressDTO`, adding it to the `PatientPersonalDTO.addresses` list.
  - Iterate through the `List<PatientContact>` and map each `PatientContact` to a `ContactDTO`, adding it to the `PatientPersonalDTO.contacts` list.

#### 1.4. Error Handling

- **Objective:** Handle cases where the patient is not found.
- **Implementation:**
  - If `PatientRepository.findById(patientId)` returns an empty result, throw a `ResourceNotFoundException`.

### 2. Repository Layer

#### 2.1. `PatientAddressRepository.java`

- **Method:** `List<PatientAddress> findByPatientId(UUID patientId)`
- **Purpose:** Retrieves all `PatientAddress` entities associated with a given `patientId`.
- **Implementation:** Spring Data JPA automatically implements this method based on its name.

#### 2.2. `PatientContactRepository.java`

- **Create Interface:** Create a new interface `PatientContactRepository` extending `JpaRepository<PatientContact, UUID>`.
- **Method:** `List<PatientContact> findByPatientId(UUID patientId)`
- **Purpose:** Retrieves all `PatientContact` entities associated with a given `patientId`.
- **Implementation:** Spring Data JPA automatically implements this method based on its name.
