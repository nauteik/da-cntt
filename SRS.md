# Đặc tả Yêu cầu Hệ thống: Quản lý Chăm sóc Sức khỏe Blue Angels Care (BAC-HMS)

**Phiên bản:** 1.0  
**Ngày:** 18 tháng 9 năm 2025

---

## 1. Giới thiệu

### 1.1. Mục đích
Tài liệu này định nghĩa các yêu cầu chức năng và phi chức năng cho Hệ thống Quản lý Chăm sóc Sức khỏe của Blue Angels Care (BAC-HMS). Hệ thống nhằm số hóa và tự động hóa quy trình vận hành tổ chức, đảm bảo tuân thủ các quy định của tiểu bang Pennsylvania và liên bang.

### 1.2. Phạm vi
- **Bao gồm:**
  - Ứng dụng Web cho quản trị, quản lý văn phòng, tài chính.
  - Ứng dụng Di động cho nhân viên chăm sóc (DSPs/Caregivers) để chấm công qua GPS, báo cáo ca làm việc, quản lý lịch trình.
- **Không bao gồm:**
  - Hệ thống kế toán đầy đủ (chỉ tích hợp hoặc xuất dữ liệu cho phần mềm như QuickBooks).
  - Hệ thống quản lý bảng lương đầy đủ (chỉ cung cấp dữ liệu đầu vào).

### 1.3. Định nghĩa và Thuật ngữ
- **BAC:** Blue Angels Care, nhà cung cấp dịch vụ.
- **DSP/Caregiver:** Nhân viên chăm sóc trực tiếp.
- **ISP:** Kế hoạch Hỗ trợ Cá nhân.
- **Unit:** Đơn vị dịch vụ (15 phút).
- **EVV:** Xác minh Chuyến thăm Điện tử.
- **ODP:** Office of Developmental Programs (Pennsylvania).
- **AE:** Đơn vị Hành chính.
- **eMAR:** Bảng ghi nhận cấp phát thuốc điện tử.

### 1.4. Đối tượng sử dụng
- **Admin:** Quản lý cấu hình, người dùng, phân quyền.
- **Manager:** Quản lý hồ sơ, lịch, giám sát hoạt động văn phòng.
- **DSP:** Sử dụng ứng dụng di động cho công việc hằng ngày.
- **Finance:** Quản lý xuất hóa đơn, thanh toán.

---

## 2. Mô tả Tổng quan

### 2.1. Kiến trúc Hệ thống
- **Modular Monolith:** Backend Java Spring Boot, phân tách module (user, patient, scheduling, billing...).
- **Frontend:** Next.js & TypeScript SPA cho quản trị.
- **Mobile App:** React Native đa nền tảng cho DSPs.
- **Database:** PostgreSQL.
- **Dịch vụ ngoài:** AWS S3 (lưu trữ file), AWS SES/Twilio (email/thông báo).

### 2.2. Ràng buộc và Giả định
- **Tuân thủ HIPAA:** Bảo vệ dữ liệu sức khỏe bệnh nhân.
- **Tuân thủ EVV:** Check-in/out ghi nhận đủ 6 yếu tố theo quy định.
- **Hỗ trợ đa văn phòng:** Dữ liệu gắn với office_id.

---

## 3. Yêu cầu Chức năng

1. Quản lý Hành chính – Pháp lý (Administrative – Legal Management)
Module này tập trung vào việc quản lý các yêu cầu pháp lý và hành chính của BAC.
• Quản lý hồ sơ pháp nhân: Lưu trữ các giấy tờ quan trọng như giấy phép đăng ký kinh doanh, giấy phép hoạt động, thông tin thuế (IRS, PA Department of Revenue), và giấy phép địa điểm.
• Theo dõi và nhắc nhở: Tự động theo dõi ngày hết hạn của giấy phép, thuế, và hợp đồng hành chính, đồng thời gửi cảnh báo/nhắc nhở trước khi hết hạn.
• Quản lý tài liệu điện tử (Document Management): Cho phép tải lên và lưu trữ các file tài liệu (PDF/Word/Scan), phân loại theo loại giấy phép và thời hạn hiệu lực, và cho phép tìm kiếm nhanh hồ sơ.
• Báo cáo & Audit: Tạo báo cáo tổng hợp về giấy phép đang hiệu lực/hết hạn và xuất danh sách hồ sơ pháp lý phục vụ kiểm toán.
2. Module Admin (Trang Quản trị Hệ thống)
Module Admin dùng để quản trị và cấu hình hệ thống, đảm bảo bảo mật và vận hành chung.
• Quản lý người dùng: Cho phép tạo, chỉnh sửa, xóa tài khoản người dùng và reset mật khẩu.
• Phân quyền & vai trò (RBAC): Phân loại vai trò người dùng (Admin, Manager, DSP, Finance) và xác định quyền truy cập (view/add/edit/delete) theo từng module.
• Cấu hình hệ thống: Cài đặt thông tin công ty/Office (chi nhánh), logo, thông tin liên hệ, và cấu hình đơn giá dịch vụ theo Medicaid/ODP.
• Bảo mật: Yêu cầu mật khẩu mạnh, bắt buộc xác thực 2 lớp (2FA) với Admin, và lưu trữ nhật ký kiểm tra (audit log) truy cập.
• Giám sát và Quản lý dữ liệu: Dashboard trạng thái hệ thống và thực hiện sao lưu, khôi phục dữ liệu.
3. Module Hồ sơ nhân viên (Staff Records)
Module này quản lý thông tin nhân sự và đảm bảo tuân thủ các quy định chuyên môn.
• Thông tin cơ bản: Lưu trữ thông tin cá nhân (họ tên, ngày sinh, SSN, liên hệ) và thông tin việc làm (chức danh, ngày vào làm).
• Hồ sơ pháp lý & tuân thủ: Lưu HĐLĐ, giấy tờ nhân sự, và cảnh báo ngày hết hạn.
• Chứng chỉ & đào tạo: Theo dõi các chứng chỉ bắt buộc (ODP, HIPAA, CPR) và nhắc nhở khi sắp hết hạn.
• Kiểm tra lý lịch: Tích hợp liên kết Background Check (ePATCH) và Exclusion List (SAM.gov), lưu kết quả kiểm tra.
• Phân công & khả dụng: Lưu lịch khả dụng của nhân viên, phân ca làm việc và chặn trùng ca.
• Chấm công & GPS (EVV link): Ghi nhận Check In/Out qua ứng dụng di động (GPS, timestamp) và lưu log các trường hợp lệch giờ.
• Lương & đơn giá: Lưu mức lương/đơn giá theo loại dịch vụ và liên kết sang hệ thống Payroll.
4. Module Hồ sơ bệnh nhân (Patient Records)
Module này quản lý dữ liệu đa dạng của nhiều nhóm đối tượng phục vụ.
• Thông tin cơ bản: Lưu họ tên, địa chỉ, số điện thoại, và các mã định danh như MA#, Medicaid ID, SSN (nếu áp dụng), cùng với thông tin người giám hộ.
• Thông tin y tế: Lưu trữ chẩn đoán chính (IDD, Autism, Physical disabilities), lịch sử y tế, dị ứng và hạn chế y tế.
• ISP & Care Plan: Lưu trữ Kế hoạch hỗ trợ cá nhân (ISP) đã được AE phê duyệt, liên kết ISP với dịch vụ và số units được cấp, kèm theo cảnh báo khi vượt units.
• Hồ sơ dịch vụ: Lưu trữ nhật ký Daily Notes từ nhân viên sau mỗi ca.
• Thuốc & điều trị: Danh sách thuốc đang dùng (bao gồm PRN meds) và lưu chỉ định của bác sĩ.
• Lịch sử cư trú: Ghi nhận địa chỉ cư trú, loại hình dịch vụ Residential (Group Home, Life Sharing) và ngày vào/ra.
5. Module Kế hoạch chăm sóc (ISP-based Care Plan)
Đây là module kết nối trực tiếp với ISP do Administrative Entity (AE) cung cấp để xác định dịch vụ và hạn mức units.
• Lưu trữ ISP: Lưu trữ bản ISP đã được AE phê duyệt, kèm metadata như ngày hiệu lực, ngày hết hạn và tổng số units cho trọn hợp đồng.
• Liên kết ISP với dịch vụ: Mapping các mục tiêu ISP với loại dịch vụ cụ thể và kiểm soát số units theo ISP.
• Quản lý mục tiêu & kết quả: Nhập các mục tiêu (Goals) từ ISP và theo dõi tiến độ thực hiện.
• Kế hoạch chăm sóc: Liệt kê các công việc (tasks) cụ thể cho từng mục tiêu/dịch vụ và gắn tasks vào lịch làm việc.
• Quản lý hạn mức units: Theo dõi units đã sử dụng/còn lại và cảnh báo khi gần vượt mức giới hạn được duyệt.
• Tích hợp: Liên kết ISP với Hồ sơ bệnh nhân, Lịch hàng tuần và Billing & Claims.
6. Module Lịch hàng tuần (Weekly Schedule)
Module này quản lý việc sắp xếp ca trực cho nhân viên và bệnh nhân.
• Tạo & quản lý lịch: Tạo lịch hàng tuần dựa trên ISP của bệnh nhân và gán nhân viên vào từng ca/dịch vụ.
• Tuân thủ ISP: Tự động kiểm tra để đảm bảo số giờ và loại dịch vụ không vượt quá số unit được duyệt trong ISP.
• Quản lý ca trực: Định nghĩa giờ bắt đầu/kết thúc, loại dịch vụ và chặn các trường hợp trùng ca hoặc chồng lấn (overlap) giữa các nhân viên trong cùng một thời điểm.
• Tích hợp Mobile App: Hiển thị lịch làm việc trên ứng dụng di động cho DSPs.
7. Module Quản lý cấp phát thuốc (Medication Management)
Module này hỗ trợ quy trình cấp phát thuốc an toàn và tuân thủ.
• Hồ sơ & danh mục: Lưu trữ hồ sơ thuốc, hồ sơ dị ứng và thông tin bác sĩ/pharmacy.
• Y lệnh thuốc: Nhập và lưu Medication Orders (liều lượng, đường dùng, tần suất), phân loại Scheduled vs PRN, và theo dõi ngày hết hạn đơn thuốc.
• eMAR & Lập lịch: Tạo lịch dùng thuốc theo y lệnh, sử dụng MAR điện tử để ký nhận từng lần cấp phát, và cảnh báo khi đến giờ uống thuốc.
• Mobile Med Pass: Cho phép nhân viên ghi nhận cấp phát thuốc (Administered/Refused/Missed) ngay trên ứng dụng di động, bao gồm xác thực GPS.
• Kiểm soát thuốc kiểm soát (Controlled Meds): Duy trì sổ kiểm soát (log nhập-xuất-tồn) và yêu cầu ký nhận kép (double-sign) khi cấp phát/hủy.
• Tồn kho & Hạn dùng: Quản lý tồn kho cho từng bệnh nhân và cảnh báo khi sắp hết thuốc/hạn dùng.
8. Module Quản lý “Monthly Fire Drill Log” (6400 Regulation)
Module đơn giản này theo dõi bảo trì tài sản và tuân thủ diễn tập phòng cháy chữa cháy.
• Lập & lưu nhật ký diễn tập: Ghi nhận ngày, giờ, địa điểm, loại buổi diễn tập (ngày/đêm) và kết quả (thời gian thoát hiểm, sự cố), tuân thủ PA Code 6400.112.
• Yêu cầu lặp lại: Bắt buộc diễn tập ít nhất 1 lần/tháng, và cảnh báo khi sắp hết tháng chưa có log.
• Báo cáo tuân thủ: Xuất báo cáo Fire Drill phục vụ kiểm tra của ODP/AE.
9. Module Quản lý Tài chính – Thu Chi (Billing & Claims)
Module này tự động hóa quy trình lập hóa đơn và gửi yêu cầu thanh toán.
• Tính toán billable units: Tự động tính toán số billable units từ Lịch hàng tuần (Weekly Schedule) dựa trên ISP của từng bệnh nhân.
• Tạo & quản lý Claims: Sinh claim theo chuẩn Medicaid (Medical Assistance) và quản lý trạng thái của claim (pending, approved, denied).
• Quản lý thanh toán: Ghi nhận thanh toán từ Medicaid, Private Pay/Insurance và đối chiếu claims với payments.
• Kiểm soát chi phí: Đối chiếu units thực tế với định mức ISP để tránh vượt giới hạn, và cảnh báo khi billing vượt mức hoặc sai loại dịch vụ.
• Audit & Compliance: Lưu trữ chứng từ billing gắn với hồ sơ bệnh nhân/ISP/nhân viên và tạo báo cáo chuẩn phục vụ kiểm toán của ODP/DHS.
10. Module Ứng dụng di động cho nhân viên (Mobile App for DSPs/Caregivers)
Ứng dụng này là công cụ thiết yếu để cung cấp dịch vụ tại chỗ và tuân thủ EVV.
• Check In/Check Out GPS: Cho phép nhân viên chấm giờ vào/ra tại địa điểm dịch vụ bằng định vị GPS và timestamp (tuân thủ quy định EVV của ODP). Việc tích hợp định vị GPS là yêu cầu của ODP để có cơ sở lập hóa đơn (claim).
• Daily Notes & Reporting: Sau mỗi ca trực, nhân viên ghi nhận báo cáo (Daily Note/Progress Note) ngay trên ứng dụng theo mẫu chuẩn ISP và bắt buộc ký điện tử.
• Lịch làm việc: Hiển thị lịch làm việc hàng tuần và chi tiết ca trực (thời gian, bệnh nhân, địa điểm, loại dịch vụ).
• Medication & Vitals: Ghi nhận cấp phát thuốc (nếu được phân quyền), lưu lý do và theo dõi sau (follow-up) đối với thuốc PRN, và ghi chỉ số vitals cơ bản.
• Incident Reporting: Cho phép báo cáo sự cố ngay từ ứng dụng.
• Đồng bộ & Offline Mode: Ứng dụng phải hoạt động được khi mất mạng và tự động đồng bộ dữ liệu khi có kết nối trở lại.
11. Module Multi-Office (County)
Đây là module yêu cầu mang tính hệ thống để quản lý dữ liệu theo từng chi nhánh/văn phòng (Office).
• Gắn nhãn dữ liệu: Thêm trường office_id vào các bảng dữ liệu cốt lõi (user, patient, ISP, schedule, claim, v.v.).
• Quyền truy cập theo phạm vi: Áp dụng RBAC theo office, đảm bảo người dùng chỉ thấy dữ liệu của văn phòng được gán.
• Quản lý văn phòng: Tạo danh mục văn phòng/County.
• Báo cáo & Dashboard: Tất cả báo cáo và dashboard phải hỗ trợ bộ lọc theo office.
• Billing & Claims: Quá trình lập hóa đơn và bảng giá phải được chạy/cấu hình theo từng office.

---

## 4. Yêu cầu Phi chức năng

### Bảo mật
- Mật khẩu phải được băm và muối.
- Dữ liệu truyền tải qua HTTPS/TLS.
- Dữ liệu nhạy cảm mã hóa khi lưu trữ.
- Phòng chống tấn công web phổ biến.

### Hiệu năng
- API phản hồi < 500ms.
- Trang web tải < 3 giây.

### Độ tin cậy
- Uptime tối thiểu 99.9%.
- Sao lưu dữ liệu tự động hàng ngày.

### Khả năng mở rộng
- Hỗ trợ tối thiểu 200 bệnh nhân, 10 văn phòng mà không cần tái cấu trúc lớn.

### Tính dễ sử dụng
- Giao diện nhất quán, trực quan, dễ dùng cho người không chuyên công nghệ.