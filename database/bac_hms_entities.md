# Mô tả Entity & Rationale

Tài liệu tổng hợp các entity chính trong mô hình dữ liệu BAC-HMS theo file `database/bac_hms_schema.sql`, giải thích mục đích và lý do tồn tại của các trường quan trọng. Hệ thống tuân thủ yêu cầu đa văn phòng (multi-office), quản lý ISP, EVV và thanh toán Medicaid.

## Nhóm Tổ chức & Cấu hình

- **organization**: Thông tin pháp nhân BAC hoặc các tenant. `code` định danh duy nhất; `deleted_at` hỗ trợ soft delete.
- **office**: Đại diện từng văn phòng/county. `billing_config` (JSONB) cho phép cấu hình bảng giá/submit claim theo office.
- **address**: Chuẩn hóa địa chỉ, dùng cho patient, office, residence. Tọa độ (`latitude`, `longitude`) phục vụ geofencing.
- **org_setting**: Key-value cho cấu hình tổ chức/office. `is_sensitive` đánh dấu cấu hình cần bảo vệ.
- **module**: Danh mục module phục vụ phân quyền và audit.

## Nhóm Bảo mật & Người dùng

- **app_user**: Tài khoản hệ thống. `password_hash` bảo mật, `mfa_enabled` cho 2FA.
- **role**, **permission**, **role_permission**, **user_role**: Thực thi RBAC. `scope` trong `permission` giới hạn dữ liệu theo office/tổ chức.
- **user_office**: Gán người dùng theo văn phòng, đảm bảo truy cập đúng office.
- **api_key**: Quản lý tích hợp ngoài; chỉ lưu `key_hash`.
- **audit_log**: Theo dõi hành vi cho tuân thủ (HIPAA, audit).

## Nhóm Tệp & Hồ sơ

- **file_object**: Metadata tệp lưu trên S3/local. `sha256` đảm bảo toàn vẹn.
- **staff_document**, **document_version**: Versioning hồ sơ nhân sự. `expires_at` cảnh báo hết hạn.

## Nhóm Nhân sự

- **staff**: Hồ sơ nhân viên. `custom_fields` mở rộng theo office/tenant.
- **staff_certification**: Theo dõi chứng chỉ bắt buộc. `status` để lọc/cảnh báo.
- **background_check**: Lịch sử kiểm tra lý lịch.
- **staff_availability**: Dữ liệu cho lập lịch, tránh trùng ca.
- **staff_rate**: Lương/đơn giá liên kết payroll và billing.

## Nhóm Bệnh nhân & Chăm sóc

- **patient**: Hồ sơ bệnh nhân, `medical_profile` (JSONB) lưu dị ứng, chẩn đoán.
- **patient_contact**: Thông tin người giám hộ/liên hệ khẩn. `is_primary` xác định liên hệ chính.
- **patient_payer**: Liên kết bệnh nhân với payor.
- **residence_stay**: Lịch sử cư trú (Group Home, Life Sharing).
- **isp**, **isp_goal**, **isp_task**: Quản lý ISP, goals/tasks.kiểm soát phiên bản/cảnh báo hết hạn.
- **service_authorization**, **unit_consumption**: Quản lý hạn mức units và consumo units cho Billing.
- **progress_report**: Báo cáo định kỳ phục vụ audit.

## Nhóm Lịch & Sự kiện

- **schedule_template**: Lịch mẫu (weekly master), dùng để sinh các event thực tế.
- **template_event**: Sự kiện trong template, lặp lại theo ngày trong tuần.
- **schedule_event**: Sự kiện thực tế (generated/thủ công), lưu thông tin ngày, giờ, loại dịch vụ, goal, status (enum: DRAFT, PLANNED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED), planned/actual units, unit_summary (JSONB), link đến template nếu có, lý do cancelled.
- **event_assignment**: Gán nhân viên cho event, hỗ trợ nhiều staff nếu cần, status (enum: ASSIGNED, ACCEPTED, DECLINED, CANCELLED, COMPLETED), meta (JSONB) lưu thông tin bổ sung.
- **service_delivery**: Ghi nhận ca thực tế, `units` và `approval_status` cho billing & claims.
- **daily_note**: Báo cáo sau ca, `checklist` để tick tasks từ ISP, eSign.

## Nhóm EVV & Mobile

- **check_event**: Check-in/out GPS, đáp ứng EVV. `latitude`, `status` để phát hiện lệch.
- **check_exception**: Workflow giải trình lệch GPS/Giờ.
- **device**, **mobile_session**: Liên kết thiết bị mobile và phiên đăng nhập.
- **offline_queue**: Giữ dữ liệu khi offline, đồng bộ lại khi có mạng.
- **mobile_notification**: Push nhắc lịch, meds…
- **vital_reading**: Lưu chỉ số sinh tồn ghi từ app.

## Nhóm Thuốc & Sự cố

- **medication_order**: Lệnh thuốc; `is_prn` + `interaction_flags` hỗ trợ PRN/cảnh báo tương tác.
- **prn_rule**: Điều kiện PRN.
- **medication_administration**: eMAR ghi nhận cấp phát thuốc, `prn_reason` cho follow-up PRN.
- **incident**, **incident_party**: Quản lý báo cáo sự cố, lưu chứng cứ.

## Nhóm Billing & Finance

- **service_type**: Danh mục dịch vụ để mapping ISP, schedule và billing.
- **payer**: Đối tượng thanh toán (Medicaid, private pay).
- **rate_card**, **rate_entry**: Bảng giá theo service/staff/patient; `scope` hỗ trợ multi-office.
- **claim**, **claim_line**: Lập hóa đơn Medicaid. `status` giúp tracking pending/denied.

## Nhóm Fire Drill & Tuân thủ

- **fire_drill**: Nhật ký diễn tập phòng cháy. `session_type`, `evacuation_time_sec`.
- **fire_drill_participant**: Ai tham gia/giám sát.
- **fire_drill_issue**: Sự cố phát sinh; liên kết khi escalated.

## Seed Data

File schema có seed mặc định: một organization, office, danh mục module, service types trọng yếu, payor Medicaid, role chuẩn, rate card & entries. Các UUID cố định giúp dễ import dữ liệu mẫu khi khởi chạy môi trường dev hoặc demo.
