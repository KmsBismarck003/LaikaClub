package com.laikaclub.admin.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

public class ImageUtils {

    public static byte[] optimizeToWebp(byte[] fileContents) {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(fileContents);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            BufferedImage image = ImageIO.read(bais);
            if (image == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de imagen no válido");
            }
            
            // ImageIO write WebP (handled by TwelveMonkeys plugin)
            boolean writerFound = ImageIO.write(image, "webp", baos);
            if (!writerFound) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se encontró un escritor para formato WebP");
            }
            
            return baos.toByteArray();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error al procesar y convertir la imagen a WebP: " + e.getMessage());
        }
    }

    public static String saveImageAsWebp(byte[] fileContents, Path destinationDir, String filenamePrefix) {
        String uniqueSuffix = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String prefix = (filenamePrefix != null && !filenamePrefix.isEmpty()) ? filenamePrefix + "_" : "";
        String filename = prefix + uniqueSuffix + ".webp";

        try {
            Files.createDirectories(destinationDir);
            Path filepath = destinationDir.resolve(filename);

            byte[] webpContents = optimizeToWebp(fileContents);
            Files.write(filepath, webpContents);

            return filename;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al guardar la imagen: " + e.getMessage());
        }
    }
}
