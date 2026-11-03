# Ecosistema de Microservicios Java - LAIKA Club (microservices2)

Infraestructura de backend desacoplada, orientada a microservicios basados en Java y Spring Boot 3.x, responsable de la logica de negocio, integridad transaccional y persistencia relacional del ecosistema LAIKA Club.

---

## 1. Descripcion General

El directorio `microservices2` concentra los servicios de mision critica de la plataforma. Cada microservicio es un artefacto autonomo empaquetado con Maven, dotado de su propia base de datos relacional en MySQL 8.0 para preservar el aislamiento de dominio y desacoplamiento estructural. 

Las comunicaciones externas no impactan directamente a estos microservicios; todas las solicitudes son canalizadas, autenticadas y balanceadas a traves de Pilgrim API Gateway (puerto 8000).

---

## 2. Catalogo de Microservicios y Puertos Asignados

Los servicios se agrupan por bloques funcionales numerados en rangos estructurados:

### Bloque 81xx: Identidad, Gobernanza y Monitoreo
| Microservicio | Directorio | Puerto Interno | Base de Datos MySQL | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- |
| `laika_auth` | `auth/` | **8101** | `laika_auth` | Registro, login, emision de JWT, hashing BCrypt, control de fuerza bruta y auditoria en `auth_logs`. |
| `laika_admin` | `admin/` | **8102** | `laika_admin` | Administracion central de usuarios, aprobaciones, SqlVault, configuracion de sistema y envio de correos SMTP. |
| `laika_stats` | `stats/` | **8103** | `laika_stats` | Metricas operativas del sistema, estado de salud de conexiones y registros de auditoria. |

### Bloque 82xx: Operaciones Core y Comercio
| Microservicio | Directorio | Puerto Interno | Base de Datos MySQL | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- |
| `laika_events` | `events/` | **8201** | `laika_events` | Ciclo de vida de eventos, recintos, salas, funciones y calculo en tiempo real de boletos vendidos y recaudacion. |
| `laika_tickets` | `tickets/` | **8202** | `laika_tickets` | Bloqueo concurrente de asientos (`ReentrantLock`), compra, emision de QR, validacion en torniquetes, transferencias y cortesias. |
| `laika_merchandise` | `merchandise/` | **8203** | `laika_merchandise` | Catalogo de mercancia oficial, gestion de variantes, inventario y procesamiento de pedidos fisicos. |

### Bloque 83xx: Datos, Gamificacion e Inteligencia
| Microservicio | Directorio | Puerto Interno | Base de Datos MySQL | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- |
| `laika_achievements` | `achievements/` | **8301** | `laika_achievements` | Motor de recompensas, medallas, desbloqueo de hitos por asistencia o compras. |
| `laika_analytics` | `analytics/` | **8302** | `laika_analytics` | Reportes de ventas, ingresos consolidados y consultas agregadas para dashboards ejecutivos. |

---

## 3. Caracteristicas Tecnicas y Mecanismos de Integridad

1. **Prevencion de Sobrevendidos y Concurrencia (Tickets)**:
   - El microservicio `tickets` implementa un gestor de bloqueo en memoria respaldado por `java.util.concurrent.locks.ReentrantLock`.
   - Cuando dos peticiones concurrentes intentan adquirir el mismo asiento en la misma fraccion de milisegundo, una obtiene el bloqueo exclusivo y completa la compra (`200 OK`), mientras que la segunda es rechazada limpiamente con codigo `409 Conflict`, impidiendo compras duplicadas o cobros dobles.

2. **Calculo Financiero Agregado en Tiempo Real (Events)**:
   - En lugar de persistir contadores estaticos susceptibles a desincronizacion, el microservicio `events` ejecuta consultas agregadas cruzadas contra `laika_tickets.tickets` (`COUNT` de activos y `SUM` de montos), garantizando cifras exactas para los gestores.

3. **Seguridad y Control de Acceso (RBAC)**:
   - Los servicios validan los claims del token JWT emitido por `auth`. Las peticiones que carecen de las credenciales adecuadas son interceptadas con respuestas estandarizadas `401 Unauthorized` o `403 Forbidden`.

4. **Validaciones Estrictas de Entrada (Jakarta Validation)**:
   - DTOs anotados con `@NotBlank`, `@Email`, `@Size` y validadores de negocio propios. Cualquier anomalia en la carga util produce un rechazo inmediato con codigo `422 Unprocessable Entity` o `400 Bad Request`.

---

## 4. Estructura Comun de Cada Microservicio

Cada carpeta de servicio (ejemplo: `microservices2/tickets`) sigue la arquitectura Clean Architecture / MVC de Spring Boot:

```
microservices2/<servicio>/
├── src/
│   ├── main/
│   │   ├── java/com/laikaclub/<servicio>/
│   │   │   ├── config/              # Seguridad, CORS, beans de infraestructura
│   │   │   ├── controller/          # Endpoints REST (@RestController)
│   │   │   ├── dto/                 # Data Transfer Objects y validaciones
│   │   │   ├── model/               # Entidades JPA (@Entity)
│   │   │   ├── repository/          # Interfaces Spring Data JPA
│   │   │   ├── service/             # Logica de negocio y casos de uso
│   │   │   └── <Servicio>Application.java # Clase principal Spring Boot
│   │   └── resources/
│   │       └── application.properties # Configuracion de puerto, MySQL y perfiles
│   └── test/                        # Pruebas unitarias de controladores y servicios
├── Dockerfile                       # Construccion de imagen Docker Multi-Stage
├── mvnw / mvnw.cmd                  # Maven Wrapper
└── pom.xml                          # Definicion de dependencias y plugins Maven
```

---

## 5. Compilacion y Ejecucion

### Prerrequisitos
- Java Development Kit (JDK) 17 o 21.
- MySQL 8.0 en ejecucion (puerto 3306).
- Variables de entorno de base de datos (`MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`).

### Compilacion de un Microservicio Especifico
```bash
cd microservices2/tickets
./mvnw clean package -DskipTests
```
*(En Windows, utiliza `mvnw.cmd clean package -DskipTests`).*

### Ejecucion Local de un Microservicio
```bash
./mvnw spring-boot:run
```

### Ejecucion Orquestada Mediante Docker Compose
Desde la raiz del proyecto `LaikaClub`, los microservicios se despliegan de forma automatizada junto con MySQL y Pilgrim Gateway:
```bash
docker-compose up -d
```
Docker realizara la construccion de las imagenes a traves de sus respectivos Dockerfiles y conectara los servicios en la red virtual `laika_network`.
