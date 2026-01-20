package com.example.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.entity.AppUser;
import com.example.backend.model.entity.FileObject;
import com.example.backend.model.entity.Office;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.repository.FileObjectRepository;
import com.example.backend.repository.OfficeRepository;
import com.example.backend.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final Cloudinary cloudinary;
    private final FileObjectRepository fileObjectRepository;
    private final AppUserRepository appUserRepository;
    private final OfficeRepository officeRepository;

    private static final long MAX_FILE_SIZE = 15 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"};
    private static final String[] ALLOWED_DOCUMENT_TYPES = {"application/pdf"};

    @Override
    @Transactional
    public FileObject uploadFile(MultipartFile file, UUID officeId) {
        // Validate file
        validateFile(file);

        try {
            // Get current user
            AppUser currentUser = getCurrentUser();

            // Upload to Cloudinary
            Map<String, Object> uploadResult = uploadToCloudinary(file);

            // Extract Cloudinary response data
            String publicId = (String) uploadResult.get("public_id");
            String secureUrl = (String) uploadResult.get("secure_url");
            String format = (String) uploadResult.get("format");
            Long bytes = uploadResult.get("bytes") != null 
                ? ((Number) uploadResult.get("bytes")).longValue() 
                : file.getSize();

            // Get office if provided
            Office office = null;
            if (officeId != null) {
                office = officeRepository.findById(officeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Office not found with id: " + officeId));
            }

            // Create FileObject entity
            FileObject fileObject = new FileObject(
                file.getOriginalFilename(),
                file.getContentType(),
                bytes,
                secureUrl
            );

            // Set additional metadata
            fileObject.setOffice(office);
            fileObject.setCreatedByUser(currentUser);

            // Store Cloudinary metadata
            Map<String, Object> meta = new HashMap<>();
            meta.put("cloudinary_public_id", publicId);
            meta.put("cloudinary_format", format);
            meta.put("cloudinary_version", uploadResult.get("version"));
            meta.put("cloudinary_resource_type", uploadResult.get("resource_type"));
            fileObject.setMeta(meta);

            // Save to database
            FileObject savedFile = fileObjectRepository.save(fileObject);
            
            log.info("File uploaded successfully: {} (ID: {})", file.getOriginalFilename(), savedFile.getId());
            return savedFile;

        } catch (IOException e) {
            log.error("Error uploading file to Cloudinary: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public FileObject getFileById(UUID fileId) {
        return fileObjectRepository.findById(fileId)
            .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + fileId));
    }

    @Override
    @Transactional
    public void deleteFile(UUID fileId) {
        FileObject fileObject = getFileById(fileId);
        
        try {
            // Delete from Cloudinary
            String publicId = (String) fileObject.getMeta().get("cloudinary_public_id");
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("File deleted from Cloudinary: {}", publicId);
            }
            
            // Delete from database
            fileObjectRepository.delete(fileObject);
            log.info("File deleted from database: {}", fileId);
            
        } catch (IOException e) {
            log.error("Error deleting file from Cloudinary: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String getFileUrl(UUID fileId) {
        FileObject fileObject = getFileById(fileId);
        return fileObject.getStorageUri();
    }

    /**
     * Validate uploaded file
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 10MB");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("File content type is null");
        }

        // Check if file type is allowed
        boolean isAllowed = false;
        for (String allowedType : ALLOWED_IMAGE_TYPES) {
            if (allowedType.equals(contentType)) {
                isAllowed = true;
                break;
            }
        }
        if (!isAllowed) {
            for (String allowedType : ALLOWED_DOCUMENT_TYPES) {
                if (allowedType.equals(contentType)) {
                    isAllowed = true;
                    break;
                }
            }
        }

        if (!isAllowed) {
            throw new IllegalArgumentException("File type not allowed. Allowed types: images (JPEG, PNG, GIF, WebP) and PDF");
        }
    }

    /**
     * Upload file to Cloudinary
     */
    private Map<String, Object> uploadToCloudinary(MultipartFile file) throws IOException {
        Map<String, Object> options = new HashMap<>();
        
        // Set resource type based on file type
        String contentType = file.getContentType();
        if (contentType != null && contentType.startsWith("image/")) {
            options.put("resource_type", "image");
        } else if ("application/pdf".equals(contentType)) {
            options.put("resource_type", "raw"); // PDFs are stored as raw files
        }

        // Generate public_id with extension to preserve filename and extension
        String publicId = generatePublicId(file);
        options.put("public_id", publicId);
        
        // For raw files (PDF), ensure format is preserved in the URL
        if ("application/pdf".equals(contentType)) {
            options.put("format", "pdf");
        }

        // Upload file
        @SuppressWarnings("unchecked")
        Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), options);
        return result;
    }

    /**
     * Generate a unique public_id with file extension
     * Uses UUID to ensure uniqueness while preserving the original extension
     */
    private String generatePublicId(MultipartFile file) {
        // Get file extension from original filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        } else {
            // Fallback: determine extension from content type
            String contentType = file.getContentType();
            if (contentType != null) {
                if (contentType.startsWith("image/")) { 
                    extension = "." + contentType.substring(6); // e.g., "image/jpeg" -> ".jpeg"
                    if (extension.equals(".jpeg")) extension = ".jpg";
                } else if ("application/pdf".equals(contentType)) {
                    extension = ".pdf";
                }
            }
        }
        
        // Generate unique ID with extension
        // Format: files/{UUID}{extension}
        return "files/" + UUID.randomUUID().toString() + extension;
    }

    /**
     * Get current authenticated user
     */
    private AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() 
            || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("User is not authenticated");
        }

        String email = authentication.getName();
        return appUserRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}
