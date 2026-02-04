package az.dev.localtube.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * HLS File Controller
 * CORS is handled by CorsFilter - do NOT add manual CORS headers here!
 */
@RestController
@RequestMapping("/hls")
public class HlsController {

    private static final String HLS_DIR = "hls/";

    @GetMapping("/**")
    public ResponseEntity<Resource> serveHlsFile(jakarta.servlet.http.HttpServletRequest request) {
        try {
            // Extract and decode path
            String requestUri = request.getRequestURI();
            String hlsPath = requestUri.substring("/hls/".length());
            hlsPath = URLDecoder.decode(hlsPath, StandardCharsets.UTF_8);

            System.out.println("[HLS] Requested: " + hlsPath);

            // Build paths with normalization
            Path filePath = Paths.get(HLS_DIR, hlsPath).toAbsolutePath().normalize();
            Path baseDir = Paths.get(HLS_DIR).toAbsolutePath().normalize();

            System.out.println("[HLS] File: " + filePath);
            System.out.println("[HLS] Base: " + baseDir);

            // Security check
            if (!filePath.startsWith(baseDir)) {
                System.err.println("[HLS] Security violation - outside base dir");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            // Existence check
            if (!Files.exists(filePath)) {
                System.err.println("[HLS] File not found: " + filePath);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            if (!Files.isRegularFile(filePath)) {
                System.err.println("[HLS] Not a file: " + filePath);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            System.out.println("[HLS] ✓ SUCCESS - Serving: " + filePath.getFileName());

            // Determine content type
            String contentType = determineContentType(filePath);
            Resource resource = new FileSystemResource(filePath);

            // Return response WITHOUT manual CORS headers
            // CorsFilter will add them automatically
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .header(HttpHeaders.PRAGMA, "no-cache")
                    .header(HttpHeaders.EXPIRES, "0")
                    .body(resource);

        } catch (Exception e) {
            System.err.println("[HLS ERROR] " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String determineContentType(Path filePath) {
        String filename = filePath.getFileName().toString().toLowerCase();

        if (filename.endsWith(".m3u8")) {
            return "application/vnd.apple.mpegurl";
        } else if (filename.endsWith(".ts")) {
            return "video/mp2t";
        } else if (filename.endsWith(".key") || filename.endsWith(".bin")) {
            return "application/octet-stream";
        }

        try {
            String type = Files.probeContentType(filePath);
            return type != null ? type : "application/octet-stream";
        } catch (Exception e) {
            return "application/octet-stream";
        }
    }
}