# Mô tả Entity & Rationale

Tài liệu tổng hợp các entity chính trong mô hình dữ liệu BAC-HMS theo file `database/bac_hms_schema.sql`, giải thích mục đích và lý do tồn tại của các trường quan trọng. Hệ thống tuân thủ yêu cầu đa văn phòng (multi-office), quản lý ISP, EVV và thanh toán Medicaid.

## Nhóm Tổ chức & Cấu hình

- **organization**: Giữ thông tin pháp nhân của BAC hoặc các tenant nếu mở rộng. `code` đảm bảo định danh duy nhất; `deleted_at` hỗ trợ soft delete cho audit.
- **office**: Đại diện từng văn phòng/county. Trường `billing_config` (JSONB) cho phép cấu hình bảng giá/submit claim theo office như yêu cầu SRS 3.11.
- **address**: Chuẩn hóa địa chỉ, tái sử dụng cho patient, office, residence. Tọa độ (`latitude`, `longitude`) phục vụ geofencing.
- **org_setting**: Key-value cho cấu hình tổ chức/office (ví dụ đơn giá, thiết lập thông báo). `is_sensitive` đánh dấu cấu hình cần bảo vệ.
- **module**: Danh mục module phục vụ ma trận phân quyền và audit.

## Nhóm Bảo mật & Người dùng

- **app_user**: Tài khoản hệ thống. `password_hash` bảo mật, `mfa_enabled` đáp ứng yêu cầu 2FA với Admin (SRS 3.2).
- **role**, **permission**, **role_permission**, **user_role**: Thực thi RBAC (module Admin). Trường `scope` trong `permission` giúp giới hạn dữ liệu theo office hoặc tổ chức.
- **user_office**: Gán người dùng theo văn phòng, đảm bảo truy cập dữ liệu đúng office (SRS 3.11).
- **api_key**: Quản lý tích hợp và kết nối ngoài; chỉ lưu `key_hash` để tránh lộ khoá thô.
- **audit_log**: Theo dõi hành vi cho mục đích tuân thủ (HIPAA, audit SRS 3.1).

## Nhóm Tệp & Hồ sơ

- **file_object**: Metadata tệp lưu trên S3/local. `sha256` đảm bảo toàn vẹn.
- **staff_document**, **document_version**: Versioning hồ sơ nhân sự (giấy phép, hợp đồng). `expires_at` cho phép cảnh báo hết hạn.

## Nhóm Nhân sự

- **staff**: Hồ sơ nhân viên. `custom_fields` hỗ trợ mở rộng theo office/tenant.
- **staff_certification**: Theo dõi chứng chỉ bắt buộc (HIPAA, CPR). `status` để lọc và cảnh báo.
- **background_check**: Lưu lịch sử kiểm tra lý lịch (SRS 3.3).
- **staff_availability**: Nguồn dữ liệu cho lập lịch, tránh trùng ca.
- **staff_rate**: Lương/đơn giá liên kết payroll và billing (SRS 3.3 & 3.9).

## Nhóm Bệnh nhân & Chăm sóc

- **patient**: Hồ sơ bệnh nhân, `medical_profile` (JSONB) lưu dị ứng, chẩn đoán theo yêu cầu SRS 3.4.
- **patient_contact**: Thông tin người giám hộ/liên hệ khẩn. `is_primary` giúp xác định liên hệ chính.
- **patient_provider**: Liên kết bác sĩ/chuyên gia điều trị (SRS 3.4).
- **residence_stay**: Ghi nhận lịch sử cư trú (Group Home, Life Sharing) theo SRS 3.4.
- **isp**, **isp_version**, **isp_goal**, **isp_task**: Quản lý ISP, goals/tasks. `version_no`, `effective_at`, `expires_at` đảm bảo kiểm soát phiên bản và cảnh báo hết hạn (SRS 3.5).
- **service_authorization**, **unit_consumption**: Quản lý hạn mức units và consumo units cho Billing (SRS 3.5 & 3.9).
- **isp_acknowledgement**: Theo dõi nhân viên đã đọc ISP (compliance).
- **progress_report**: Lưu báo cáo định kỳ phục vụ audit AE/DHS.

## Nhóm Lịch & Ca trực

- **weekly_schedule**: Lịch tuần gắn với patient, office. `unit_summary` lưu tổng units để so với ISP (SRS 3.6).
- **schedule_shift**: Ca trực chi tiết, `planned_units` dùng cho điều tiết units.
- **shift_assignment**: Liên kết staff ↔ shift, hỗ trợ primary/backup.
- **shift_change_request**, **shift_change_approval**, **shift_log**: Workflow đổi ca, audit lịch (SRS 3.6).
- **service_delivery**: Ghi nhận ca thực tế, `units` và `approval_status` dùng cho billing & claims.
- **daily_note**: Báo cáo sau ca, `checklist` để tick tasks từ ISP, `patient_signed` và `staff_signed` đáp ứng eSign (SRS 3.10).

## Nhóm EVV & Mobile

- **check_event**: Check-in/out GPS, đáp ứng EVV (SRS 3.3 & 3.10). `latitude`, `status` để phát hiện lệch.
- **check_exception**: Workflow giải trình lệch GPS/Giờ (compliance).
- **device**, **mobile_session**: Liên kết thiết bị mobile và phiên đăng nhập, phục vụ quản lý bảo mật.
- **offline_queue**: Giữ dữ liệu khi offline, đồng bộ lại khi có mạng (SRS 3.10).
- **mobile_notification**: Push nhắc lịch, meds…
- **vital_reading**: Lưu chỉ số sinh tồn ghi từ app (SRS 3.10).

## Nhóm Thuốc & Sự cố

- **medication_order**: Lệnh thuốc; `is_prn` + `interaction_flags` hỗ trợ PRN và cảnh báo tương tác (SRS 3.7).
- **prn_rule**: Điều kiện PRN (max per day, follow-up).
- **medication_administration**: eMAR ghi nhận cấp phát thuốc, `prn_reason` đáp ứng yêu cầu follow-up PRN.
- **incident**, **incident_party**: Quản lý báo cáo sự cố (SRS 3.10). `evidence_file_id` lưu chứng cứ.

## Nhóm Billing & Finance

- **service_type**: Danh mục dịch vụ để mapping ISP, schedule và billing.
- **payor**: Đối tượng thanh toán (Medicaid, private pay).
- **rate_card**, **rate_entry**: Bảng giá theo service/staff/patient; `scope` hỗ trợ multi-office.
- **claim**, **claim_line**: Lập hóa đơn Medicaid. `status` giúp tracking pending/denied (SRS 3.9).
- **remittance**, **remittance_allocation**: Đối chiếu thanh toán, phân bổ tới claim line.
- **expense**: Ghi nhận chi phí liên quan để đối chiếu tài chính.
- **export_job**: Lịch sử export dữ liệu sang QuickBooks/CSV.

## Nhóm Fire Drill & Tuân thủ

- **fire_drill**: Nhật ký diễn tập phòng cháy (PA Code 6400). `session_type`, `evacuation_time_sec` đảm bảo đủ tiêu chí.
- **fire_drill_participant**: Ai tham gia/giám sát, phục vụ audit.
- **fire_drill_issue**: Sự cố phát sinh; `incident_id` liên kết khi escalated (SRS 3.8).

## Seed Data

File schema có seed mặc định: một organization, office, danh mục module, service types trọng yếu, payor Medicaid, role chuẩn, rate card & entries. Các UUID cố định giúp dễ import dữ liệu mẫu khi khởi chạy môi trường dev hoặc demo.
