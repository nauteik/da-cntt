package com.example.backend.controller;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.entity.MedicationAdministration;
import com.example.backend.model.entity.MedicationOrder;
import com.example.backend.model.entity.PatientAllergy;
import com.example.backend.model.enums.DrugForm;
import com.example.backend.service.MedicationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/medications")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;

    // === 1. Master Data (Hồ sơ & danh mục) ===

    /**
     * Lấy danh sách các dạng thuốc (Tablet, Capsule, etc.) để hiển thị trên UI.
     */
    @GetMapping("/forms")
    public ResponseEntity<ApiResponse<List<DrugForm>>> getDrugForms() {
        return ResponseEntity.ok(ApiResponse.success(Arrays.asList(DrugForm.values()), "Drug forms retrieved"));
    }

    /**
     * Lấy danh sách dị ứng của một bệnh nhân cụ thể.
     */
    @GetMapping("/patients/{patientId}/allergies")
    public ResponseEntity<ApiResponse<List<PatientAllergy>>> getPatientAllergies(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(medicationService.getPatientAllergies(patientId), "Allergies retrieved"));
    }

    /**
     * Thêm mới một dị ứng vào hồ sơ bệnh nhân.
     */
    @PostMapping("/allergies")
    public ResponseEntity<ApiResponse<PatientAllergy>> addPatientAllergy(@RequestBody PatientAllergy allergy) {
        return ResponseEntity.ok(ApiResponse.success(medicationService.addAllergy(allergy), "Allergy added"));
    }

    // === 2. Medication Orders (Y lệnh thuốc) ===

    /**
     * Tạo mới một y lệnh thuốc (Prescription).
     * Chức năng: Nhập dose, route, frequency, phân loại Scheduled/PRN.
     */
    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<MedicationOrder>> createOrder(@RequestBody MedicationOrder order) {
        return ResponseEntity.ok(ApiResponse.success(medicationService.createOrder(order), "Order created"));
    }

    /**
     * Lấy danh sách các y lệnh đang còn hiệu lực (active) của bệnh nhân.
     */
    @GetMapping("/patients/{patientId}/orders/active")
    public ResponseEntity<ApiResponse<List<MedicationOrder>>> getActiveOrders(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(medicationService.getActiveOrders(patientId), "Active orders retrieved"));
    }

    /**
     * Ngừng (Discontinue) một y lệnh thuốc trước thời hạn.
     */
    @PutMapping("/orders/{orderId}/discontinue")
    public ResponseEntity<ApiResponse<Void>> discontinueOrder(@PathVariable UUID orderId) {
        medicationService.discontinueOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success(null, "Order discontinued"));
    }

    // === 3. eMAR & Administration (Cấp phát thuốc) ===

    /**
     * Ghi nhận một lần cấp phát thuốc thực tế (eMAR entry).
     * Chức năng: Ký nhận, ghi nhận Vitals, kiểm tra Witness cho thuốc kiểm soát, trừ tồn kho.
     */
    @PostMapping("/administrations")
    public ResponseEntity<ApiResponse<MedicationAdministration>> recordAdministration(@RequestBody MedicationAdministration admin) {
        return ResponseEntity.ok(ApiResponse.success(medicationService.recordAdministration(admin), "Administration recorded"));
    }

    /**
     * Lấy lịch sử cấp phát thuốc (MAR) của bệnh nhân trong một ngày cụ thể.
     * Dùng để hiển thị bảng MAR monthly hoặc daily.
     */
    @GetMapping("/patients/{patientId}/mar")
    public ResponseEntity<ApiResponse<List<MedicationAdministration>>> getPatientMAR(
            @PathVariable UUID patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(medicationService.getPatientMAR(patientId, date), "MAR retrieved"));
    }

    /**
     * Ghi nhận hiệu quả sau khi dùng thuốc PRN (Follow-up effectiveness).
     */
    @PutMapping("/administrations/{adminId}/prn-followup")
    public ResponseEntity<ApiResponse<Void>> recordPrnFollowUp(
            @PathVariable UUID adminId,
            @RequestParam String effectiveness) {
        medicationService.recordPrnFollowUp(adminId, effectiveness);
        return ResponseEntity.ok(ApiResponse.success(null, "PRN follow-up recorded"));
    }

    // === 4. Inventory & Alerts (Tồn kho & Cảnh báo) ===

    /**
     * Lấy danh sách các thuốc sắp hết (dưới ngưỡng reorderLevel) để cảnh báo.
     */
    @GetMapping("/alerts/low-stock")
    public ResponseEntity<ApiResponse<List<MedicationOrder>>> getLowStockAlerts() {
        return ResponseEntity.ok(ApiResponse.success(medicationService.getLowStockOrders(), "Low stock alerts retrieved"));
    }
}
