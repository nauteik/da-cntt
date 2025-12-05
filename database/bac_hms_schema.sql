CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE address (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    line1 text NOT NULL,
    line2 text,
    label text,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    county text NOT NULL DEFAULT 'USA',
    type text CHECK (type IN ('HOME', 'COMMUNITY', 'SENIOR', 'BUSINESS')),
    latitude numeric(9,6),
    longitude numeric(9,6),
    meta jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_address_coordinates ON address (latitude, longitude);

CREATE TABLE office (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    address_id uuid REFERENCES address(id) ON DELETE SET NULL,
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    county text,
    phone text,
    email text,
    timezone text NOT NULL DEFAULT 'America/New_York',
    billing_config jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

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
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    care_setting text NOT NULL DEFAULT 'NON_RESIDENTIAL',
    description text,
    unit_basis text NOT NULL DEFAULT '15min',
    is_billable boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_type_setting ON service_type (care_setting);

CREATE TABLE payer (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_identifier text NOT NULL UNIQUE,
    payer_name text NOT NULL UNIQUE,
    type text NOT NULL DEFAULT 'Medicaid',
    submission_endpoint text,
    config jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE role (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    is_system boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE TABLE app_user (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    role_id uuid NOT NULL REFERENCES role(id) ON DELETE RESTRICT,
    is_active boolean NOT NULL DEFAULT true,
    mfa_enabled boolean NOT NULL DEFAULT false,
    last_login_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid,
    deleted_at timestamptz,
    preferences jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_app_user_deleted_at ON app_user (deleted_at);

CREATE INDEX idx_role_deleted_at ON role (deleted_at);

CREATE TABLE permission (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id uuid REFERENCES module(id) ON DELETE SET NULL,
    resource text NOT NULL,
    action text NOT NULL,
    scope text NOT NULL DEFAULT 'org',
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT permission_unique UNIQUE (resource, action, scope)
);

CREATE TABLE role_permission (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id uuid NOT NULL REFERENCES role(id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES permission(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT role_permission_unique UNIQUE (role_id, permission_id)
);


CREATE TABLE user_office (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    office_id uuid NOT NULL REFERENCES office(id) ON DELETE CASCADE,
    is_primary boolean NOT NULL DEFAULT false,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT user_office_unique UNIQUE (user_id, office_id)
);

CREATE TABLE app_setting (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE,
    value text,
    value_type text NOT NULL DEFAULT 'string',
    is_sensitive boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

CREATE TABLE api_key (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    key_hash text NOT NULL UNIQUE,
    scopes text[] NOT NULL DEFAULT '{}',
    expires_at timestamptz,
    is_active boolean NOT NULL DEFAULT true,
    last_used_at timestamptz,
    last_used_ip text,
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid
);

CREATE TABLE audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX idx_audit_log_module ON audit_log (module_code, created_at DESC);

CREATE TABLE file_object (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id uuid REFERENCES office(id) ON DELETE SET NULL,
    filename text NOT NULL,
    mime_type text NOT NULL,
    size_bytes bigint NOT NULL CHECK (size_bytes >= 0),
    storage_uri text NOT NULL,
    sha256 text UNIQUE,
    meta jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES app_user(id) ON DELETE SET NULL
);

CREATE TABLE staff (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id uuid NOT NULL REFERENCES office(id) ON DELETE CASCADE,
    user_id uuid UNIQUE REFERENCES app_user(id) ON DELETE SET NULL,
    employee_id text UNIQUE,
    ssn text UNIQUE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    is_supervisor boolean NOT NULL DEFAULT false,
    supervisor_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    national_provider_id text UNIQUE,
    dob date,
    gender text,
    primary_language text,
    hire_date date,
    release_date date,
    is_active boolean NOT NULL DEFAULT true,
    portrait_file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,
    custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);      

CREATE INDEX idx_staff_office ON staff (office_id);
CREATE INDEX idx_staff_deleted_at ON staff (deleted_at);
CREATE INDEX idx_staff_supervisor ON staff (supervisor_id);

CREATE TABLE staff_address (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    address_id uuid REFERENCES address(id) ON DELETE CASCADE,
    phone text,
    email text,
    is_main boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT staff_address_unique UNIQUE (staff_id, address_id),
    CONSTRAINT chk_address_or_phone CHECK (address_id IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE staff_contact (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    relation text NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    line1 text,
    line2 text,
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_staff_contact_info CHECK (phone IS NOT NULL OR line1 IS NOT NULL)
);

CREATE INDEX idx_staff_contact_staff ON staff_contact (staff_id);
CREATE UNIQUE INDEX idx_staff_contact_unique_primary ON staff_contact (staff_id) WHERE is_primary;

CREATE TABLE staff_document (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
    office_id uuid NOT NULL REFERENCES office(id) ON DELETE CASCADE,
    supervisor_id uuid REFERENCES staff(id),
    medicaid_id text UNIQUE,
    client_id text UNIQUE,
    agency_id text,
    ssn text UNIQUE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    dob date,
    gender text,
    primary_language text,
    medical_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX idx_patient_office ON patient (office_id);
CREATE INDEX idx_patient_supervisor ON patient (supervisor_id);
CREATE INDEX idx_patient_deleted_at ON patient (deleted_at);
CREATE INDEX idx_patient_name_active ON patient(last_name, first_name);


CREATE TABLE patient_address (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    address_id uuid REFERENCES address(id) ON DELETE CASCADE,
    phone text,
    email text,
    is_main boolean NOT NULL DEFAULT false,
    latitude double precision,
    longitude double precision,
    location_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT patient_address_unique UNIQUE (patient_id, address_id),
    CONSTRAINT chk_address_or_phone CHECK (address_id IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX idx_patient_address_patient ON patient_address (patient_id);
CREATE INDEX idx_patient_address_address ON patient_address (address_id);
CREATE UNIQUE INDEX idx_patient_address_unique_main ON patient_address (patient_id) WHERE is_main;

CREATE TABLE patient_contact (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    relation text NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    line1 text,
    line2 text,
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_contact_info CHECK (phone IS NOT NULL OR line1 IS NOT NULL)
);

CREATE INDEX idx_patient_contact_patient ON patient_contact (patient_id);
CREATE UNIQUE INDEX idx_patient_contact_unique_primary ON patient_contact (patient_id) WHERE is_primary;

CREATE TABLE patient_payer (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    payer_id uuid NOT NULL REFERENCES payer(id) ON DELETE RESTRICT,
    client_payer_id text NOT NULL,
    rank integer DEFAULT 1,
    group_no text,
    start_date date,
    end_date date,
    meta jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT patient_payer_unique UNIQUE (patient_id, payer_id)
);
CREATE INDEX idx_patient_payer_patient ON patient_payer (patient_id);

CREATE TABLE residence_stay (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
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
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    version_no integer NOT NULL,
    effective_at date NOT NULL,
    expires_at date,
    total_unit numeric(10, 2),
    file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT isp_patient_version_unique UNIQUE (patient_id, version_no)
);

CREATE INDEX idx_isp_patient ON isp (patient_id);

CREATE TABLE patient_service (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    service_type_id uuid NOT NULL REFERENCES service_type(id) ON DELETE CASCADE,
    start_date date,
    end_date date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT patient_service_unique UNIQUE (patient_id, service_type_id)
);

CREATE INDEX idx_patient_service_patient ON patient_service (patient_id);
CREATE INDEX idx_patient_service_service ON patient_service (service_type_id);
CREATE INDEX idx_patient_service_lookup ON patient_service(patient_id, service_type_id);

CREATE TABLE authorizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES patient(id) ON DELETE CASCADE,
    patient_payer_id uuid NOT NULL REFERENCES patient_payer(id) ON DELETE CASCADE,
    patient_service_id uuid NOT NULL REFERENCES patient_service(id) ON DELETE RESTRICT,
    authorization_no text NOT NULL UNIQUE,
    format text DEFAULT 'units',
    event_code text,
    modifiers jsonb DEFAULT '{}'::jsonb,
    max_units numeric(10,2) NOT NULL CHECK (max_units >= 0),
    total_used numeric(10,2) DEFAULT 0,
    total_missed numeric(10,2) DEFAULT 0,
    total_remaining numeric(10,2) GENERATED ALWAYS AS (max_units - total_used - total_missed) STORED,
    start_date date NOT NULL,
    end_date date,
    comments text,
    meta jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_auth_patient_payer ON authorizations (patient_payer_id, start_date);


CREATE TABLE isp_goal (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    isp_id uuid NOT NULL REFERENCES isp(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    measure text,
    sort_order integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_isp_goal ON isp_goal (isp_id);

CREATE TABLE unit_consumption (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    authorization_id uuid NOT NULL REFERENCES authorizations(id) ON DELETE CASCADE,
    source_type text NOT NULL,
    source_id uuid,
    service_date date NOT NULL,
    units_used integer NOT NULL CHECK (units_used >= 0),
    recorded_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_unit_consumption_auth_date ON unit_consumption (authorization_id, service_date);

-- Bảng Template cho lịch mẫu (Master Weekly)
CREATE TABLE schedule_template (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id uuid NOT NULL REFERENCES office(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    name text NOT NULL DEFAULT 'Master Weekly',  -- Ví dụ: 'Master Weekly', 'Quarterly Template'
    description text,
    status text NOT NULL DEFAULT 'active',  -- 'active', 'archived'
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES app_user(id) ON DELETE SET NULL,
    CONSTRAINT schedule_template_unique UNIQUE (patient_id, name)
);

CREATE INDEX idx_schedule_template_patient ON schedule_template (patient_id);

-- Tuần của Template (hỗ trợ multi-week)
CREATE TABLE schedule_template_week (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id uuid NOT NULL REFERENCES schedule_template(id) ON DELETE CASCADE,
    week_index integer NOT NULL,
    name text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT schedule_template_week_unique UNIQUE (template_id, week_index)
);

-- Events trong Template (per week + weekday)
CREATE TABLE schedule_template_event (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_week_id uuid NOT NULL REFERENCES schedule_template_week(id) ON DELETE CASCADE,
    day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    start_time time NOT NULL,
    end_time time NOT NULL,
    authorization_id uuid REFERENCES authorizations(id) ON DELETE SET NULL,
    staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    event_code text,
    comment text,
    planned_units integer NOT NULL CHECK (planned_units >= 0),
    meta jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (end_time > start_time),
    CONSTRAINT schedule_template_event_unique UNIQUE (template_week_id, day_of_week, start_time)
);

CREATE INDEX idx_schedule_template_event_week ON schedule_template_event (template_week_id);

-- Events thực tế (generated hoặc thủ công, per day)
CREATE TABLE schedule_event (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id uuid NOT NULL REFERENCES office(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    event_date date NOT NULL,
    start_at timestamptz NOT NULL,
    end_at timestamptz NOT NULL,
    authorization_id uuid REFERENCES authorizations(id) ON DELETE SET NULL,
    staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    event_code text,
    status text NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    planned_units integer NOT NULL CHECK (planned_units >= 0),
    actual_units integer CHECK (actual_units >= 0),
    comment text,
    unit_summary NOT NULL jsonb DEFAULT '{}'::jsonb,  -- Lưu lý do cancelled, tổng units
    source_template_id uuid REFERENCES schedule_template(id) ON DELETE SET NULL,
    generated_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES app_user(id) ON DELETE SET NULL,
    CHECK (end_at > start_at)
);

CREATE INDEX idx_schedule_event_patient_date ON schedule_event (patient_id, event_date);
CREATE INDEX idx_schedule_event_staff_date ON schedule_event (staff_id, event_date);
CREATE INDEX idx_schedule_event_office_date ON schedule_event (office_id, event_date DESC);


-- Gán nhân viên cho Events (hỗ trợ multiple nếu cần, nhưng default primary)
CREATE TABLE event_assignment (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_event_id uuid NOT NULL REFERENCES schedule_event(id) ON DELETE CASCADE,
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'primary',  -- 'primary', 'backup', 'supervisor'
    status text NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED')),
    meta jsonb NOT NULL DEFAULT '{}'::jsonb,  -- Lý do decline, thời gian swap, v.v.
    assigned_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES app_user(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT event_assignment_unique UNIQUE (schedule_event_id, staff_id)
);

CREATE INDEX idx_event_assignment_event ON event_assignment (schedule_event_id);
CREATE INDEX idx_event_assignment_staff ON event_assignment (staff_id);

CREATE TABLE service_delivery (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_event_id uuid NOT NULL REFERENCES schedule_event(id) ON DELETE CASCADE,
    authorization_id uuid REFERENCES authorizations(id) ON DELETE SET NULL,
    start_at timestamptz NOT NULL,
    end_at timestamptz NOT NULL,
    units integer NOT NULL CHECK (units >= 0),
    status text NOT NULL DEFAULT 'in_progress',
    approval_status text NOT NULL DEFAULT 'pending',
    total_hours double precision,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (end_at > start_at)
);

CREATE INDEX idx_service_delivery_schedule_event ON service_delivery (schedule_event_id);
CREATE INDEX idx_service_delivery_authorization ON service_delivery (authorization_id);

CREATE TABLE daily_note (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_delivery_id uuid NOT NULL REFERENCES service_delivery(id) ON DELETE CASCADE,
    author_staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    content text NOT NULL,
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    checklist jsonb NOT NULL DEFAULT '[]'::jsonb,

    patient_signed boolean NOT NULL DEFAULT false,
    patient_signer_name text,
    patient_signed_at timestamptz,
    staff_signed boolean NOT NULL DEFAULT false,
    staff_signed_at timestamptz,

    attachment_file_id uuid REFERENCES file_object(id) ON DELETE SET NULL,

    meal_info jsonb NOT NULL DEFAULT '[]'::jsonb,

    patient_signature text,
    staff_signature text,

    cancelled boolean NOT NULL DEFAULT false,
    cancel_reason text,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Useful indexes for lookups
CREATE INDEX IF NOT EXISTS idx_daily_note_patient ON daily_note (patient_id);
CREATE INDEX IF NOT EXISTS idx_daily_note_staff ON daily_note (staff_id);
CREATE INDEX IF NOT EXISTS idx_daily_note_service_delivery ON daily_note (service_delivery_id);

CREATE TABLE medication_order (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE prn_rule (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_order_id uuid NOT NULL REFERENCES medication_order(id) ON DELETE CASCADE,
    conditions text,
    follow_up text,
    max_per_day integer,
    min_interval_minutes integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_prn_rule_order ON prn_rule (medication_order_id);

CREATE TABLE medication_administration (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX idx_incident_occurrence ON incident (occurred_at DESC);

CREATE TABLE incident_party (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id uuid NOT NULL REFERENCES incident(id) ON DELETE CASCADE,
    staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    patient_id uuid REFERENCES patient(id) ON DELETE SET NULL,
    role text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_incident_party_incident ON incident_party (incident_id);

CREATE TABLE check_event (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    patient_id uuid REFERENCES patient(id) ON DELETE SET NULL,
    schedule_event_id uuid REFERENCES schedule_event(id) ON DELETE SET NULL,
    service_delivery_id uuid REFERENCES service_delivery(id) ON DELETE SET NULL,
    event_type text NOT NULL,
    occurred_at timestamptz NOT NULL,
    latitude numeric(9,6),
    longitude numeric(9,6),
    accuracy_m numeric(10,2),
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

CREATE TABLE device (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    platform text NOT NULL,
    device_identifier text NOT NULL UNIQUE,
    push_token text,
    status text NOT NULL DEFAULT 'active',
    registered_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE mobile_session (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    device_id uuid REFERENCES device(id) ON DELETE SET NULL,
    provider text NOT NULL DEFAULT 'local',
    ip_address text,
    user_agent text,
    started_at timestamptz NOT NULL DEFAULT now(),
    ended_at timestamptz,
    mfa_passed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_mobile_session_user ON mobile_session (user_id, started_at DESC);

CREATE TABLE offline_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE vital_reading (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vital_reading_patient ON vital_reading (patient_id, measured_at);

CREATE TABLE fire_drill (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX idx_fire_drill_date ON fire_drill (drill_date);

CREATE TABLE fire_drill_participant (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fire_drill_id uuid NOT NULL REFERENCES fire_drill(id) ON DELETE CASCADE,
    staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    patient_id uuid REFERENCES patient(id) ON DELETE SET NULL,
    role text NOT NULL,
    acknowledged boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fire_drill_participant_drill ON fire_drill_participant (fire_drill_id);

CREATE TABLE fire_drill_issue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fire_drill_id uuid NOT NULL REFERENCES fire_drill(id) ON DELETE CASCADE,
    issue_type text NOT NULL,
    severity text NOT NULL,
    description text,
    remediation_notes text,
    incident_id uuid REFERENCES incident(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fire_drill_issue_drill ON fire_drill_issue (fire_drill_id);

CREATE TABLE rate_card (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    scope text NOT NULL DEFAULT 'org',
    effective_at date NOT NULL,
    expires_at date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rate_entry (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_card_id uuid NOT NULL REFERENCES rate_card(id) ON DELETE CASCADE,
    service_type_id uuid REFERENCES service_type(id) ON DELETE SET NULL,
    staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    patient_id uuid REFERENCES patient(id) ON DELETE SET NULL,
    rate numeric(10,2) NOT NULL CHECK (rate >= 0),
    pay_basis text NOT NULL DEFAULT 'per_unit',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT rate_entry_unique_scope UNIQUE (rate_card_id, service_type_id, staff_id, patient_id)
);

CREATE INDEX idx_rate_entry_card ON rate_entry (rate_card_id);

CREATE TABLE claim (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id uuid REFERENCES office(id) ON DELETE SET NULL,
    payer_id uuid NOT NULL REFERENCES payer(id) ON DELETE SET NULL,
    claim_number text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'draft',
    submitted_at timestamptz,
    total_amount numeric(12,2),
    meta jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_claim_status ON claim (status);

CREATE TABLE claim_line (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_claim_line_claim ON claim_line (claim_id);
CREATE INDEX idx_claim_line_service_date ON claim_line (service_date);

CREATE TABLE program (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    program_identifier varchar(50) UNIQUE NOT NULL,
    program_name varchar(255) NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE patient_program (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    program_id uuid NOT NULL REFERENCES program(id) ON DELETE RESTRICT,
    supervisor_id uuid REFERENCES staff(id) ON DELETE SET NULL,
    enrollment_date date,
    status_effective_date date NOT NULL,
    soc_date date,
    eoc_date date,
    eligibility_begin_date date,
    eligibility_end_date date,
    reason_for_change jsonb,
    meta jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT patient_program_unique UNIQUE (patient_id, program_id)
);
CREATE INDEX idx_patient_program_patient ON patient_program (patient_id);
CREATE INDEX idx_patient_program_effective_date ON patient_program (patient_id, status_effective_date DESC);


    