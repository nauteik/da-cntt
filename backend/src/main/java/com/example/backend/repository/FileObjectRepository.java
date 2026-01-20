package com.example.backend.repository;

import com.example.backend.model.entity.FileObject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FileObjectRepository extends JpaRepository<FileObject, UUID> {
}
