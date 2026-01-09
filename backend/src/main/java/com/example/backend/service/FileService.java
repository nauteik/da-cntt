package com.example.backend.service;

import com.example.backend.model.entity.FileObject;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface FileService {
    
    /**
     * Upload a file to Cloudinary and save metadata to database
     * @param file The file to upload
     * @param officeId Optional office ID to associate with the file
     * @return FileObject entity with metadata
     */
    FileObject uploadFile(MultipartFile file, UUID officeId);
    
    /**
     * Get file by ID
     * @param fileId File ID
     * @return FileObject entity
     */
    FileObject getFileById(UUID fileId);
    
    /**
     * Delete file from Cloudinary and database
     * @param fileId File ID
     */
    void deleteFile(UUID fileId);
    
    /**
     * Get file download URL from Cloudinary
     * @param fileId File ID
     * @return Public URL to download the file
     */
    String getFileUrl(UUID fileId);
}
