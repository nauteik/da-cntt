package com.example.backend.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Controller to serve custom Swagger UI resources (CSS/JS)
 * Needed because static resource mapping is disabled in application.yml
 */
@RestController
@RequestMapping("/swagger-ui")
public class SwaggerCustomResourceController {

    @GetMapping(value = "/custom.css", produces = "text/css")
    public ResponseEntity<String> getCustomCss() throws IOException {
        Resource resource = new ClassPathResource("static/swagger-ui/custom.css");
        String css = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.valueOf("text/css").toString())
                .body(css);
    }

    @GetMapping(value = "/custom.js", produces = "application/javascript")
    public ResponseEntity<String> getCustomJs() throws IOException {
        Resource resource = new ClassPathResource("static/swagger-ui/custom.js");
        String js = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.valueOf("application/javascript").toString())
                .body(js);
    }
}

