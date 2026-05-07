package com.phonestore.controller;

import com.phonestore.dto.response.ApiResponse;
import com.phonestore.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/v1/upload")
@RequiredArgsConstructor
public class UploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/image")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "temp") String folder) {

        // Validate folder
        if (!isValidFolder(folder)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_FOLDER", "Invalid folder. Allowed: products, categories, banners, temp"));
        }

        try {
            String fileUrl = fileStorageService.storeFile(file, folder);

            Map<String, String> result = new HashMap<>();
            result.put("url", fileUrl);
            result.put("filename", file.getOriginalFilename());

            return ResponseEntity.ok(ApiResponse.success("Upload successful", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("UPLOAD_FAILED", e.getMessage()));
        }
    }

    @PostMapping("/multiple")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadMultiple(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "folder", defaultValue = "temp") String folder) {

        if (!isValidFolder(folder)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_FOLDER", "Invalid folder"));
        }

        Map<String, Object> result = new HashMap<>();
        Map<String, String> uploaded = new HashMap<>();
        Map<String, String> errors = new HashMap<>();

        for (MultipartFile file : files) {
            try {
                String url = fileStorageService.storeFile(file, folder);
                uploaded.put(file.getOriginalFilename(), url);
            } catch (Exception e) {
                errors.put(file.getOriginalFilename(), e.getMessage());
            }
        }

        result.put("uploaded", uploaded);
        result.put("errors", errors);
        result.put("total", files.length);
        result.put("success", uploaded.size());

        return ResponseEntity.ok(ApiResponse.success("Upload complete", result));
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@RequestParam("url") String fileUrl) {
        fileStorageService.deleteFile(fileUrl);
        return ResponseEntity.ok(ApiResponse.success("File deleted", null));
    }

    private boolean isValidFolder(String folder) {
        return folder.matches("^(products|categories|banners|temp)$");
    }
}
