# Daily Note Check-In/Check-Out System

## Tổng Quan

Hệ thống check-in/check-out được tích hợp vào **DailyNote** để ghi nhận ca làm việc của nhân viên y tế với xác thực GPS. Hệ thống đảm bảo nhân viên thực sự có mặt tại địa chỉ bệnh nhân (trong bán kính 1km) khi check-in và check-out.

## Tính Năng Chính

1. **GPS Validation**: Xác thực vị trí check-in/check-out trong bán kính 1km từ địa chỉ bệnh nhân
2. **Distance Tracking**: Tính toán và lưu khoảng cách thực tế từ vị trí check-in/out đến địa chỉ bệnh nhân
3. **Time Tracking**: Tự động tính tổng số giờ làm việc từ check-in đến check-out
4. **Validation Flags**: Đánh dấu check-in/check-out có hợp lệ hay không (trong/ngoài bán kính 1km)
5. **Audit Trail**: Lưu trữ đầy đủ thông tin tọa độ, địa chỉ, thời gian cho mục đích kiểm toán

## Cấu Trúc Database

### Bảng `daily_note` - Các Cột Mới

```sql
-- Check-in GPS data
check_in_latitude         DOUBLE PRECISION   -- Vĩ độ check-in
check_in_longitude        DOUBLE PRECISION   -- Kinh độ check-in
check_in_distance_meters  DOUBLE PRECISION   -- Khoảng cách từ địa chỉ bệnh nhân (mét)
check_in_valid           BOOLEAN            -- TRUE nếu trong bán kính 1km

-- Check-out GPS data
check_out_latitude        DOUBLE PRECISION   -- Vĩ độ check-out
check_out_longitude       DOUBLE PRECISION   -- Kinh độ check-out
check_out_distance_meters DOUBLE PRECISION   -- Khoảng cách từ địa chỉ bệnh nhân (mét)
check_out_valid          BOOLEAN            -- TRUE nếu trong bán kính 1km

-- Calculated data
total_hours              DOUBLE PRECISION   -- Tổng số giờ làm việc (tự động tính)
```

### Bảng `patient_address` - Tọa Độ GPS

```sql
latitude        DOUBLE PRECISION   -- Vĩ độ địa chỉ bệnh nhân
longitude       DOUBLE PRECISION   -- Kinh độ địa chỉ bệnh nhân
location_notes  TEXT               -- Ghi chú về vị trí (tầng, căn hộ, etc.)
```

## REST API Endpoints

### 1. Check-In

**POST** `/api/daily-note/check-in-check-out/check-in`

Ghi nhận thời gian và vị trí check-in của nhân viên.

**Request Body:**
```json
{
  "dailyNoteId": "123e4567-e89b-12d3-a456-426614174000",
  "latitude": 10.7769,
  "longitude": 106.7009,
  "address": "227 Nguyễn Văn Cừ, Q5, TP.HCM",
  "notes": "Đã đến địa chỉ bệnh nhân"
}
```

**Response (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "serviceDeliveryId": "456e7890-e89b-12d3-a456-426614174000",
  "patientId": "789e0123-e89b-12d3-a456-426614174000",
  "patientName": "Nguyễn Văn A",
  "staffId": "012e3456-e89b-12d3-a456-426614174000",
  "staffName": "Trần Thị B",
  "checkInTime": "2025-11-01T08:30:00",
  "checkInLatitude": 10.7769,
  "checkInLongitude": 106.7009,
  "checkInLocation": "227 Nguyễn Văn Cừ, Q5, TP.HCM",
  "checkInDistanceMeters": 250.5,
  "checkInDistanceFormatted": "251 m",
  "checkInValid": true,
  "checkOutTime": null,
  "checkOutLatitude": null,
  "checkOutLongitude": null,
  "checkOutLocation": null,
  "checkOutDistanceMeters": null,
  "checkOutDistanceFormatted": "N/A",
  "checkOutValid": null,
  "totalHours": null,
  "patientLatitude": 10.7762,
  "patientLongitude": 106.7005,
  "patientAddress": "227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM",
  "isCompleted": false,
  "isFullyValid": false
}
```

**Validation Logic:**
- Tính khoảng cách từ vị trí check-in đến địa chỉ bệnh nhân sử dụng công thức Haversine
- `checkInValid = true` nếu khoảng cách ≤ 1000 mét (1km)
- `checkInValid = false` nếu khoảng cách > 1000 mét
- Hệ thống vẫn cho phép check-in ngay cả khi `checkInValid = false` (để audit)

### 2. Check-Out

**POST** `/api/daily-note/check-in-check-out/check-out`

Ghi nhận thời gian và vị trí check-out, tự động tính tổng giờ làm việc.

**Request Body:**
```json
{
  "dailyNoteId": "123e4567-e89b-12d3-a456-426614174000",
  "latitude": 10.7765,
  "longitude": 106.7008,
  "address": "227 Nguyễn Văn Cừ, Q5, TP.HCM",
  "notes": "Hoàn thành ca làm việc"
}
```

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "checkInTime": "2025-11-01T08:30:00",
  "checkInValid": true,
  "checkOutTime": "2025-11-01T16:30:00",
  "checkOutLatitude": 10.7765,
  "checkOutLongitude": 106.7008,
  "checkOutLocation": "227 Nguyễn Văn Cừ, Q5, TP.HCM",
  "checkOutDistanceMeters": 180.3,
  "checkOutDistanceFormatted": "180 m",
  "checkOutValid": true,
  "totalHours": 8.0,
  "isCompleted": true,
  "isFullyValid": true
}
```

**Business Rules:**
- Phải check-in trước khi check-out
- Không thể check-out 2 lần cho cùng 1 daily note
- `totalHours` được tự động tính: `(checkOutTime - checkInTime) / 3600`
- `isFullyValid = true` khi cả check-in và check-out đều valid

### 3. Get Check-In/Check-Out Info

**GET** `/api/daily-note/check-in-check-out/{dailyNoteId}`

Lấy thông tin check-in/check-out của một daily note.

**Response (200 OK):** (Same structure as check-in/check-out response)

### 4. Get Staff Check-In/Check-Out History

**GET** `/api/daily-note/check-in-check-out/staff/{staffId}`

Lấy lịch sử check-in/check-out của nhân viên (sắp xếp theo thời gian check-in mới nhất).

**Response (200 OK):**
```json
[
  {
    "id": "...",
    "checkInTime": "2025-11-01T08:30:00",
    "checkOutTime": "2025-11-01T16:30:00",
    "totalHours": 8.0,
    "isCompleted": true,
    "isFullyValid": true
  },
  {
    "id": "...",
    "checkInTime": "2025-10-31T08:00:00",
    "checkOutTime": "2025-10-31T17:00:00",
    "totalHours": 9.0,
    "isCompleted": true,
    "isFullyValid": true
  }
]
```

### 5. Get Incomplete Check-Outs

**GET** `/api/daily-note/check-in-check-out/staff/{staffId}/incomplete`

Lấy danh sách các ca làm việc đã check-in nhưng chưa check-out.

**Response (200 OK):**
```json
[
  {
    "id": "...",
    "checkInTime": "2025-11-01T08:30:00",
    "checkOutTime": null,
    "totalHours": null,
    "isCompleted": false
  }
]
```

### 6. Get Invalid Check-In/Check-Outs

**GET** `/api/daily-note/check-in-check-out/invalid`

Lấy danh sách các check-in/check-out không hợp lệ (ngoài bán kính 1km).

**Response (200 OK):**
```json
[
  {
    "id": "...",
    "staffName": "Trần Thị B",
    "patientName": "Nguyễn Văn A",
    "checkInTime": "2025-11-01T08:30:00",
    "checkInDistanceMeters": 1250.0,
    "checkInDistanceFormatted": "1.25 km",
    "checkInValid": false,
    "checkOutValid": true
  }
]
```

## Tích Hợp Frontend Mobile

### Setup GPS Permission

```typescript
// expo-location
import * as Location from 'expo-location';

// Request permission
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  alert('Cần cấp quyền truy cập vị trí để check-in/check-out');
  return;
}
```

### Check-In Function

```typescript
import * as Location from 'expo-location';

const handleCheckIn = async (dailyNoteId: string) => {
  try {
    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const checkInData = {
      dailyNoteId: dailyNoteId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      address: await reverseGeocode(location.coords), // Optional
      notes: '',
    };

    const response = await fetch(
      `${API_URL}/api/daily-note/check-in-check-out/check-in`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(checkInData),
      }
    );

    const result = await response.json();

    if (!result.checkInValid) {
      alert(
        `⚠️ Check-in ngoài phạm vi cho phép!\n` +
        `Khoảng cách: ${result.checkInDistanceFormatted}\n` +
        `(Yêu cầu: ≤ 1 km từ địa chỉ bệnh nhân)`
      );
    } else {
      alert('✅ Check-in thành công!');
    }
  } catch (error) {
    console.error('Check-in error:', error);
    alert('Lỗi khi check-in. Vui lòng thử lại.');
  }
};
```

### Check-Out Function

```typescript
const handleCheckOut = async (dailyNoteId: string) => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const checkOutData = {
      dailyNoteId: dailyNoteId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      address: await reverseGeocode(location.coords),
      notes: '',
    };

    const response = await fetch(
      `${API_URL}/api/daily-note/check-in-check-out/check-out`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(checkOutData),
      }
    );

    const result = await response.json();

    if (!result.checkOutValid) {
      alert(
        `⚠️ Check-out ngoài phạm vi cho phép!\n` +
        `Khoảng cách: ${result.checkOutDistanceFormatted}\n` +
        `Tổng giờ làm: ${result.totalHours?.toFixed(1)} giờ`
      );
    } else {
      alert(
        `✅ Check-out thành công!\n` +
        `Tổng giờ làm: ${result.totalHours?.toFixed(1)} giờ`
      );
    }
  } catch (error) {
    console.error('Check-out error:', error);
    alert('Lỗi khi check-out. Vui lòng thử lại.');
  }
};
```

### Display Check-In/Check-Out Status

```typescript
interface CheckInCheckOutStatus {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  checkInValid: boolean;
  checkOutValid: boolean;
  totalHours: number | null;
}

const CheckInCheckOutCard: React.FC<{ dailyNoteId: string }> = ({ dailyNoteId }) => {
  const [status, setStatus] = useState<CheckInCheckOutStatus | null>(null);

  useEffect(() => {
    fetchStatus();
  }, [dailyNoteId]);

  const fetchStatus = async () => {
    const response = await fetch(
      `${API_URL}/api/daily-note/check-in-check-out/${dailyNoteId}`
    );
    const data = await response.json();
    setStatus({
      isCheckedIn: data.checkInTime !== null,
      isCheckedOut: data.checkOutTime !== null,
      checkInValid: data.checkInValid,
      checkOutValid: data.checkOutValid,
      totalHours: data.totalHours,
    });
  };

  return (
    <View style={styles.card}>
      {!status?.isCheckedIn && (
        <Button title="Check-In" onPress={() => handleCheckIn(dailyNoteId)} />
      )}
      
      {status?.isCheckedIn && !status?.isCheckedOut && (
        <>
          <Text>✅ Đã check-in {status.checkInValid ? '(Hợp lệ)' : '⚠️ (Ngoài phạm vi)'}</Text>
          <Button title="Check-Out" onPress={() => handleCheckOut(dailyNoteId)} />
        </>
      )}
      
      {status?.isCheckedOut && (
        <>
          <Text>✅ Đã check-out</Text>
          <Text>Tổng giờ làm: {status.totalHours?.toFixed(1)} giờ</Text>
          {!status.checkInValid || !status.checkOutValid ? (
            <Text style={styles.warning}>⚠️ Có check-in/out ngoài phạm vi</Text>
          ) : null}
        </>
      )}
    </View>
  );
};
```

## Công Thức Tính Khoảng Cách GPS

Hệ thống sử dụng **Haversine Formula** để tính khoảng cách giữa 2 điểm GPS:

```java
public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    final double EARTH_RADIUS_KM = 6371.0;
    
    double dLat = Math.toRadians(lat2 - lat1);
    double dLon = Math.toRadians(lon2 - lon1);
    
    double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
               Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
               Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return EARTH_RADIUS_KM * c * 1000; // Convert to meters
}
```

## Testing & Validation

### Test Case 1: Valid Check-In (Within 1km)

```bash
curl -X POST http://localhost:8080/api/daily-note/check-in-check-out/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "dailyNoteId": "123e4567-e89b-12d3-a456-426614174000",
    "latitude": 10.7769,
    "longitude": 106.7009,
    "address": "227 Nguyễn Văn Cừ, Q5, TP.HCM"
  }'
```

### Test Case 2: Invalid Check-In (Outside 1km)

```bash
curl -X POST http://localhost:8080/api/daily-note/check-in-check-out/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "dailyNoteId": "123e4567-e89b-12d3-a456-426614174000",
    "latitude": 10.8000,
    "longitude": 106.7200,
    "address": "Quận 1, TP.HCM"
  }'
```

Expected: `checkInValid: false`, khoảng cách > 1000m

### Test Case 3: Check-Out and Calculate Total Hours

```bash
curl -X POST http://localhost:8080/api/daily-note/check-in-check-out/check-out \
  -H "Content-Type: application/json" \
  -d '{
    "dailyNoteId": "123e4567-e89b-12d3-a456-426614174000",
    "latitude": 10.7765,
    "longitude": 106.7008,
    "address": "227 Nguyễn Văn Cừ, Q5, TP.HCM"
  }'
```

Expected: Response includes `totalHours` calculated from check-in to check-out time

## Database Queries

### Tìm các check-in/out không hợp lệ

```sql
SELECT 
  dn.id,
  p.first_name || ' ' || p.last_name AS patient_name,
  s.first_name || ' ' || s.last_name AS staff_name,
  dn.check_in_time,
  dn.check_in_distance_meters,
  dn.check_in_valid,
  dn.check_out_time,
  dn.check_out_distance_meters,
  dn.check_out_valid,
  dn.total_hours
FROM daily_note dn
JOIN patient p ON dn.patient_id = p.id
JOIN staff s ON dn.staff_id = s.id
WHERE dn.check_in_valid = FALSE OR dn.check_out_valid = FALSE
ORDER BY dn.check_in_time DESC;
```

### Tính tổng giờ làm việc của nhân viên trong tháng

```sql
SELECT 
  s.first_name || ' ' || s.last_name AS staff_name,
  COUNT(*) AS total_shifts,
  SUM(dn.total_hours) AS total_hours,
  AVG(dn.total_hours) AS avg_hours_per_shift
FROM daily_note dn
JOIN staff s ON dn.staff_id = s.id
WHERE EXTRACT(MONTH FROM dn.check_in_time) = 11
  AND EXTRACT(YEAR FROM dn.check_in_time) = 2025
  AND dn.check_out_time IS NOT NULL
GROUP BY s.id, s.first_name, s.last_name
ORDER BY total_hours DESC;
```

### Tìm các ca chưa check-out

```sql
SELECT 
  dn.id,
  p.first_name || ' ' || p.last_name AS patient_name,
  s.first_name || ' ' || s.last_name AS staff_name,
  dn.check_in_time,
  NOW() - dn.check_in_time AS elapsed_time
FROM daily_note dn
JOIN patient p ON dn.patient_id = p.id
JOIN staff s ON dn.staff_id = s.id
WHERE dn.check_in_time IS NOT NULL 
  AND dn.check_out_time IS NULL
ORDER BY dn.check_in_time DESC;
```

## Security & Best Practices

1. **GPS Accuracy**: Sử dụng `Location.Accuracy.Balanced` hoặc `High` để đảm bảo độ chính xác
2. **Error Handling**: Xử lý trường hợp GPS không khả dụng hoặc permission denied
3. **Audit Trail**: Tất cả check-in/out đều được lưu, kể cả khi invalid (để kiểm toán)
4. **Validation**: Hệ thống đánh dấu invalid nhưng vẫn cho phép lưu (không block)
5. **Database Indexes**: Đã tạo indexes cho các truy vấn thường dùng
6. **Constraints**: Database constraints đảm bảo:
   - Check-out time >= Check-in time
   - Coordinates trong khoảng hợp lệ (-90 to 90 lat, -180 to 180 lon)

## Migration Steps

1. **Run database migration:**
   ```bash
   psql -U postgres -d bac_hms -f database/migrations/add_gps_to_daily_note.sql
   ```

2. **Update existing patient addresses with GPS coordinates:**
   ```sql
   -- Example: Update patient address with GPS coordinates
   UPDATE patient_address
   SET latitude = 10.7762,
       longitude = 106.7005,
       location_notes = 'Tầng 3, Tòa nhà A'
   WHERE id = 'patient-address-id';
   ```

3. **Compile and test backend**
4. **Integrate frontend mobile app**
5. **Test end-to-end workflow**

## Troubleshooting

### Issue: "Patient address coordinates not configured"
**Solution:** Cập nhật GPS coordinates cho patient address:
```sql
UPDATE patient_address 
SET latitude = [lat], longitude = [lon] 
WHERE patient_id = [id] AND is_main = true;
```

### Issue: GPS không khả dụng trên thiết bị
**Solution:** 
- Kiểm tra permission trong app settings
- Enable Location Services trên thiết bị
- Test trên thiết bị thật (không phải emulator)

### Issue: Check-in valid nhưng vị trí không đúng
**Solution:**
- Kiểm tra độ chính xác GPS (accuracy level)
- Chờ GPS stable trước khi check-in
- Sử dụng `Location.Accuracy.High` cho độ chính xác cao hơn
