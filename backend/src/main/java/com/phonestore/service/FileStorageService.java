package com.phonestore.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private final Set<String> allowedExtensions = new HashSet<>(Arrays.asList(
        "jpg", "jpeg", "png", "gif", "webp"
    ));

    private final long maxFileSize = 10 * 1024 * 1024; // 10MB

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            // Create subfolders
            Files.createDirectories(uploadPath.resolve("products"));
            Files.createDirectories(uploadPath.resolve("categories"));
            Files.createDirectories(uploadPath.resolve("banners"));
            Files.createDirectories(uploadPath.resolve("temp"));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directories", e);
        }
    }

    public String storeFile(MultipartFile file, String subfolder) {
        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file");
        }

        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("File size exceeds limit (10MB)");
        }

        // Clean filename
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String filename = originalFilename.toLowerCase();

        // Validate filename
        if (filename.contains("..")) {
            throw new RuntimeException("Invalid filename: " + filename);
        }

        // Extract and validate extension
        String ext = "";
        int lastDot = filename.lastIndexOf(".");
        if (lastDot > 0) {
            ext = filename.substring(lastDot + 1);
        }

        if (!allowedExtensions.contains(ext)) {
            throw new RuntimeException("Invalid file type. Allowed: " + allowedExtensions);
        }

        // Generate unique filename
        String uniqueName = UUID.randomUUID().toString() + "." + ext;

        // Create subfolder path
        Path subfolderPath = Paths.get(uploadDir, subfolder);
        try {
            if (!Files.exists(subfolderPath)) {
                Files.createDirectories(subfolderPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create subfolder", e);
        }

        // Save file
        Path destinationFile = subfolderPath.resolve(uniqueName);
        try {
            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + filename, e);
        }

        // Return public URL
        return "/uploads/" + subfolder + "/" + uniqueName;
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        try {
            // Extract path from URL
            String filePath = fileUrl.replaceFirst("^/uploads/", "");
            Path path = Paths.get(uploadDir, filePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            // Silent delete - file might not exist
        }
    }

    public String getUploadDir() {
        return uploadDir;
    }
}
