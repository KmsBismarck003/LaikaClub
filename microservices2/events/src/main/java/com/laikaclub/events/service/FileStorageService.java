package com.laikaclub.events.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);
    private final Path rootLocation = Paths.get("uploads", "events");

    public FileStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            logger.error("No se pudo inicializar la carpeta de almacenamiento de eventos", e);
        }
    }

    public String saveEventImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("El archivo subido está vacío");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("El archivo no tiene nombre");
        }

        String ext = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            ext = originalFilename.substring(dotIndex).toLowerCase();
        }

        if (!ext.equals(".jpg") && !ext.equals(".jpeg") && !ext.equals(".png") && !ext.equals(".webp") && !ext.equals(".gif")) {
            throw new IllegalArgumentException("Formato de imagen no permitido");
        }

        String uniqueName = UUID.randomUUID().toString().replace("-", "");
        String filename;
        Path destinationFile;

        try {
            byte[] bytes = file.getBytes();

            if (ext.equals(".gif")) {
                filename = uniqueName + ext;
                destinationFile = this.rootLocation.resolve(filename);
                try (FileOutputStream fos = new FileOutputStream(destinationFile.toFile())) {
                    fos.write(bytes);
                }
                logger.info("Imagen GIF guardada exitosamente en {}", destinationFile.toAbsolutePath());
            } else {
                filename = uniqueName + ".webp";
                destinationFile = this.rootLocation.resolve(filename);
                
                BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(bytes));
                if (originalImage == null) {
                    throw new IllegalArgumentException("No se pudo leer el archivo como una imagen válida");
                }

                // Convert to WebP
                BufferedImage formattedImage;
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
                    logger.warn("El escritor de WebP no está disponible. Guardando como PNG pero manteniendo la extensión .webp");
                    ImageIO.write(formattedImage, "png", destinationFile.toFile());
                }
                logger.info("Imagen WebP guardada exitosamente en {}", destinationFile.toAbsolutePath());
            }

            return "/api/events/uploads/events/" + filename;

        } catch (IOException e) {
            logger.error("Error guardando la imagen del evento", e);
            throw new RuntimeException("Error al procesar la imagen: " + e.getMessage(), e);
        }
    }
}
