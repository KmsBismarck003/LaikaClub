# Ecosistema de Microservicios Java - LAIKA Club (microservices2)

Infraestructura de backend en Java 17 y Spring Boot `3.2.5`, responsable de la logica de negocio, seguridad, integridad transaccional y persistencia relacional de LAIKA Club.

---

## 1. Descripcion General

El directorio `microservices2` agrupa los microservicios Java compilados con Maven (`mvnw` / `mvnw.cmd`). Cada servicio incluye su propio `pom.xml`, `Dockerfile` y archivo `src/main/resources/application.yml`.

En Docker Compose (`docker-compose.yml` y `docker-compose.prod.yml`), los 8 microservicios de dominio se ejecutan detras de Pilgrim API Gateway (puerto 8000) y se conectan al contenedor MySQL 8.0 (`laika_db`) con bases de datos segregadas por servicio. En ejecucion local fuera de Docker, cada `application.yml` define `MYSQL_DATABASE` con valor por defecto `laika_club3_v2` e incluye configuracion de fallback a SQLite.

---

## 2. Catalogo de Microservicios y Puertos Asignados

### Bloque 81xx: Identidad, Administracion y Estadisticas
| Microservicio | Directorio | Puerto | Base de Datos (Docker Compose) | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- |
| `laika-auth` | `auth/` | **8101** | `laika_auth` | Registro, login, emision y verificacion de JWT, hashing BCrypt, control de fuerza bruta y auditoria en `auth_logs`. |
| `laika-admin` | `admin/` | **8102** | `laika_admin` | Administracion central, configuracion del sistema, respaldos en `/app/backups`, anuncios y envio de correos SMTP. |
| `laika-stats` | `stats/` | **8103** | `laika_stats` | Metricas operativas, paneles de gestor/staff y monitoreo de estado. |

### Bloque 82xx: Operaciones Core y Comercio
| Microservicio | Directorio | Puerto | Base de Datos (Docker Compose) | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- |
| `laika-events` | `events/` | **8201** | `laika_events` | Gestion de eventos, funciones, recintos, salas y consultas agregadas de ventas e ingresos. |
| `laika-tickets` | `tickets/` | **8202** | `laika_tickets` | Bloqueo concurrente de asientos, compra, emision y validacion de QR, canje en torniquetes, transferencias, cortesias y cancelaciones/reembolsos. |
| `laika-merchandise` | `merchandise/` | **8203** | `laika_merchandise` | Catalogo de mercancia oficial, variantes, inventario y pedidos. |

### Bloque 83xx: Gamificacion y Analitica Relacional
| Microservicio | Directorio | Puerto | Base de Datos (Docker Compose) | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- |
| `laika-achievements` | `achievements/` | **8301** | `laika_achievements` | Motor de logros, hitos y recompensas de usuario. |
| `laika-analytics` | `analytics/` | **8302** | `laika_analytics` | Reportes financieros y agregaciones analiticas sobre MySQL. |

### Modulo Alternativo Presente en el Directorio
| Modulo | Directorio | Puerto | Estado |
| :--- | :--- | :--- | :--- |
| `laika-gateway` | `gateway/` | **8000** | Implementacion Spring Boot 3.2.5 alternativa de API Gateway. No se usa en `docker-compose.yml` ni `docker-compose.prod.yml` (el gateway activo es `pilgrim/`). |

---

## 3. Mecanismos Tecnicos Verificados

1. **Control de Concurrencia en Compra y Bloqueo de Asientos (`tickets`)**:
   - `TicketService.java` utiliza un `ConcurrentHashMap<String, ReentrantLock>` indexado por clave compuesta `(eventId, functionId, seatId)` (`getLockKey`).
   - Ante peticiones concurrentes por el mismo asiento, un hilo completa la reserva o compra (`200 OK`) y los demas son rechazados con `409 Conflict` (`ResponseStatusException(HttpStatus.CONFLICT, ...)`).
   - Incluye limpieza de bloqueos expirados (`cleanExpiredLocks`).
2. **Consultas Agregadas de Ventas (`events`)**:
   - `EventQueryService.java` consulta agregaciones directas de boletos vendidos e ingresos para evitar inconsistencias entre el catalogo de eventos y la tabla transaccional de boletos.
3. **Pruebas Unitarias Java Existentes**:
   - `tickets/src/test/`: `CancellationServiceImplTest.java` (ejecutada en `.github/workflows/ci.yml` mediante `mvn test -Dtest=CancellationServiceImplTest`).
   - `auth/src/test/`: `AuthApplicationTests.java` (`auth` se compila en CI con `mvn compile`).
   - Los demas microservicios actualmente no cuentan con archivos de prueba Java en `src/test/`.

---

## 4. Estructura Comun de Cada Microservicio

```text
microservices2/<servicio>/
├── src/
│   ├── main/
│   │   ├── java/com/laikaclub/<servicio>/   # Configuracion, controladores REST, DTOs, modelos, repositorios y servicios
│   │   └── resources/
│   │       └── application.yml              # Configuracion de puerto, MySQL y fallback SQLite
│   └── test/                                # Pruebas unitarias Java (presentes en auth y tickets)
├── Dockerfile                               # Construccion de imagen Docker
├── mvnw / mvnw.cmd                          # Maven Wrapper
└── pom.xml                                  # Dependencias Maven (Spring Boot 3.2.5, Java 17)
```

---

## 5. Compilacion y Ejecucion

### Prerrequisitos
- Java Development Kit (JDK) 17.
- MySQL 8.0 en ejecucion (puerto 3306) o variables de entorno configuradas (`MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`).

### Compilacion de un Microservicio
En Linux/macOS:
```bash
cd microservices2/tickets
./mvnw clean package -DskipTests
```
En Windows:
```powershell
cd microservices2\tickets
.\mvnw.cmd clean package -DskipTests
```

### Ejecucion de Pruebas Java (Modulo `tickets`)
```bash
cd microservices2/tickets
mvn test -Dtest=CancellationServiceImplTest
```

### Ejecucion Local de un Microservicio
```bash
cd microservices2/auth
./mvnw spring-boot:run
```

### Ejecucion Orquestada con Docker Compose
Desde la raiz de `LaikaClub`:
```bash
docker compose up -d
```
Los servicios se conectan dentro de la red Docker `laika_network` junto con `laika_db` y `laika_gateway`.
