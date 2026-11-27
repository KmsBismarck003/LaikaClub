package com.laikaclub.events.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);
    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024L * 1024L;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp", ".gif");

    private final Path rootLocation = Paths.get("uploads", "events");

    public FileStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            logger.error("No se pudo inicializar la carpeta de almacenamiento de eventos", e);
        }
    }

    public String saveEventImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo subido está vacío");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("La imagen excede el tamaño máximo permitido de 10 MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("El archivo no tiene nombre");
        }

        String ext = extractExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF.");
        }

        try {
            byte[] bytes = file.getBytes();
            if (!hasValidImageSignature(bytes)) {
                throw new IllegalArgumentException("El archivo no corresponde a una imagen válida");
            }

            Files.createDirectories(this.rootLocation);
            String normalizedExt = ext.equals(".jpeg") ? ".jpg" : ext;
            String filename = UUID.randomUUID().toString().replace("-", "") + normalizedExt;
            Path destinationFile = this.rootLocation.resolve(filename);

            // Guardar bytes validados directamente sin invocación nativa a libwebp-imageio
            // (evita SIGSEGV en JVM Linux/Docker y preserva calidad/transparencia/animación).
            Files.write(destinationFile, bytes);
            logger.info("Imagen de evento guardada exitosamente en {}", destinationFile.toAbsolutePath());

            return "/api/events/uploads/events/" + filename;
        } catch (IOException e) {
            logger.error("Error guardando la imagen del evento", e);
            throw new RuntimeException("Error al procesar la imagen: " + e.getMessage(), e);
        }
    }

    private String extractExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex <= 0 || dotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(dotIndex).toLowerCase();
    }

    private boolean hasValidImageSignature(byte[] bytes) {
        if (bytes == null || bytes.length < 12) {
            return false;
        }
        // JPEG: FF D8 FF
        if ((bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF) {
            return true;
        }
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if ((bytes[0] & 0xFF) == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47) {
            return true;
        }
        // GIF: GIF87a / GIF89a
        if (bytes[0] == 'G' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == '8') {
            return true;
        }
        // WEBP: RIFF....WEBP
        if (bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return true;
        }
        return false;
    }
}
