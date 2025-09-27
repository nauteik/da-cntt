-- BAC-HMS Schema Definition (PostgreSQL)
-- Generated based on SRS requirements for Blue Angels Care Health Management System

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE organization (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    legal_name text,
    tax_id text,
    email text,
    phone text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX idx_organization_deleted_at ON organization (deleted_at);

CREATE TABLE address (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    line1 text NOT NULL,
    line2 text,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text NOT NULL DEFAULT 'USA',
    latitude numeric(9,6),
    longitude numeric(9,6),
    meta jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_address_org ON address (organization_id);
CREATE INDEX idx_address_coordinates ON address (latitude, longitude);

CREATE TABLE office (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    address_id uuid REFERENCES address(id) ON DELETE SET NULL,
    code text NOT NULL,
    name text NOT NULL,
    county text,
    phone text,
    email text,
    timezone text NOT NULL DEFAULT 'America/New_York',
    billing_config jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT office_org_code_unique UNIQUE (organization_id, code)
);

CREATE INDEX idx_office_org ON office (organization_id);
CREATE INDEX idx_office_deleted_at ON office (deleted_at);

CREATE TABLE module (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE service_type (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    code text NOT NULL,
    name text NOT NULL,
    care_setting text NOT NULL DEFAULT 'non_residential',
    description text,
    unit_basis text NOT NULL DEFAULT '15min',
    is_billable boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT service_type_org_code_unique UNIQUE (organization_id, code),
    CONSTRAINT service_type_care_setting_check CHECK (care_setting IN ('residential', 'non_residential'))
);

CREATE INDEX idx_service_type_org ON service_type (organization_id);
CREATE INDEX idx_service_type_setting ON service_type (organization_id, care_setting);

CREATE TABLE payor (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL DEFAULT 'Medicaid',
    payer_identifier text,
    submission_endpoint text,
    config jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT payor_org_name_unique UNIQUE (organization_id, name)
);

CREATE INDEX idx_payor_org ON payor (organization_id);

CREATE TABLE app_user (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    username text NOT NULL,
    email text,
    password_hash text NOT NULL,
    display_name text NOT NULL,
    phone text,
    is_active boolean NOT NULL DEFAULT true,
    mfa_enabled boolean NOT NULL DEFAULT false,
    last_login_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid,
    deleted_at timestamptz,
    preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT app_user_org_username_unique UNIQUE (organization_id, username),
    CONSTRAINT app_user_org_email_unique UNIQUE (organization_id, email)
);

CREATE INDEX idx_app_user_org ON app_user (organization_id);
CREATE INDEX idx_app_user_deleted_at ON app_user (deleted_at);

CREATE TABLE role (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    is_system boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT role_org_code_unique UNIQUE (organization_id, code)
);

CREATE INDEX idx_role_deleted_at ON role (deleted_at);

CREATE TABLE permission (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organization(id) ON DELETE CASCADE,
    module_id uuid REFERENCES module(id) ON DELETE SET NULL,
    resource text NOT NULL,
    action text NOT NULL,
    scope text NOT NULL DEFAULT 'org',
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT permission_unique UNIQUE (organization_id, resource, action, scope)
);

CREATE TABLE role_permission (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id uuid NOT NULL REFERENCES role(id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES permission(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT role_permission_unique UNIQUE (role_id, permission_id)
);

CREATE TABLE user_role (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES role(id) ON DELETE CASCADE,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    assigned_by uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
    CONSTRAINT user_role_unique UNIQUE (user_id, role_id));

CREATE TABLE user_office (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    office_id uuid NOT NULL REFERENCES office(id) ON DELETE CASCADE,
    is_primary boolean NOT NULL DEFAULT false,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
    CONSTRAINT user_office_unique UNIQUE (user_id, office_id));

CREATE TABLE org_setting (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    office_id uuid REFERENCES office(id) ON DELETE CASCADE,
    key text NOT NULL,
    value text,
    value_type text NOT NULL DEFAULT 'string',
    is_sensitive boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid,
    CONSTRAINT org_setting_scope_unique UNIQUE (organization_id, office_id, key)
);

CREATE TABLE api_key (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    name text NOT NULL,
    key_hash text NOT NULL,
    scopes text[] NOT NULL DEFAULT '{}',
    expires_at timestamptz,
    is_active boolean NOT NULL DEFAULT true,
    last_used_at timestamptz,
    last_used_ip text,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    CONSTRAINT api_key_hash_unique UNIQUE (key_hash));

CREATE TABLE audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    office_id uuid REFERENCES office(id) ON DELETE SET NULL,
    user_id uuid REFERENCES app_user(id) ON DELETE SET NULL,
    module_code text NOT NULL,
    entity_name text NOT NULL,
    entity_id uuid,
    action text NOT NULL,
    before_state jsonb,
    after_state jsonb,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_org_module ON audit_log (organization_id, module_code, created_at DESC);

CREATE TABLE file_object (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    office_id uuid REFERENCES office(id) ON DELETE SET NULL,
    filename text NOT NULL,
    mime_type text NOT NULL,
    size_bytes bigint NOT NULL CHECK (size_bytes >= 0),
    storage_uri text NOT NULL,
    sha256 text,
    meta jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES app_user(id) ON DELETE SET NULL,
    CONSTRAINT file_object_sha_unique UNIQUE (organization_id, sha256));

CREATE INDEX idx_file_object_org ON file_object (organization_id);

CREATE TABLE staff (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    office_id uuid NOT NULL REFERENCES office(id) ON DELETE CASCADE,
    user_id uuid UNIQUE REFERENCES app_user(id) ON DELETE SET NULL,
    employee_code text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    dob date,
    gender text,
    hire_date date,
    termination_date date,
    is_active boolean NOT NULL DEFAULT true,
    portrait_file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,
    custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT staff_org_code_unique UNIQUE (organization_id, employee_code)
);

CREATE INDEX idx_staff_office ON staff (office_id);
CREATE INDEX idx_staff_deleted_at ON staff (deleted_at);

CREATE TABLE staff_document (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    doc_type text NOT NULL,
    title text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_document_staff ON staff_document (staff_id, doc_type);

CREATE TABLE document_version (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_document_id uuid NOT NULL REFERENCES staff_document(id) ON DELETE CASCADE,
    file_id uuid NOT NULL REFERENCES file_object(id) ON DELETE CASCADE,
    version_no integer NOT NULL,
    checksum text,
    signed boolean NOT NULL DEFAULT false,
    signer_id uuid REFERENCES app_user(id) ON DELETE SET NULL,
    signed_at timestamptz,
    effective_at timestamptz,
    expires_at timestamptz,
    meta jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT document_version_unique UNIQUE (staff_document_id, version_no)
);

CREATE TABLE staff_certification (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    cert_type text NOT NULL,
    issuer text,
    issued_at date,
    expires_at date,
    certificate_file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'valid',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_certification_staff ON staff_certification (staff_id, cert_type);

CREATE TABLE background_check (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    check_type text NOT NULL,
    status text NOT NULL,
    checked_at date,
    next_due_at date,
    evidence_file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_background_check_staff ON background_check (staff_id, check_type);

CREATE TABLE staff_availability (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
    start_time time NOT NULL,
    end_time time NOT NULL,
    note text,
    repeats boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (end_time > start_time)
);

CREATE INDEX idx_staff_availability_staff ON staff_availability (staff_id, weekday);

CREATE TABLE staff_rate (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_type_id uuid REFERENCES service_type(id) ON DELETE SET NULL,
    pay_basis text NOT NULL DEFAULT 'per_unit',
    hourly_rate numeric(10,2),
    effective_at date NOT NULL,
    expires_at date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_rate_staff ON staff_rate (staff_id, service_type_id);

CREATE TABLE patient (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    office_id uuid NOT NULL REFERENCES office(id) ON DELETE CASCADE,
    mrn text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    dob date,
    gender text,
    address_id uuid REFERENCES address(id) ON DELETE SET NULL,
    primary_language text,
    guardian_name text,
    guardian_phone text,
    medical_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT patient_org_mrn_unique UNIQUE (organization_id, mrn)
);

CREATE INDEX idx_patient_office ON patient (office_id);
CREATE INDEX idx_patient_deleted_at ON patient (deleted_at);

CREATE TABLE patient_contact (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    relation text NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    address_id uuid REFERENCES address(id) ON DELETE SET NULL,
    is_primary boolean NOT NULL DEFAULT false,
    last_verified_at date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_patient_contact_patient ON patient_contact (patient_id);

CREATE TABLE patient_provider (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    role text NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    npi text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_patient_provider_patient ON patient_provider (patient_id, role);

CREATE TABLE residence_stay (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    residence_type text NOT NULL,
    address_id uuid REFERENCES address(id) ON DELETE SET NULL,
    move_in_at date NOT NULL,
    move_out_at date,
    lease_file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,
    note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_residence_stay_patient ON residence_stay (patient_id, move_in_at);

CREATE TABLE isp (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    current_status text NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT isp_patient_status_unique UNIQUE (patient_id, current_status)
);

CREATE TABLE isp_version (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    isp_id uuid NOT NULL REFERENCES isp(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    version_no integer NOT NULL,
    effective_at date NOT NULL,
    expires_at date,
    status text NOT NULL DEFAULT 'draft',
    file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT isp_version_unique UNIQUE (isp_id, version_no)
);

CREATE INDEX idx_isp_version_status ON isp_version (status);

CREATE TABLE isp_goal (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    isp_version_id uuid NOT NULL REFERENCES isp_version(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    measure text,
    sort_order integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX idx_isp_goal_version ON isp_goal (isp_version_id);

CREATE TABLE isp_task (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    isp_goal_id uuid NOT NULL REFERENCES isp_goal(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    task text NOT NULL,
    frequency text,
    required boolean NOT NULL DEFAULT true,
    sort_order integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX idx_isp_task_goal ON isp_task (isp_goal_id);

CREATE TABLE service_authorization (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    isp_version_id uuid NOT NULL REFERENCES isp_version(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    service_type_id uuid REFERENCES service_type(id) ON DELETE SET NULL,
    payor_id uuid REFERENCES payor(id) ON DELETE SET NULL,
    units_authorized integer NOT NULL CHECK (units_authorized >= 0),
    period text NOT NULL,
    allocation jsonb NOT NULL DEFAULT '{}'::jsonb,
    effective_at date NOT NULL,
    expires_at date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_authorization_version ON service_authorization (isp_version_id);

CREATE TABLE unit_consumption (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_authorization_id uuid NOT NULL REFERENCES service_authorization(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    source_type text NOT NULL,
    source_id uuid,
    service_date date NOT NULL,
    units_used integer NOT NULL CHECK (units_used >= 0),
    recorded_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX idx_unit_consumption_auth_date ON unit_consumption (service_authorization_id, service_date);

CREATE TABLE isp_acknowledgement (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    isp_version_id uuid NOT NULL REFERENCES isp_version(id) ON DELETE CASCADE,
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    acknowledged_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
    CONSTRAINT isp_acknowledgement_unique UNIQUE (isp_version_id, staff_id));

CREATE TABLE progress_report (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    isp_version_id uuid NOT NULL REFERENCES isp_version(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    period_start date NOT NULL,
    period_end date NOT NULL,
    summary jsonb NOT NULL DEFAULT '{}'::jsonb,
    file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,
    generated_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX idx_progress_report_period ON progress_report (isp_version_id, period_start);

CREATE TABLE weekly_schedule (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    office_id uuid NOT NULL REFERENCES office(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    isp_version_id uuid REFERENCES isp_version(id) ON DELETE SET NULL,
    week_start date NOT NULL,
    status text NOT NULL DEFAULT 'draft',
    unit_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    CONSTRAINT weekly_schedule_unique UNIQUE (patient_id, week_start));

CREATE INDEX idx_weekly_schedule_office ON weekly_schedule (office_id, week_start);

CREATE TABLE schedule_shift (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_schedule_id uuid NOT NULL REFERENCES weekly_schedule(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    office_id uuid NOT NULL REFERENCES office(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    service_type_id uuid REFERENCES service_type(id) ON DELETE SET NULL,
    isp_goal_id uuid REFERENCES isp_goal(id) ON DELETE SET NULL,
    start_at timestamptz NOT NULL,
    end_at timestamptz NOT NULL,
    planned_units integer NOT NULL CHECK (planned_units >= 0),
    status text NOT NULL DEFAULT 'planned',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (end_at > start_at)
);

CREATE INDEX idx_schedule_shift_schedule ON schedule_shift (weekly_schedule_id);
CREATE INDEX idx_schedule_shift_time ON schedule_shift (patient_id, start_at);

CREATE TABLE shift_assignment (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_shift_id uuid NOT NULL REFERENCES schedule_shift(id) ON DELETE CASCADE,
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'primary',
    assignment_status text NOT NULL DEFAULT 'assigned',
    assigned_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
    CONSTRAINT shift_assignment_unique UNIQUE (schedule_shift_id, staff_id));

CREATE TABLE shift_change_request (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_shift_id uuid NOT NULL REFERENCES schedule_shift(id) ON DELETE CASCADE,
    requested_by_staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    request_type text NOT NULL,
    reason text,
    status text NOT NULL DEFAULT 'pending',
    requested_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX idx_shift_change_request_shift ON shift_change_request (schedule_shift_id, status);

CREATE TABLE shift_change_approval (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    change_request_id uuid NOT NULL REFERENCES shift_change_request(id) ON DELETE CASCADE,
    approver_id uuid NOT NULL REFERENCES staff(id) ON DELETE SET NULL,
    decision text NOT NULL,
    decided_at timestamptz NOT NULL DEFAULT now(),
    note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX idx_shift_change_approval_request ON shift_change_approval (change_request_id);

CREATE TABLE shift_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_shift_id uuid NOT NULL REFERENCES schedule_shift(id) ON DELETE CASCADE,
    actor_id uuid REFERENCES app_user(id) ON DELETE SET NULL,
    action text NOT NULL,
    before_state jsonb,
    after_state jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shift_log_shift ON shift_log (schedule_shift_id, created_at);

CREATE TABLE service_delivery (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_shift_id uuid REFERENCES schedule_shift(id) ON DELETE SET NULL,
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    office_id uuid REFERENCES office(id) ON DELETE SET NULL,
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE SET NULL,
    service_type_id uuid REFERENCES service_type(id) ON DELETE SET NULL,
    isp_goal_id uuid REFERENCES isp_goal(id) ON DELETE SET NULL,
    start_at timestamptz NOT NULL,
    end_at timestamptz NOT NULL,
    units integer NOT NULL CHECK (units >= 0),
    status text NOT NULL DEFAULT 'in_progress',
    approval_status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (end_at > start_at)
);

CREATE INDEX idx_service_delivery_patient ON service_delivery (patient_id, start_at);
CREATE INDEX idx_service_delivery_staff ON service_delivery (staff_id, start_at);

CREATE TABLE daily_note (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_delivery_id uuid NOT NULL REFERENCES service_delivery(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    author_staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE SET NULL,
    content text NOT NULL,
    checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
    patient_signed boolean NOT NULL DEFAULT false,
    patient_signer_name text,
    patient_signed_at timestamptz,
    staff_signed boolean NOT NULL DEFAULT false,
    staff_signed_at timestamptz,
    attachment_file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE medication_order (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    prescribing_provider text,
    drug_name text NOT NULL,
    dosage text NOT NULL,
    route text NOT NULL,
    frequency text NOT NULL,
    indication text,
    is_prn boolean NOT NULL DEFAULT false,
    start_at date NOT NULL,
    end_at date,
    status text NOT NULL DEFAULT 'active',
    prescription_file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,
    interaction_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_medication_order_patient ON medication_order (patient_id, status);

CREATE TABLE prn_rule (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_order_id uuid NOT NULL REFERENCES medication_order(id) ON DELETE CASCADE,
    conditions text,
    follow_up text,
    max_per_day integer,
    min_interval_minutes integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX idx_prn_rule_order ON prn_rule (medication_order_id);

CREATE TABLE medication_administration (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    medication_order_id uuid NOT NULL REFERENCES medication_order(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    service_delivery_id uuid REFERENCES service_delivery(id) ON DELETE SET NULL,
    administered_at timestamptz NOT NULL,
    dose_given text,
    status text NOT NULL DEFAULT 'given',
    is_prn boolean NOT NULL DEFAULT false,
    prn_reason text,
    prn_follow_up text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_medication_administration_patient ON medication_administration (patient_id, administered_at);

CREATE TABLE incident (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    office_id uuid REFERENCES office(id) ON DELETE SET NULL,
    patient_id uuid REFERENCES patient(id) ON DELETE SET NULL,
    reported_by_staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    occurred_at timestamptz NOT NULL,
    type text NOT NULL,
    severity text,
    description text,
    status text NOT NULL DEFAULT 'draft',
    evidence_file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_incident_occurrence ON incident (organization_id, occurred_at DESC);

CREATE TABLE incident_party (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id uuid NOT NULL REFERENCES incident(id) ON DELETE CASCADE,
    staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    patient_id uuid REFERENCES patient(id) ON DELETE SET NULL,
    role text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX idx_incident_party_incident ON incident_party (incident_id);

CREATE TABLE check_event (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    patient_id uuid REFERENCES patient(id) ON DELETE SET NULL,
    schedule_shift_id uuid REFERENCES schedule_shift(id) ON DELETE SET NULL,
    service_delivery_id uuid REFERENCES service_delivery(id) ON DELETE SET NULL,
    event_type text NOT NULL,
    occurred_at timestamptz NOT NULL,
    latitude numeric(9,6),
    longitude numeric(9,6),
    accuracy_m numeric(6,2),
    method text NOT NULL DEFAULT 'mobile',
    status text NOT NULL DEFAULT 'ok',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_check_event_staff_time ON check_event (staff_id, occurred_at);
CREATE INDEX idx_check_event_patient_time ON check_event (patient_id, occurred_at);

CREATE TABLE check_exception (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    check_event_id uuid NOT NULL REFERENCES check_event(id) ON DELETE CASCADE,
    submitted_by_staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    reason text NOT NULL,
    approval_status text NOT NULL DEFAULT 'pending',
    approved_by_staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    approved_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_check_exception_event ON check_exception (check_event_id);

CREATE TABLE device (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    platform text NOT NULL,
    device_identifier text NOT NULL,
    push_token text,
    status text NOT NULL DEFAULT 'active',
    registered_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
    CONSTRAINT device_unique_identifier UNIQUE (organization_id, device_identifier));

CREATE TABLE mobile_session (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    device_id uuid REFERENCES device(id) ON DELETE SET NULL,
    provider text NOT NULL DEFAULT 'local',
    ip_address text,
    user_agent text,
    started_at timestamptz NOT NULL DEFAULT now(),
    ended_at timestamptz,
    mfa_passed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX idx_mobile_session_user ON mobile_session (user_id, started_at DESC);

CREATE TABLE offline_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    operation_type text NOT NULL,
    sync_status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    synced_at timestamptz,
    error_message text
);

CREATE INDEX idx_offline_queue_user ON offline_queue (user_id, sync_status);

CREATE TABLE mobile_notification (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    notification_type text NOT NULL,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    channel text NOT NULL DEFAULT 'push',
    status text NOT NULL DEFAULT 'queued',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    sent_at timestamptz,
    read_at timestamptz
);

CREATE INDEX idx_mobile_notification_user ON mobile_notification (user_id, status);

CREATE TABLE vital_reading (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    measured_at timestamptz NOT NULL,
    systolic integer,
    diastolic integer,
    heart_rate integer,
    respiratory_rate integer,
    temperature_c numeric(4,1),
    glucose numeric(6,2),
    o2_sat integer,
    meta jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX idx_vital_reading_patient ON vital_reading (patient_id, measured_at);

CREATE TABLE fire_drill (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    office_id uuid REFERENCES office(id) ON DELETE SET NULL,
    drill_date date NOT NULL,
    drill_time time NOT NULL,
    location text NOT NULL,
    session_type text NOT NULL,
    evacuation_time_sec integer NOT NULL CHECK (evacuation_time_sec >= 0),
    participants_count integer NOT NULL DEFAULT 0,
    exit_type text,
    status text NOT NULL DEFAULT 'scheduled',
    report_file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,
    created_by uuid REFERENCES app_user(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fire_drill_date ON fire_drill (organization_id, drill_date);

CREATE TABLE fire_drill_participant (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fire_drill_id uuid NOT NULL REFERENCES fire_drill(id) ON DELETE CASCADE,
    staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    patient_id uuid REFERENCES patient(id) ON DELETE SET NULL,
    role text NOT NULL,
    acknowledged boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX idx_fire_drill_participant_drill ON fire_drill_participant (fire_drill_id);

CREATE TABLE fire_drill_issue (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fire_drill_id uuid NOT NULL REFERENCES fire_drill(id) ON DELETE CASCADE,
    issue_type text NOT NULL,
    severity text NOT NULL,
    description text,
    remediation_notes text,
    incident_id uuid REFERENCES incident(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX idx_fire_drill_issue_drill ON fire_drill_issue (fire_drill_id);

CREATE TABLE rate_card (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    name text NOT NULL,
    scope text NOT NULL DEFAULT 'org',
    effective_at date NOT NULL,
    expires_at date,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT rate_card_org_name_unique UNIQUE (organization_id, name));

CREATE TABLE rate_entry (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_card_id uuid NOT NULL REFERENCES rate_card(id) ON DELETE CASCADE,
    service_type_id uuid REFERENCES service_type(id) ON DELETE SET NULL,
    staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    patient_id uuid REFERENCES patient(id) ON DELETE SET NULL,
    rate numeric(10,2) NOT NULL CHECK (rate >= 0),
    pay_basis text NOT NULL DEFAULT 'per_unit',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
    CONSTRAINT rate_entry_unique_scope UNIQUE (rate_card_id, service_type_id, staff_id, patient_id));

CREATE INDEX idx_rate_entry_card ON rate_entry (rate_card_id);

CREATE TABLE claim (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    office_id uuid REFERENCES office(id) ON DELETE SET NULL,
    payor_id uuid NOT NULL REFERENCES payor(id) ON DELETE SET NULL,
    claim_number text NOT NULL,
    status text NOT NULL DEFAULT 'draft',
    submitted_at timestamptz,
    total_amount numeric(12,2),
    meta jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT claim_org_number_unique UNIQUE (organization_id, claim_number));

CREATE INDEX idx_claim_status ON claim (status);

CREATE TABLE claim_line (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id uuid NOT NULL REFERENCES claim(id) ON DELETE CASCADE,
    service_delivery_id uuid REFERENCES service_delivery(id) ON DELETE SET NULL,
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    service_type_id uuid REFERENCES service_type(id) ON DELETE SET NULL,
    service_date date NOT NULL,
    units integer NOT NULL CHECK (units >= 0),
    rate numeric(10,2) NOT NULL,
    amount numeric(12,2) NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    denial_reason text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX idx_claim_line_claim ON claim_line (claim_id);
CREATE INDEX idx_claim_line_service_date ON claim_line (service_date);

CREATE TABLE remittance (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    payor_id uuid REFERENCES payor(id) ON DELETE SET NULL,
    remit_number text NOT NULL,
    received_at timestamptz NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,
    meta jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT remittance_org_number_unique UNIQUE (organization_id, remit_number));

CREATE TABLE remittance_allocation (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    remittance_id uuid NOT NULL REFERENCES remittance(id) ON DELETE CASCADE,
    claim_line_id uuid REFERENCES claim_line(id) ON DELETE SET NULL,
    paid_amount numeric(12,2) NOT NULL,
    adjustment_amount numeric(12,2) NOT NULL DEFAULT 0,
    adjustment_code text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX idx_remittance_allocation_remittance ON remittance_allocation (remittance_id);

CREATE TABLE expense (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    office_id uuid REFERENCES office(id) ON DELETE SET NULL,
    category text NOT NULL,
    amount numeric(12,2) NOT NULL,
    incurred_at date NOT NULL,
    patient_id uuid REFERENCES patient(id) ON DELETE SET NULL,
    meta jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_expense_org_date ON expense (organization_id, incurred_at);

CREATE TABLE export_job (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    target text NOT NULL,
    status text NOT NULL DEFAULT 'queued',
    parameters jsonb NOT NULL DEFAULT '{}'::jsonb,
    file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    created_by uuid REFERENCES app_user(id) ON DELETE SET NULL);

CREATE INDEX idx_export_job_org_status ON export_job (organization_id, status);

-- Seed data
INSERT INTO organization (id, code, name, legal_name, tax_id, email, phone)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'BAC',
    'Blue Angels Care',
    'Blue Angels Care LLC',
    'XX-XXXXXXX',
    'info@blueangelscare.com',
    '+1-610-000-0000'
)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    legal_name = EXCLUDED.legal_name,
    tax_id = EXCLUDED.tax_id,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone;

INSERT INTO office (id, organization_id, code, name, county, phone, email, timezone, billing_config)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'MAIN',
    'BAC Main Office',
    'Delaware',
    '+1-610-000-0001',
    'office@blueangelscare.com',
    'America/New_York',
    '{"claim_submission_method":"medicaid_portal"}'::jsonb
)
ON CONFLICT (organization_id, code) DO UPDATE
SET name = EXCLUDED.name,
    county = EXCLUDED.county,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    timezone = EXCLUDED.timezone,
    billing_config = EXCLUDED.billing_config;

INSERT INTO module (code, name) VALUES
    ('ADMIN', 'System Administration'),
    ('STAFF', 'Staff Management'),
    ('PATIENT', 'Patient Records'),
    ('ISP', 'Care Plan (ISP)'),
    ('SCHEDULE', 'Weekly Scheduling'),
    ('MOBILE', 'Mobile Operations'),
    ('MEDICATION', 'Medication Management'),
    ('BILLING', 'Billing & Claims'),
    ('FIRE_DRILL', 'Fire Drill Compliance'),
    ('COMPLIANCE', 'Compliance & Audit')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO service_type (id, organization_id, code, name, care_setting, description, unit_basis)
VALUES
    -- Non-Residential (SRS 3.1)
    ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'HOME_COMM', 'Home & Community Habilitation', 'non_residential', 'Giúp người khuyết tật học duy trì kỹ năng sinh hoạt, giao tiếp xã hội, tự chăm sóc, quản lý công việc nhà.', '15min'),
    ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'COMPANION', 'Companion Services', 'non_residential', 'Hỗ trợ đồng hành hằng ngày, di lại, giao tiếp xã hội, giám sát nếu cần.', '15min'),
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'EMP_SUPPORT', 'Employment / Supported Employment', 'non_residential', 'Hỗ trợ tìm việc, đào tạo nghề, duy trì việc làm trong môi trường hòa nhập.', 'hour'),
    ('33333333-3333-3333-3333-333333333334', '11111111-1111-1111-1111-111111111111', 'THERAPY', 'Therapy Services', 'non_residential', 'Vật lý trị liệu, ngôn ngữ trị liệu, trị liệu hành vi, tư vấn tâm lý.', '15min'),
    ('33333333-3333-3333-3333-333333333335', '11111111-1111-1111-1111-111111111111', 'BEHAVIOR', 'Behavior Support', 'non_residential', 'Đánh giá hành vi, lập kế hoạch can thiệp, hỗ trợ giảm hành vi khó khăn.', '15min'),
    ('33333333-3333-3333-3333-333333333336', '11111111-1111-1111-1111-111111111111', 'TRANSPORT', 'Transportation', 'non_residential', 'Hỗ trợ di chuyển tới chương trình, công việc, y tế, hoạt động xã hội.', 'trip'),
    ('33333333-3333-3333-3333-333333333337', '11111111-1111-1111-1111-111111111111', 'RESPITE_DAY', 'Respite Services (Day/Night)', 'non_residential', 'Thay thế caregiver, giúp nghỉ ngơi ngắn hạn tại nhà hoặc ban ngày.', 'hour'),
    ('33333333-3333-3333-3333-333333333338', '11111111-1111-1111-1111-111111111111', 'ASSISTIVE', 'Assistive Technology / Environmental Modifications', 'non_residential', 'Thiết bị trợ giúp, sửa đổi nhà/công cụ hỗ trợ di chuyển, giao tiếp, an toàn.', 'item'),

    -- Residential (SRS 3.2)
    ('33333333-3333-3333-3333-333333333339', '11111111-1111-1111-1111-111111111111', 'GROUP_HOME', 'Group Homes / Community Living', 'residential', 'Nhà nhóm/căn hộ có nhân viên hỗ trợ 24/7 đảm bảo an toàn và sinh hoạt.', 'day'),
    ('33333333-3333-3333-3333-33333333333A', '11111111-1111-1111-1111-111111111111', 'LIFE_SHARING', 'Life Sharing / Family Living', 'residential', 'Người khuyết tật sống cùng gia đình host hoặc gia đình mình với hỗ trợ liên tục.', 'day'),
    ('33333333-3333-3333-3333-33333333333B', '11111111-1111-1111-1111-111111111111', 'SUPPORTED_LIVING', 'Supported / Independent Living with Supports', 'residential', 'Sống độc lập với hỗ trợ theo nhu cầu: trợ giúp nhà cửa, y tế, quản lý thuốc.', 'day'),
    ('33333333-3333-3333-3333-33333333333C', '11111111-1111-1111-1111-111111111111', 'ICF', 'Intermediate Care Facilities (ICF/IID)', 'residential', 'Cơ sở giám sát cao hơn, hỗ trợ y tế/hành vi sâu hơn cho nhu cầu phức tạp.', 'day')
ON CONFLICT (organization_id, code) DO UPDATE
SET name = EXCLUDED.name,
    care_setting = EXCLUDED.care_setting,
    description = EXCLUDED.description,
    unit_basis = EXCLUDED.unit_basis;

INSERT INTO payor (id, organization_id, name, type, payer_identifier, submission_endpoint)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'PA Medicaid',
    'Medicaid',
    'PA-MA',
    'https://providerportal.dhs.pa.gov/claims'
)
ON CONFLICT (organization_id, name) DO UPDATE
SET type = EXCLUDED.type,
    payer_identifier = EXCLUDED.payer_identifier,
    submission_endpoint = EXCLUDED.submission_endpoint;

INSERT INTO role (id, organization_id, code, name, description, is_system)
VALUES
    ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', 'ADMIN', 'System Admin', 'Toàn quyền cấu hình và vận hành hệ thống', true),
    ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', 'MANAGER', 'Office Manager', 'Quản lý văn phòng, điều phối lịch và giám sát tuân thủ', false),
    ('55555555-5555-5555-5555-555555555553', '11111111-1111-1111-1111-111111111111', 'DSP', 'Direct Support Professional', 'Nhân viên chăm sóc sử dụng mobile app và ghi nhận dịch vụ', false),
    ('55555555-5555-5555-5555-555555555554', '11111111-1111-1111-1111-111111111111', 'FINANCE', 'Finance & Billing', 'Nhân viên phụ trách billing & claims', false)
ON CONFLICT (organization_id, code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_system = EXCLUDED.is_system;

INSERT INTO rate_card (id, organization_id, name, scope, effective_at)
VALUES (
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'Default Medicaid Rates',
    'org',
    '2025-01-01'
)
ON CONFLICT (organization_id, name) DO UPDATE
SET scope = EXCLUDED.scope,
    effective_at = EXCLUDED.effective_at;

INSERT INTO rate_entry (id, rate_card_id, service_type_id, staff_id, patient_id, rate, pay_basis)
VALUES
    ('77777777-7777-7777-7777-777777777771', '66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333331', NULL, NULL, 44.50, 'per_unit'),
    ('77777777-7777-7777-7777-777777777772', '66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333332', NULL, NULL, 38.25, 'per_unit'),
    ('77777777-7777-7777-7777-777777777773', '66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', NULL, NULL, 36.00, 'per_unit')
ON CONFLICT (rate_card_id, service_type_id, staff_id, patient_id) DO UPDATE
SET rate = EXCLUDED.rate,
    pay_basis = EXCLUDED.pay_basis;
