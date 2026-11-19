# INFORME DE PRUEBAS DE RENDIMIENTO, CARGA Y ESTRÉS - LAIKACLUB
**Fecha de Ejecución:** 2026-11-16  
**Responsable:** QA Automation Architect Senior  
**Ambiente:** Microservicios en Vivo (Docker + Pilgrim Gateway + MySQL 8.0)  
**Herramienta de Prueba:** Benchmark Concurrente Multi-hilo Asíncrono  
**Volumen Total Evaluado:** 17,200 peticiones en 6 niveles de escalamiento  

---

## 1. RESUMEN EJECUTIVO Y HALLAZGOS DE CAPACIDAD

Se sometió a la plataforma LaikaClub a pruebas de carga progresiva y estrés extremo con niveles de concurrencia de **10, 25, 50, 100, 200 y 400 clientes concurrentes simultáneos** para identificar los puntos de quiebre, cuellos de botella y límites de saturación antes del colapso.

### Puntos de Quiebre Detectados:

1. **Lectura Pública (Cartelera `GET /api/events/public`):**
   - **Capacidad Máxima Sostenida:** **400+ usuarios concurrentes** continuos.
   - **Rendimiento Pico:** **555.5 peticiones por segundo (RPS)**.
   - **Tasa de Error:** **0.0%** (2,000 peticiones exitosas sin una sola falla a 400 hilos).
   - **Latencia P95:** 56.2 ms (C=25) a 471.0 ms (C=400).
   - **Diagnóstico:** Excelente estabilidad. La memoria caché en el Gateway Pilgrim protege eficazmente el microservicio subyacente.

2. **Autenticación y Criptografía (`POST /api/auth/login`):**
   - **Capacidad Máxima Sostenida:** **100 usuarios concurrentes simultáneos**.
   - **Tasa de Error:** **0.0%** (1,000 logins exitosos consecutivos sin fallas).
   - **Comportamiento de Latencia:** P95 pasa de 388.6 ms (C=10) a 8,127.7 ms (C=100).
   - **Diagnóstico:** El algoritmo de hashing BCrypt es intensivo en CPU por diseño (work factor). Aunque no se registran caídas de servicio, se genera una cola de procesamiento que degrada el tiempo de respuesta a partir de 50 peticiones simultáneas por saturación de los cores del contenedor.

3. **Transaccionalidad Crítica de Boletería (`POST /api/tickets/free`):**
   - **Punto de Quiebre (Breaking Point):** **Entre 25 y 35 usuarios concurrentes de escritura**.
   - **C=10:** 200 peticiones, 0% error, latencia promedio 1.4 s.
   - **C=25:** 400 peticiones, 0% error, latencia promedio 1.8 s.
   - **C=50:** 800 peticiones, **37.75% tasa de error** (132 HTTP 502, 139 HTTP 503, 5 HTTP 500, 26 drops).
   - **C=100:** 1,000 peticiones, **97.20% tasa de error** por timeouts de conexión de 15 segundos.
   - **Causa Raíz:** Contención física de bloqueos de fila (*row locks*) en MySQL y agotamiento del pool de conexiones HikariCP en `laika_tickets` (configurado por defecto en 10 conexiones en Spring Boot).

4. **Cuello de Botella en Pilgrim Gateway (Proxy Downstream):**
   - En ráfagas masivas sostenidas sobre microservicios secundarios (`/api/merchandise` y `/api/analytics`), el Gateway agota los descriptores de socket efímeros.
   - **Causa Raíz:** `gateway.py` instancia un nuevo `httpx.AsyncClient()` en cada petición HTTP en lugar de reutilizar un pool global persistente de conexiones HTTP/2 o Keep-Alive.

---

## 2. TABLA COMPARATIVA DE MÉTRICAS POR ENDPOINT Y CONCURRENCIA

| Escenario / Endpoint | Concurrencia (C) | Peticiones (N) | Rendimiento (RPS) | Latencia Media | Latencia P95 | Latencia P99 | Tasa de Error | Estado |
|---|---|---|---|---|---|---|---|---|
| **Cartelera Pública** (`GET /api/events/public`) | 10 | 300 | 408.5 req/s | 23.0 ms | 38.7 ms | 172.0 ms | 0.0% | Óptimo |
| **Cartelera Pública** (`GET /api/events/public`) | 25 | 500 | 555.5 req/s | 39.8 ms | 56.2 ms | 64.8 ms | 0.0% | Óptimo |
| **Cartelera Pública** (`GET /api/events/public`) | 50 | 1,000 | 374.7 req/s | 115.6 ms | 224.6 ms | 271.6 ms | 0.0% | Estable |
| **Cartelera Pública** (`GET /api/events/public`) | 100 | 1,500 | 344.0 req/s | 187.4 ms | 381.9 ms | 477.5 ms | 0.0% | Estable |
| **Cartelera Pública** (`GET /api/events/public`) | 200 | 2,000 | 309.9 req/s | 225.6 ms | 507.5 ms | 757.9 ms | 0.0% | Estable |
| **Cartelera Pública** (`GET /api/events/public`) | 400 | 2,000 | 309.1 req/s | 222.3 ms | 471.0 ms | 670.3 ms | 0.0% | Estable |
| **Login BCrypt** (`POST /api/auth/login`) | 10 | 200 | 31.5 req/s | 309.4 ms | 388.6 ms | 423.7 ms | 0.0% | Estable |
| **Login BCrypt** (`POST /api/auth/login`) | 25 | 400 | 27.6 req/s | 887.1 ms | 2,514.6 ms | 2,808.1 ms | 0.0% | Carga Alta |
| **Login BCrypt** (`POST /api/auth/login`) | 50 | 600 | 12.6 req/s | 3,786.6 ms | 4,760.0 ms | 4,943.2 ms | 0.0% | Degradado |
| **Login BCrypt** (`POST /api/auth/login`) | 100 | 1,000 | 19.5 req/s | 4,959.6 ms | 8,127.7 ms | 8,440.9 ms | 0.0% | Límite CPU |
| **Compra Butacas** (`POST /api/tickets/free`) | 10 | 200 | 6.9 req/s | 1,433.3 ms | 7,863.8 ms | 7,882.4 ms | 0.0% | Estable |
| **Compra Butacas** (`POST /api/tickets/free`) | 25 | 400 | 13.3 req/s | 1,851.4 ms | 8,196.3 ms | 8,632.0 ms | 0.0% | Límite Máximo |
| **Compra Butacas** (`POST /api/tickets/free`) | 50 | 800 | 10.0 req/s | 4,767.0 ms | 11,367.9 ms | 15,028.5 ms | **37.75%** | **Quiebre / Saturación** |
| **Compra Butacas** (`POST /api/tickets/free`) | 100 | 1,000 | 7.5 req/s | 12,404.3 ms | 15,034.5 ms | 15,063.3 ms | **97.20%** | **Colapso Conexiones** |

---

## 3. RECOMENDACIONES DE INGENIERÍA Y ESCALABILIDAD

1. **Aumento del Pool HikariCP en `laika_tickets`:**  
   Elevar `maximumPoolSize` de 10 a 50 conexiones y ajustar `connectionTimeout` a 10,000 ms en `application.properties`.
2. **Reutilización de Cliente HTTP en Gateway:**  
   Reemplazar la instanciación `async with httpx.AsyncClient() as client` por un cliente singleton con `httpx.Limits(max_keepalive_connections=100, max_connections=500)`.
3. **Mecanismo de Distributed Lock (Redis):**  
   Implementar colas de espera o bloqueos distribuidos con Redis Redlock para absorción de tráfico concurrente durante venta masiva de boletos.
4. **Rate Limiting por IP en Login:**  
   Limitar a 5 peticiones por segundo por IP para evitar la saturación de CPU por cálculo de hashes BCrypt.

