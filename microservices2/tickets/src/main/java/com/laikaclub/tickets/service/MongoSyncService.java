package com.laikaclub.tickets.service;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoCollection;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class MongoSyncService {

    private static final Logger logger = LoggerFactory.getLogger(MongoSyncService.class);

    @Value("${mongo.uri:}")
    private String mongoUri;

    @Value("${mongo.db:laika_analytics}")
    private String mongoDbName;

    private MongoClient mongoClient;
    private MongoDatabase database;

    @PostConstruct
    public void init() {
        if (mongoUri == null || mongoUri.trim().isEmpty()) {
            logger.warn("[MONGO SYNC] No se configuró MONGO_URI. Se omitirá la sincronización.");
            return;
        }

        try {
            String sanitizedUri = mongoUri.replace("\"", "").replace("'", "").trim();
            String sanitizedDb = mongoDbName.replace("\"", "").replace("'", "").trim();

            if (sanitizedUri.isEmpty()) {
                logger.warn("[MONGO SYNC] MONGO_URI sanitizado está vacío. Se omitirá la sincronización.");
                return;
            }

            logger.info("[MONGO SYNC] Inicializando cliente MongoDB para la base de datos: {}", sanitizedDb);
            this.mongoClient = MongoClients.create(sanitizedUri);
            this.database = this.mongoClient.getDatabase(sanitizedDb);
            logger.info("[MONGO SYNC] Cliente MongoDB inicializado correctamente.");
        } catch (Exception e) {
            logger.error("[MONGO SYNC] Error al configurar el cliente de MongoDB: {}", e.getMessage());
            this.mongoClient = null;
            this.database = null;
        }
    }

    @Async
    public void syncPurchaseToMongo(Map<String, Object> purchaseData) {
        if (database == null) {
            logger.debug("[MONGO SYNC] Sincronización omitida: cliente no configurado o inactivo.");
            return;
        }

        try {
            if (!purchaseData.containsKey("synced_at")) {
                purchaseData.put("synced_at", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            }

            MongoCollection<Document> collection = database.getCollection("purchases");
            Document doc = new Document(purchaseData);
            collection.insertOne(doc);
            logger.info("[MONGO SYNC] Compra sincronizada exitosamente con MongoDB.");
        } catch (Exception e) {
            logger.error("[MONGO SYNC] Error no crítico al sincronizar con MongoDB: {}", e.getMessage());
        }
    }
}
