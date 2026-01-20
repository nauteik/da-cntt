package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.entity.FileObject;
import com.example.backend.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * REST API Controller for file upload and management
 */
@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    /**
     * Upload a file (image or PDF)
     * POST /api/files/upload
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'DSP')")
    public ResponseEntity<ApiResponse<FileObject>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "officeId", required = false) UUID officeId) {
        
        try {
            log.info("Uploading file: {} (size: {} bytes)", file.getOriginalFilename(), file.getSize());
            FileObject uploadedFile = fileService.uploadFile(file, officeId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(uploadedFile, "File uploaded successfully"));
        } catch (IllegalArgumentException e) {
            log.warn("File upload validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("File upload error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload file: " + e.getMessage()));
        }
    }

    /**
     * Get file metadata by ID
     * GET /api/files/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'DSP')")
    public ResponseEntity<ApiResponse<FileObject>> getFile(@PathVariable UUID id) {
        try {
            FileObject file = fileService.getFileById(id);
            return ResponseEntity.ok(ApiResponse.success(file, "File retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving file: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("File not found: " + e.getMessage()));
        }
    }

    /**
     * Get file download URL
     * GET /api/files/{id}/url
     */
    @GetMapping("/{id}/url")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'DSP')")
    public ResponseEntity<ApiResponse<String>> getFileUrl(@PathVariable UUID id) {
        try {
            String url = fileService.getFileUrl(id);
            return ResponseEntity.ok(ApiResponse.success(url, "File URL retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving file URL: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("File not found: " + e.getMessage()));
        }
    }

    /**
     * Delete a file
     * DELETE /api/files/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable UUID id) {
        try {
            fileService.deleteFile(id);
            return ResponseEntity.ok(ApiResponse.success("File deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting file: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete file: " + e.getMessage()));
        }
    }
}
