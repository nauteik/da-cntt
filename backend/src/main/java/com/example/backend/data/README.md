# Data Loaders

Các DataLoader này được sử dụng để khởi tạo dữ liệu cơ bản cho hệ thống BAC-HMS khi khởi động ứng dụng.

## Cấu trúc

### 1. DataLoader.java
- File chính điều phối việc load dữ liệu
- Thứ tự load: CoreData → Offices → RolePermissions → Users

### 2. CoreDataLoader.java
- Load Organization (BAC)
- Load 10 Modules hệ thống
- Load 4 Roles cơ bản (ADMIN, MANAGER, DSP, FINANCE)
- Load Permissions cơ bản cho từng module

### 3. OfficeDataLoader.java
- Load 3 Offices với địa chỉ:
  - BAC Main Office (Delaware)
  - BAC Chester Office (Pennsylvania)
  - BAC Montgomery Office (Pennsylvania)

### 4. RolePermissionDataLoader.java
- Gán permissions cho từng role:
  - **ADMIN**: Full access tất cả modules
  - **MANAGER**: Quản lý office, staff, patients, schedules
  - **DSP**: Chăm sóc trực tiếp, mobile operations
  - **FINANCE**: Billing, claims, financial reporting

### 5. UserDataLoader.java
- Tạo 2 users cho mỗi role (tổng 8 users)
- Mật khẩu mặc định: `password123`
- Gán users vào offices phù hợp với role

## Dữ liệu được tạo

### Organizations
- **BAC** (Blue Angels Care LLC)

### Offices
1. **MAIN** - BAC Main Office (Wilmington, DE)
2. **CHESTER** - BAC Chester Office (Chester, PA)
3. **MONTGOMERY** - BAC Montgomery Office (Norristown, PA)

### Roles & Users
1. **ADMIN** (System Admin)
   - admin1@blueangelscare.com
   - admin2@blueangelscare.com

2. **MANAGER** (Office Manager)
   - manager1@blueangelscare.com
   - manager2@blueangelscare.com

3. **DSP** (Direct Support Professional)
   - dsp1@blueangelscare.com
   - dsp2@blueangelscare.com

4. **FINANCE** (Finance & Billing)
   - finance1@blueangelscare.com
   - finance2@blueangelscare.com

### Modules
- ADMIN, STAFF, PATIENT, ISP, SCHEDULE, MOBILE, MEDICATION, BILLING, FIRE_DRILL, COMPLIANCE

## Chạy DataLoader

DataLoaders sẽ tự động chạy khi khởi động Spring Boot application thông qua `CommandLineRunner` interface.

Để disable DataLoader (ví dụ trong production):
```java
@Component
@ConditionalOnProperty(name = "app.data-loader.enabled", havingValue = "true", matchIfMissing = true)
public class DataLoader implements CommandLineRunner {
    // ...
}
```

Sau đó set property:
```properties
app.data-loader.enabled=false
```

## Lưu ý

- Dữ liệu chỉ được tạo nếu chưa tồn tại (idempotent)
- UUIDs được hard-code để đảm bảo consistency
- Mật khẩu được mã hóa bằng BCrypt
- Tất cả timestamps được tự động tạo bởi JPA
