package az.dev.localtube.domain;

public enum VideoStatus {
    UPLOADING,      // Chunks being uploaded
    PROCESSING,     // FFmpeg transcoding
    READY,          // Available for streaming
    FAILED,         // Processing failed
    DELETED         // Marked for deletion
}