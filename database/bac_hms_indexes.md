# Indexing trong BAC-HMS

Tài liệu này liệt kê toàn bộ index (bao gồm cả unique constraint sinh index) được định nghĩa trong `database/bac_hms_schema.sql`, mục đích và lý do tồn tại. Chỉ mục giúp đảm bảo hiệu năng truy vấn, lọc theo office, bệnh nhân, nhân viên, đồng thời phục vụ audit và compliance.

## Nhóm tổ chức & cấu hình
- `idx_organization_deleted_at` (organization.deleted_at): hỗ trợ lọc soft delete.
- `idx_address_org` (address.organization_id): truy vấn địa chỉ theo tổ chức.
- `idx_address_coordinates` (address.latitude, address.longitude): tìm kiếm lân cận hoặc kiểm tra geofence.
- `idx_office_org` (office.organization_id): lọc office theo tổ chức.
- `idx_office_deleted_at` (office.deleted_at): hỗ trợ soft delete office.
- Unique `office_org_code_unique`: đảm bảo `code` duy nhất trong tổ chức.
- `idx_service_type_org` (service_type.organization_id): lọc service theo tổ chức.
- `idx_service_type_setting` (service_type.organization_id, care_setting): nhanh chóng phân loại Residential vs Non-residential.
- Unique `service_type_org_code_unique`: tránh trùng `code` service.
- Unique `payor_org_name_unique`: tên payor duy nhất trong tổ chức.
- Unique `rate_card_org_name_unique`: ngăn trùng tên bảng giá.
- `idx_rate_entry_card` (rate_entry.rate_card_id): truy vấn nhanh các entries của 1 rate card.
- Unique `rate_entry_unique_scope`: đảm bảo combo (rate_card, service_type, staff, patient) duy nhất.
- `idx_export_job_org_status` (export_job.organization_id, status): lọc job theo trạng thái.

## Nhóm người dùng & bảo mật
- `idx_app_user_org` (app_user.organization_id): lọc user theo tenant.
- `idx_app_user_deleted_at` (app_user.deleted_at): soft delete user.
- Unique `app_user_org_username_unique`, `app_user_org_email_unique`: tránh trùng username/email.
- `idx_role_deleted_at` (role.deleted_at): soft delete role.
- Unique `role_org_code_unique`: code role duy nhất.
- Unique `permission_unique`: mỗi resource+action+scope chỉ khai báo một lần.
- Unique `role_permission_unique`, `user_role_unique`, `user_office_unique`: tránh nhân bản liên kết.
- Unique `org_setting_scope_unique`: mỗi setting key duy nhất theo scope tổ chức/office.
- Unique `api_key_hash_unique`: khóa API hash không trùng.
- `idx_audit_log_org_module` (audit_log.organization_id, module_code, created_at DESC): tra cứu log theo module, thời gian.

## Nhóm tài liệu & tệp
- Unique `file_object_sha_unique`: cùng tổ chức không lưu trùng file hash.
- `idx_file_object_org` (file_object.organization_id): lọc file theo tổ chức.
- `idx_staff_document_staff` (staff_document.staff_id, doc_type): truy vấn hồ sơ theo loại giấy tờ.
- Unique `document_version_unique`: đảm bảo version số duy nhất trong từng document.

## Nhóm nhân sự
- `idx_staff_office` (staff.office_id): lọc nhân viên theo văn phòng.
- `idx_staff_deleted_at` (staff.deleted_at): soft delete.
- Unique `staff_org_code_unique`: tránh trùng mã nhân viên.
- `idx_staff_certification_staff` (staff_certification.staff_id, cert_type): truy vấn chứng chỉ và cảnh báo hết hạn.
- `idx_background_check_staff` (background_check.staff_id, check_type): kiểm tra lịch sử background.
- `idx_staff_availability_staff` (staff_availability.staff_id, weekday): lập lịch theo khả dụng.
- `idx_staff_rate_staff` (staff_rate.staff_id, service_type_id): tìm đơn giá phù hợp.

## Nhóm bệnh nhân & ISP
- `idx_patient_office` (patient.office_id): lọc bệnh nhân theo văn phòng.
- `idx_patient_deleted_at` (patient.deleted_at): soft delete.
- Unique `patient_org_mrn_unique`: MRN duy nhất trong tổ chức.
- `idx_patient_contact_patient` (patient_contact.patient_id): truy vấn liên hệ.
- `idx_patient_provider_patient` (patient_provider.patient_id, role): lấy provider theo vai trò.
- `idx_residence_stay_patient` (residence_stay.patient_id, move_in_at): lịch sử cư trú, hỗ trợ xếp thời gian.
- Unique `isp_patient_status_unique`: một trạng thái hiện hành duy nhất cho mỗi bệnh nhân.
- `idx_isp_version_status` (isp_version.status): lọc ISP theo trạng thái.
- Unique `isp_version_unique`: version_no duy nhất trên mỗi ISP.
- `idx_isp_goal_version` (isp_goal.isp_version_id): truy vấn mục tiêu theo version.
- `idx_isp_task_goal` (isp_task.isp_goal_id): truy vấn task thuộc goal.
- `idx_service_authorization_version` (service_authorization.isp_version_id): truy vấn hạn mức theo version ISP.
- `idx_unit_consumption_auth_date` (unit_consumption.service_authorization_id, service_date): báo cáo units tiêu thụ theo ngày.
- Unique `isp_acknowledgement_unique`: mỗi staff chỉ xác nhận một lần trên một version.
- `idx_progress_report_period` (progress_report.isp_version_id, period_start): tìm báo cáo theo kỳ.

## Nhóm lịch & ca trực
- Unique `weekly_schedule_unique`: một bệnh nhân chỉ có 1 lịch/tuần.
- `idx_weekly_schedule_office` (weekly_schedule.office_id, week_start): lọc lịch theo văn phòng, tuần.
- `idx_schedule_shift_schedule` (schedule_shift.weekly_schedule_id): truy vấn shift thuộc lịch tuần.
- `idx_schedule_shift_time` (schedule_shift.patient_id, start_at): kiểm tra trùng ca, phục vụ EVV.
- Unique `shift_assignment_unique`: tránh gán trùng nhân viên cho cùng ca.
- `idx_shift_change_request_shift` (shift_change_request.schedule_shift_id, status): tìm yêu cầu đổi ca cần xử lý.
- `idx_shift_change_approval_request` (shift_change_approval.change_request_id): truy vấn phê duyệt.
- `idx_shift_log_shift` (shift_log.schedule_shift_id, created_at): audit thay đổi ca.

## Nhóm thực thi dịch vụ & ghi nhận
- `idx_service_delivery_patient` (service_delivery.patient_id, start_at): truy vấn dịch vụ theo bệnh nhân & thời gian.
- `idx_service_delivery_staff` (service_delivery.staff_id, start_at): phân tích giờ làm của nhân viên.
- `idx_medication_order_patient` (medication_order.patient_id, status): lọc thuốc đang hoạt động.
- `idx_prn_rule_order` (prn_rule.medication_order_id): truy vấn rule PRN theo order.
- `idx_medication_administration_patient` (medication_administration.patient_id, administered_at): báo cáo eMAR.
- `idx_incident_occurrence` (incident.organization_id, occurred_at DESC): tra cứu sự cố gần nhất.
- `idx_incident_party_incident` (incident_party.incident_id): lấy danh sách người liên quan.
- `idx_check_event_staff_time` (check_event.staff_id, occurred_at): kiểm tra check-in/out của nhân viên.
- `idx_check_event_patient_time` (check_event.patient_id, occurred_at): đối chiếu giờ dịch vụ theo bệnh nhân.
- `idx_check_exception_event` (check_exception.check_event_id): truy vấn phiếu giải trình.

## Nhóm mobile & đồng bộ
- Unique `device_unique_identifier`: mỗi thiết bị duy nhất trong tổ chức.
- `idx_mobile_session_user` (mobile_session.user_id, started_at DESC): tra history đăng nhập app.
- `idx_offline_queue_user` (offline_queue.user_id, sync_status): đồng bộ dữ liệu offline.
- `idx_mobile_notification_user` (mobile_notification.user_id, status): thông báo chưa đọc.
- `idx_vital_reading_patient` (vital_reading.patient_id, measured_at): biểu đồ chỉ số sinh tồn.

## Nhóm Fire Drill
- `idx_fire_drill_date` (fire_drill.organization_id, drill_date): kiểm tra diễn tập hàng tháng.
- `idx_fire_drill_participant_drill` (fire_drill_participant.fire_drill_id): liệt kê người tham gia.
- `idx_fire_drill_issue_drill` (fire_drill_issue.fire_drill_id): các vấn đề ghi nhận.

## Nhóm Billing & thanh toán
- `idx_claim_status` (claim.status): dashboard claim theo trạng thái.
- Unique `claim_org_number_unique`: số claim duy nhất.
- `idx_claim_line_claim` (claim_line.claim_id): truy vấn line thuộc claim.
- `idx_claim_line_service_date` (claim_line.service_date): báo cáo dịch vụ theo ngày.
- `idx_remittance_allocation_remittance` (remittance_allocation.remittance_id): đánh giá phân bổ thanh toán.
- Unique `remittance_org_number_unique`: số remit duy nhất.
- `idx_expense_org_date` (expense.organization_id, incurred_at): báo cáo chi phí theo thời gian.

## Ghi chú thêm
- Các unique constraint do PostgreSQL tự tạo unique index tương ứng; đã liệt kê để tiện theo dõi.
- Những bảng lớn có cột `deleted_at` đều có index nhằm tối ưu câu truy vấn `WHERE deleted_at IS NULL`.
- Nếu triển khai PostGIS, cần tạo thêm index không gian (GiST) cho trường `geography/geometry` tương ứng.
