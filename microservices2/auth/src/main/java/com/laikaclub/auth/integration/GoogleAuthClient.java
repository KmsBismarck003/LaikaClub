package com.laikaclub.auth.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class GoogleAuthClient {

    private static final Logger logger = LoggerFactory.getLogger(GoogleAuthClient.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, String> verifyToken(String token) {
        Map<String, String> userInfo = new HashMap<>();

        // 1. Intentar verificar como Google ID Token (JWT)
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .build();

            GoogleIdToken idToken = verifier.verify(token);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                userInfo.put("email", payload.getEmail());
                userInfo.put("given_name", (String) payload.get("given_name"));
                userInfo.put("family_name", (String) payload.get("family_name"));
                logger.info("[GOOGLE AUTH] Token ID verificado exitosamente para: {}", payload.getEmail());
                return userInfo;
            }
        } catch (Exception e) {
            logger.debug("[GOOGLE AUTH] Falló la verificación del token como ID Token JWT, intentando Endpoint UserInfo... Error: {}", e.getMessage());
        }

        // 2. Intentar como Access Token usando el endpoint userinfo de Google
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                userInfo.put("email", root.path("email").asText());
                userInfo.put("given_name", root.path("given_name").asText("User"));
                userInfo.put("family_name", root.path("family_name").asText("Google"));
                logger.info("[GOOGLE AUTH] Access Token verificado mediante endpoint userinfo para: {}", userInfo.get("email"));
                return userInfo;
            }
        } catch (Exception e) {
            logger.error("[GOOGLE AUTH] Falla total en la verificación del token de Google: {}", e.getMessage());
        }

        return null;
    }
}
