package com.laikaclub.auth.integration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);
    private final Path rootLocation = Paths.get("uploads", "avatars");

    public FileStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            logger.error("No se pudo inicializar la carpeta de almacenamiento de avatares", e);
        }
    }

    public String saveAvatar(MultipartFile file, Long userId) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("El archivo subido está vacío");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png") && !contentType.equals("image/webp"))) {
            throw new IllegalArgumentException("Formato de imagen inválido. Use JPG, PNG o WEBP.");
        }

        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 12);
        String filename = "avatar_" + userId + "_" + uniqueSuffix + ".webp";
        Path destinationFile = this.rootLocation.resolve(filename);

        try {
            byte[] bytes = file.getBytes();
            BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(bytes));
            if (originalImage == null) {
                throw new IllegalArgumentException("No se pudo leer el archivo como una imagen válida");
            }

            // Convertir a WebP
            // Si la imagen tiene transparencia (Alpha), la guardamos preservando el canal
            // De lo contrario, convertimos a RGB para evitar fondos extraños
            BufferedImage formattedImage;
            int imageType = originalImage.getType();
            if (originalImage.getColorModel().hasAlpha()) {
                formattedImage = originalImage;
            } else {
                formattedImage = new BufferedImage(originalImage.getWidth(), originalImage.getHeight(), BufferedImage.TYPE_INT_RGB);
                Graphics2D g = formattedImage.createGraphics();
                g.drawImage(originalImage, 0, 0, null);
                g.dispose();
            }

            boolean written = ImageIO.write(formattedImage, "webp", destinationFile.toFile());
            if (!written) {
                // Si falla el plugin WebP, escribimos PNG como fallback
                logger.warn("El escritor de WebP no está disponible. Guardando como PNG pero manteniendo la extensión .webp");
                ImageIO.write(formattedImage, "png", destinationFile.toFile());
            }

            logger.info("Avatar guardado exitosamente en {}", destinationFile.toAbsolutePath());
            return "/api/auth/uploads/avatars/" + filename;

        } catch (IOException e) {
            logger.error("Error guardando el avatar para el usuario {}", userId, e);
            throw new RuntimeException("Error al procesar y convertir la imagen a WebP: " + e.getMessage(), e);
        }
    }
}
