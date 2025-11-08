# Complete Workflow Test Guide
## Hướng dẫn test luồng hoàn chỉnh: Tạo lịch → Service Delivery → Check-in → Daily Note → Check-out

---

## Tổng quan luồng công việc

```
1. Tạo Schedule Event (Lịch làm việc)
   ↓
2. Tạo Service Delivery (Chi tiết ca làm việc)
   ↓
3. Staff Check-in (GPS validation)
   ↓
4. Làm việc với patient
   ↓
5. Tạo Daily Note (Ghi chú ca làm)
   ↓
6. Staff Check-out (GPS validation)
   ↓
7. Update Status → Complete → Approve
```

---

## Prerequisites (Yêu cầu trước khi test)

Đảm bảo bạn đã có:
- ✅ **Office** đã tạo (UUID của office)
- ✅ **Patient** đã tạo (UUID của patient)
- ✅ **Staff** đã tạo (UUID của staff)
- ✅ **Authorization** (optional - UUID của authorization nếu có)
- ✅ **Access Token** từ login API

### Lấy Access Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@example.com",
    "password": "your-password"
  }'
```

Response sẽ có `accessToken` - copy token này để dùng cho các API calls tiếp theo.

---

## Step 1: Tạo Schedule Event (Lịch làm việc)

**Endpoint:** `POST /api/patients/{patientId}/schedule/template/events`  
**Auth:** ADMIN, MANAGER

### Request
```bash
curl -X POST http://localhost:8080/api/patients/{PATIENT_ID}/schedule/template/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "officeId": "office-uuid-here",
    "eventDate": "2024-11-08",
    "startAt": "2024-11-08T08:00:00+07:00",
    "endAt": "2024-11-08T16:00:00+07:00",
    "authorizationId": "authorization-uuid-here",
    "staffId": "staff-uuid-here",
    "plannedUnits": 32,
    "unitSummary": {
      "totalHours": 8,
      "unitsPer15Min": 32
    }
  }'
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Schedule event created successfully",
  "data": {
    "id": "schedule-event-uuid",
    "officeId": "office-uuid",
    "patientId": "patient-uuid",
    "eventDate": "2024-11-08",
    "startAt": "2024-11-08T08:00:00+07:00",
    "endAt": "2024-11-08T16:00:00+07:00",
    "status": "PLANNED",
    "plannedUnits": 32,
    "staffId": "staff-uuid"
  }
}
```

**📝 Lưu lại:** `schedule-event-uuid` để dùng cho Step 2

---

## Step 2: Tạo Service Delivery (Chi tiết ca làm việc)

**Endpoint:** `POST /api/service-delivery`  
**Auth:** ADMIN, MANAGER, STAFF

### Request
```bash
curl -X POST http://localhost:8080/api/service-delivery \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "scheduleEventId": "schedule-event-uuid-from-step-1",
    "authorizationId": "authorization-uuid-here",
    "startAt": "2024-11-08T08:00:00",
    "endAt": "2024-11-08T16:00:00",
    "units": 32,
    "status": "in_progress",
    "approvalStatus": "pending"
  }'
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Service delivery created successfully",
  "data": {
    "id": "service-delivery-uuid",
    "scheduleEventId": "schedule-event-uuid",
    "authorizationId": "authorization-uuid",
    "officeId": "office-uuid",
    "officeName": "Main Office",
    "patientId": "patient-uuid",
    "patientName": "John Doe",
    "staffId": "staff-uuid",
    "staffName": "Jane Smith",
    "startAt": "2024-11-08T08:00:00",
    "endAt": "2024-11-08T16:00:00",
    "units": 32,
    "status": "in_progress",
    "approvalStatus": "pending",
    "totalHours": null,
    "checkInTime": null,
    "checkOutTime": null,
    "isCheckInCheckOutCompleted": false,
    "isCheckInCheckOutFullyValid": false,
    "createdAt": "2024-11-08T07:55:00",
    "updatedAt": "2024-11-08T07:55:00"
  }
}
```

**📝 Lưu lại:** `service-delivery-uuid` để dùng cho các steps tiếp theo

---

## Step 3: Staff Check-in (Điểm danh vào ca)

**Endpoint:** `POST /api/service-delivery/check-in-check-out/check-in`  
**Auth:** ADMIN, MANAGER, STAFF

### Lưu ý GPS Validation
- Staff phải check-in trong bán kính **1km** từ địa chỉ patient
- Cần cung cấp tọa độ GPS chính xác (latitude, longitude)
- Địa chỉ hiển thị (address) là optional nhưng nên có

### Request
```bash
curl -X POST http://localhost:8080/api/service-delivery/check-in-check-out/check-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "serviceDeliveryId": "service-delivery-uuid-from-step-2",
    "latitude": 10.762622,
    "longitude": 106.660172,
    "address": "123 Main St, District 1, HCMC",
    "notes": "Arrived on time, patient ready"
  }'
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "serviceDeliveryId": "service-delivery-uuid",
    "checkInTime": "2024-11-08T08:05:00",
    "checkInLatitude": 10.762622,
    "checkInLongitude": 106.660172,
    "checkInAddress": "123 Main St, District 1, HCMC",
    "checkInNotes": "Arrived on time, patient ready",
    "isCheckInValid": true,
    "checkInDistanceFromPatient": 0.25,
    "checkOutTime": null,
    "isCheckOutValid": null,
    "totalHours": null,
    "isCompleted": false
  }
}
```

**✅ Check:** 
- `isCheckInValid: true` → GPS validation passed
- `checkInDistanceFromPatient` < 1.0 km

---

## Step 4: Làm việc với Patient

Trong thời gian này, staff thực hiện các công việc chăm sóc patient theo kế hoạch:
- Chăm sóc cá nhân
- Cho ăn
- Tắm rửa
- Vật lý trị liệu
- ...

---

## Step 5: Tạo Daily Note (Ghi chú ca làm)

**Endpoint:** `POST /api/daily-notes`  
**Auth:** ADMIN, MANAGER, STAFF

### ✨ Thay đổi quan trọng
- ✅ **serviceDeliveryId** là required - thay thế cho `patientId` và `staffId`
- ✅ Patient và Staff info được lấy **TỰ ĐỘNG** từ ServiceDelivery
- ✅ Check-in/Check-out time được lấy từ ServiceDelivery
- ❌ Không cần gửi `patientId` và `staffId` nữa!

### Request
```bash
curl -X POST http://localhost:8080/api/daily-notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "serviceDeliveryId": "service-delivery-uuid-from-step-2",
    "content": "Patient had a good day. Participated in all scheduled activities. Good mood throughout the day. No behavioral issues noted. Patient showed improvement in mobility exercises.",
    "mealInfo": [
      {
        "meal": "breakfast",
        "time": "08:30",
        "offered": "Scrambled eggs, toast, orange juice, cereal option",
        "ate": "Scrambled eggs, toast, orange juice",
        "intake": "90%",
        "notes": "Good appetite, enjoyed breakfast"
      },
      {
        "meal": "lunch",
        "time": "12:00",
        "offered": "Grilled chicken, rice, vegetables, soup option",
        "ate": "Grilled chicken, rice, vegetables",
        "intake": "85%",
        "notes": "Left some vegetables"
      },
      {
        "meal": "snack",
        "time": "15:00",
        "offered": "Fruit and crackers, cookies",
        "ate": "Fruit and crackers",
        "intake": "100%",
        "notes": "Requested extra fruit"
      }
    ],
    "patientSignature": "John Doe",
    "staffSignature": "Jane Smith",
    "cancelled": false
  }'
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Daily note created successfully",
  "data": {
    "id": "daily-note-uuid",
    "serviceDeliveryId": "service-delivery-uuid-from-step-2",
    "patientId": "patient-uuid",
    "patientName": "John Doe",
    "staffId": "staff-uuid",
    "staffName": "Jane Smith",
    "content": "Patient had a good day...",
    "checkInTime": "2024-11-08T08:00:00",
    "checkOutTime": "2024-11-08T16:05:00",
    "mealInfo": [
      {
        "meal": "breakfast",
        "time": "08:30",
        "offered": "Scrambled eggs, toast, orange juice, cereal option",
        "ate": "Scrambled eggs, toast, orange juice",
        "intake": "90%",
        "notes": "Good appetite, enjoyed breakfast"
      },
      {
        "meal": "lunch",
        "time": "12:00",
        "offered": "Grilled chicken, rice, vegetables, soup option",
        "ate": "Grilled chicken, rice, vegetables",
        "intake": "85%",
        "notes": "Left some vegetables"
      },
      {
        "meal": "snack",
        "time": "15:00",
        "offered": "Fruit and crackers, cookies",
        "ate": "Fruit and crackers",
        "intake": "100%",
        "notes": "Requested extra fruit"
      }
    ],
    "patientSignature": "John Doe",
    "staffSignature": "Jane Smith",
    "cancelled": false
  }
}
```

**📝 Lưu lại:** `daily-note-uuid` nếu cần update sau

---

## Step 6: Staff Check-out (Điểm danh ra ca)

**Endpoint:** `POST /api/service-delivery/check-in-check-out/check-out`  
**Auth:** ADMIN, MANAGER, STAFF

### Lưu ý
- Phải check-out **sau** khi đã check-in
- GPS validation tương tự check-in (1km radius)
- Sau check-out, `totalHours` sẽ được tự động tính

### Request
```bash
curl -X POST http://localhost:8080/api/service-delivery/check-in-check-out/check-out \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "serviceDeliveryId": "service-delivery-uuid-from-step-2",
    "latitude": 10.762700,
    "longitude": 106.660200,
    "address": "123 Main St, District 1, HCMC",
    "notes": "Shift completed successfully. All tasks done. Patient in good condition."
  }'
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Check-out successful",
  "data": {
    "serviceDeliveryId": "service-delivery-uuid",
    "checkInTime": "2024-11-08T08:05:00",
    "checkInLatitude": 10.762622,
    "checkInLongitude": 106.660172,
    "isCheckInValid": true,
    "checkInDistanceFromPatient": 0.25,
    "checkOutTime": "2024-11-08T16:10:00",
    "checkOutLatitude": 10.762700,
    "checkOutLongitude": 106.660200,
    "checkOutAddress": "123 Main St, District 1, HCMC",
    "checkOutNotes": "Shift completed successfully...",
    "isCheckOutValid": true,
    "checkOutDistanceFromPatient": 0.27,
    "totalHours": 8.08,
    "isCompleted": true
  }
}
```

**✅ Check:**
- `isCheckOutValid: true` → GPS validation passed
- `totalHours` được tính tự động (8.08 hours)
- `isCompleted: true` → Check-in/check-out hoàn tất

---

## Step 7: Update Service Delivery Status

### 7a. Update Status to Completed

**Endpoint:** `PATCH /api/service-delivery/{id}/status`  
**Auth:** ADMIN, MANAGER

```bash
curl -X PATCH "http://localhost:8080/api/service-delivery/service-delivery-uuid-from-step-2/status?status=completed" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Service delivery status updated successfully",
  "data": {
    "id": "service-delivery-uuid",
    "status": "completed",
    "approvalStatus": "pending",
    "totalHours": 8.08,
    "isCheckInCheckOutCompleted": true,
    "isCheckInCheckOutFullyValid": true
  }
}
```

### 7b. Update Approval Status to Approved

**Endpoint:** `PATCH /api/service-delivery/{id}/approval-status`  
**Auth:** ADMIN, MANAGER

```bash
curl -X PATCH "http://localhost:8080/api/service-delivery/service-delivery-uuid-from-step-2/approval-status?approvalStatus=approved" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Service delivery approval status updated successfully",
  "data": {
    "id": "service-delivery-uuid",
    "status": "completed",
    "approvalStatus": "approved",
    "totalHours": 8.08
  }
}
```

---

## Step 8: Verification - Xem lại toàn bộ thông tin

### 8a. Get Service Delivery Details

```bash
curl -X GET http://localhost:8080/api/service-delivery/service-delivery-uuid \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8b. Get Check-in/Check-out Details

```bash
curl -X GET http://localhost:8080/api/service-delivery/check-in-check-out/service-delivery-uuid \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8c. Get Daily Note

```bash
curl -X GET http://localhost:8080/api/daily-notes/daily-note-uuid \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Complete Test Script (Bash)

Đây là script hoàn chỉnh để test toàn bộ workflow:

```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:8080/api"
PATIENT_ID="your-patient-uuid"
OFFICE_ID="your-office-uuid"
STAFF_ID="your-staff-uuid"
AUTHORIZATION_ID="your-authorization-uuid"

# Step 0: Login and get token
echo "Step 0: Login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@example.com",
    "password": "password"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"

# Step 1: Create Schedule Event
echo -e "\n\nStep 1: Creating Schedule Event..."
SCHEDULE_RESPONSE=$(curl -s -X POST $BASE_URL/patients/$PATIENT_ID/schedule/template/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "officeId": "'$OFFICE_ID'",
    "eventDate": "2024-11-08",
    "startAt": "2024-11-08T08:00:00+07:00",
    "endAt": "2024-11-08T16:00:00+07:00",
    "authorizationId": "'$AUTHORIZATION_ID'",
    "staffId": "'$STAFF_ID'",
    "plannedUnits": 32,
    "unitSummary": {"totalHours": 8, "unitsPer15Min": 32}
  }')

SCHEDULE_EVENT_ID=$(echo $SCHEDULE_RESPONSE | jq -r '.data.id')
echo "Schedule Event ID: $SCHEDULE_EVENT_ID"

# Step 2: Create Service Delivery
echo -e "\n\nStep 2: Creating Service Delivery..."
SERVICE_DELIVERY_RESPONSE=$(curl -s -X POST $BASE_URL/service-delivery \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "scheduleEventId": "'$SCHEDULE_EVENT_ID'",
    "authorizationId": "'$AUTHORIZATION_ID'",
    "startAt": "2024-11-08T08:00:00",
    "endAt": "2024-11-08T16:00:00",
    "units": 32
  }')

SERVICE_DELIVERY_ID=$(echo $SERVICE_DELIVERY_RESPONSE | jq -r '.data.id')
echo "Service Delivery ID: $SERVICE_DELIVERY_ID"

# Step 3: Check-in
echo -e "\n\nStep 3: Check-in..."
CHECKIN_RESPONSE=$(curl -s -X POST $BASE_URL/service-delivery/check-in-check-out/check-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "serviceDeliveryId": "'$SERVICE_DELIVERY_ID'",
    "latitude": 10.762622,
    "longitude": 106.660172,
    "address": "123 Main St",
    "notes": "Arrived on time"
  }')

echo $CHECKIN_RESPONSE | jq '.'

# Step 4: Create Daily Note
echo -e "\n\nStep 4: Creating Daily Note..."
DAILY_NOTE_RESPONSE=$(curl -s -X POST $BASE_URL/daily-notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "serviceDeliveryId": "'$SERVICE_DELIVERY_ID'",
    "content": "Patient had a good day. Participated in all activities.",
    "mealInfo": [
      {"meal": "breakfast", "time": "08:30", "intake": "90%", "notes": "Good appetite"},
      {"meal": "lunch", "time": "12:00", "intake": "85%", "notes": "Normal"}
    ],
    "patientSignature": "Patient Name",
    "staffSignature": "Staff Name"
  }')

echo $DAILY_NOTE_RESPONSE | jq '.'

# Step 5: Check-out
echo -e "\n\nStep 5: Check-out..."
CHECKOUT_RESPONSE=$(curl -s -X POST $BASE_URL/service-delivery/check-in-check-out/check-out \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "serviceDeliveryId": "'$SERVICE_DELIVERY_ID'",
    "latitude": 10.762700,
    "longitude": 106.660200,
    "address": "123 Main St",
    "notes": "Shift completed"
  }')

echo $CHECKOUT_RESPONSE | jq '.'

# Step 6: Update Status
echo -e "\n\nStep 6: Updating Status to Completed..."
curl -s -X PATCH "$BASE_URL/service-delivery/$SERVICE_DELIVERY_ID/status?status=completed" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Step 7: Approve
echo -e "\n\nStep 7: Approving Service Delivery..."
curl -s -X PATCH "$BASE_URL/service-delivery/$SERVICE_DELIVERY_ID/approval-status?approvalStatus=approved" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n\n✅ Workflow completed!"
```

---

## Postman Collection

### Import vào Postman

1. Tạo Collection mới: "Complete Workflow"
2. Tạo Environment variables:
   - `base_url`: `http://localhost:8080/api`
   - `token`: (sẽ set tự động từ login)
   - `patient_id`: UUID của patient
   - `office_id`: UUID của office
   - `staff_id`: UUID của staff
   - `schedule_event_id`: (tự động set)
   - `service_delivery_id`: (tự động set)

3. Thêm các request theo thứ tự:
   - **1. Login** → Lưu token vào environment
   - **2. Create Schedule Event** → Lưu schedule_event_id
   - **3. Create Service Delivery** → Lưu service_delivery_id
   - **4. Check-in**
   - **5. Create Daily Note**
   - **6. Check-out**
   - **7. Update Status**
   - **8. Approve**

---

## Troubleshooting

### ❌ Error: "Schedule event not found"
- Kiểm tra `scheduleEventId` có đúng không
- Verify schedule event đã được tạo thành công

### ❌ Error: "Check-in location is too far"
- GPS coordinates phải trong bán kính 1km từ patient address
- Kiểm tra latitude, longitude có đúng format không (số thập phân)

### ❌ Error: "Already checked in"
- Service delivery đã có check-in rồi
- Mỗi service delivery chỉ có 1 check-in và 1 check-out

### ❌ Error: "Must check-in before check-out"
- Phải thực hiện check-in trước khi check-out
- Verify check-in đã thành công chưa

### ❌ Error: "Service delivery not found"
- Kiểm tra `serviceDeliveryId` có đúng không
- Verify service delivery đã được tạo thành công

---

## Expected Results (Kết quả mong đợi)

Sau khi hoàn thành workflow, verify các điều sau:

✅ Schedule Event:
- Status: `PLANNED` hoặc `IN_PROGRESS`
- Có đầy đủ thông tin office, patient, staff

✅ Service Delivery:
- Status: `completed`
- ApprovalStatus: `approved`
- totalHours: ~8 hours (tùy theo thời gian check-in/check-out)
- isCheckInCheckOutCompleted: `true`
- isCheckInCheckOutFullyValid: `true`

✅ Check Events:
- 2 records: 1 CHECK_IN + 1 CHECK_OUT
- Cả 2 đều có isOK: `true` (GPS valid)

✅ Daily Note:
- Có đầy đủ thông tin content, mealInfo, checklist
- Link đến serviceDeliveryId đúng

---

## Notes

- Tất cả timestamps dùng format: `YYYY-MM-DDTHH:mm:ss` (ISO 8601)
- GPS coordinates: latitude (-90 to 90), longitude (-180 to 180)
- Units: 1 unit = 15 minutes → 32 units = 8 hours
- Status values: `in_progress`, `completed`, `cancelled`
- ApprovalStatus values: `pending`, `approved`, `rejected`

---

**Created:** 2024-11-08  
**Version:** 1.0  
**Author:** BAC HMS Development Team
