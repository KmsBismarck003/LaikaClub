# SISTEMA INTEGRAL DE QA AUTOMATION - LAIKACLUB
## Manual de Arquitectura, Niveles de Prueba y Ejecución Multi-Rol (USUARIO / ADMIN / GESTOR / OPERADOR / FLUJOS AVANZADOS)

Bienvenido al sistema integral y automatizado de Quality Assurance del ecosistema **LaikaClub**, desarrollado bajo estándares de arquitectura limpia y nivel empresarial.

Este framework audita, genera, ejecuta y documenta de forma exhaustiva e independiente todas las funcionalidades, flujos, operaciones y endpoints para los cuatro roles del ecosistema: **USUARIO**, **ADMIN**, **GESTOR**, **OPERADOR** y la suite de **FLUJOS AVANZADOS END-TO-END**, a lo largo de los microservicios Java Spring Boot, FastAPI Pilgrim Gateway, SPAs React (`src/`, `laika-admin/`, `laika-gestor/`, `laika-operador/`) y base de datos relacional MySQL 8.0.

---

## 1. PRINCIPIOS DE CALIDAD Y DIRECTRICES SAGRADAS

1. **Cero Mocks en Pruebas Reales**: Las pruebas HTTP usan el Gateway público de Azure por defecto. Las pruebas que requieren acceso directo a MySQL o a la red privada de contenedores siguen siendo locales y no están expuestas a Internet.
2. **Pruebas 100% Independientes**: Cada escenario cuenta con su propio archivo ejecutable, identificador único estable (`CP-001` .. `CP-078` para Usuario; `CP-ADM-001` .. `CP-ADM-088` para Admin; `CP-GES-001` .. `CP-GES-076` para Gestor; `CP-OPE-001` .. `CP-OPE-060` para Operador; `CP-ADV-001` .. `CP-ADV-032` para Flujos Avanzados).
3. **Aislamiento Multi-Rol Estricto**: Cero sobreescritura de resultados o artefactos. Las evidencias y documentos se segregan por rol en subcarpetas dedicadas (`usuario/`, `admin/`, `gestor/`, `operador/` y `avanzados/`).
4. **Generación Automática de Documentos**: Cada caso ejecutado produce su propio documento Markdown detallado en `test/resultados/casos/<rol>/` conforme a la plantilla oficial de QA (Sección 8).
5. **Evidencias Crudas**: Cada ejecución almacena sus requests, responses, status HTTP, duraciones y trazas en `test/evidencias/<rol>/`.
6. **Transparencia Absoluta**: Se reportan fielmente los estados reales: `Aprobada (PASS)`, `Fallida (FAIL)`, `Bloqueada (BLOCKED)`. Prohibido alterar el código de producción para forzar aprobaciones falsas.

---

## 2. ESTRUCTURA COMPLETA DEL DIRECTORIO `test/`

```
test/
├── UT/                                 # Unit Testing (Pruebas Unitarias Aisladas)
│   ├── frontend/                       # Validación email, contraseñas, cálculo carrito, formato moneda
│   ├── backend/                        # Generación JWT, hashing BCrypt, cálculo reembolsos, cupones
│   ├── database/                       # Restricciones de esquema, índices UNIQUE, autoincrements
│   ├── admin/                          # Matriz de permisos admin, cálculo de respaldos, filtros de anuncios
│   ├── gestor/                         # Duración de eventos, cuotas de cortesía, comisiones de mercancía
│   └── operador/                       # Parser de QR, evaluador de códigos de acceso, cálculo de tasa de flujo
│
├── IT/                                 # Integration Testing (Componentes y Repositorios Reales)
│   ├── frontend/                       # Inyección de headers Authorization, parsing de errores
│   ├── backend/                        # AuthService <-> MySQL, Tickets <-> MySQL, Events <-> MySQL
│   ├── database/                       # Transaccionalidad ACID y rollback en MySQL
│   ├── admin/                          # AdminService <-> MySQL, BackupHistory, RestoreEvents, AuthUserQuery
│   ├── gestor/                         # EventService, CourtesyService, MerchService, VenueService <-> MySQL
│   └── operador/                       # ValidationService <-> MySQL, TicketService <-> MySQL, User query
│
├── SIT/                                # System Integration Testing (Client -> Gateway -> Microservices -> DB)
│   ├── autenticacion/                  # Flujo real de login y verificación de token
│   ├── usuarios/                       # Consulta y actualización de perfil a través del gateway
│   ├── microservicios/                 # Tickets <-> Events, Achievements <-> Tickets
│   ├── comunicacion/                   # Negociación CORS y pre-flight OPTIONS en Pilgrim Gateway
│   ├── admin/                          # Gateway -> Admin/Auth/Stats/B2B/Monitoring
│   ├── gestor/                         # Gateway -> Events/Tickets/Merchandise/Stats para gestor
│   └── operador/                       # Gateway -> Tickets Verify, Staff Verify, Validations History, Stats
│
├── ST/                                 # System Testing (Comportamiento Integral de la Plataforma)
│   ├── navegacion/                     # Servidor React SPA y protección de rutas privadas
│   ├── funcionalidades/                # Filtros de cartelera y consulta de detalle de eventos
│   ├── validaciones/                   # Rechazo de registros incompletos
│   ├── flujos/                         # Bloqueo concurrente y liberación de asientos
│   ├── admin/                          # Guardias de panel admin, filtros de usuarios por rol y estado
│   ├── gestor/                         # Guardias de workspace, filtros de eventos, consistencia de aforo
│   └── operador/                       # Terminal auth guard, consistencia de auditoría, logging de accesos
│
├── UAT/                                # User Acceptance Testing (Experiencia de Usuario, Admin, Gestor y Operador)
│   ├── autenticacion/                  # Flujo onboarding usuario: Registro e inicio de sesión
│   ├── perfil/                         # Edición y persistencia de datos personales
│   ├── funcionalidades/                # Cartera de boletos, rastreador de reembolsos, tienda oficial
│   ├── admin/                          # Administración de usuarios, campañas ads, mantenimiento DB, config
│   ├── gestor/                         # Login gestor, ciclo de vida de evento, cortesías, mercancía
│   └── operador/                       # Login operador, verificación en vivo de boleto, feedback rechazo
│
├── OAT/                                # Operational Acceptance Testing (Operabilidad del Sistema)
│   ├── disponibilidad/                 # Health checks de microservicios Spring Boot y Pilgrim Gateway
│   ├── logs/                           # Verificación de logs de contenedores Docker
│   ├── recuperacion/                   # Resiliencia del pool de conexiones MySQL
│   ├── despliegue/                     # Auditoría de puertos TCP en escucha (3000, 3306, 8000, 8101..8302)
│   ├── admin/                          # Health de laika_admin, tablas admin, optimización y purge de caché
│   ├── gestor/                         # Health de events, tickets, merchandise y stats
│   └── operador/                       # Health de tickets, health de stats, disponibilidad tabla logs
│
├── RT/                                 # Regression Testing (Prevención de Regresiones)
│   ├── usuario/                        # Contratos JSON usuario y cálculo de totales
│   ├── admin/                          # Contratos JSON admin users, database tables, system config
│   ├── gestor/                         # Contratos JSON events, stats dashboard, venues
│   └── operador/                       # Contratos JSON verify response, validations history, staff stats
│
├── PT/                                 # Performance Testing (Rendimiento, Latencia y Carga)
│   ├── carga/                          # Concurrencia de consulta de boletos
│   ├── estres/                         # Ráfagas y saturación en Pilgrim Gateway
│   ├── rendimiento/                    # Latencias de cartelera y login de usuario
│   ├── admin/                          # Latencias de listado de 30,000+ usuarios, tablas stats y login admin
│   ├── gestor/                         # Latencias de eventos, transacciones y dashboard de gestor
│   └── operador/                       # Latencia verificación puerta (<500ms), dashboard (<500ms)
│
├── SECURITY/                           # Security Testing (Seguridad y OWASP Top 10)
│   ├── usuario/                        # SQLi, XSS, tampering JWT, RBAC de rutas privadas, fuerza bruta
│   ├── admin/                          # RBAC estricto ante usuario regular, rechazo sin token, SQLi en búsqueda
│   ├── gestor/                         # RBAC gestor en admin routes, transacciones comerciales, cuotas
│   └── operador/                       # RBAC operador en rutas admin, cuotas, rechazo sin token, SQLi verify
│
├── CT/                                 # Compatibility Testing
│   ├── usuario/                        # User-Agents Chrome/Firefox/Safari/Mobile y UTF-8
│   ├── admin/                          # User-Agents de navegadores de escritorio y encoding UTF-8 en ticker
│   ├── gestor/                         # User-Agents y compatibilidad UTF-8 en descripción de eventos
│   └── operador/                       # Handheld terminal scanners (Zebra, Honeywell, Mobile) y UTF-8
│
├── USABILITY/                          # Usability Testing
│   ├── usuario/                        # Claridad de mensajes de error de login y perfil
│   ├── admin/                          # Validación de campos requeridos y formato de ID de respaldos
│   ├── gestor/                         # Validación ante código de cortesía inválido y payload vacío
│   └── operador/                       # Feedback claro ante FUTURE_EVENT e INVALID_CODE
│
├── ET/                                 # Exploratory Testing
│   ├── usuario/                        # Tokens de transferencia inexistentes y colisiones de butaca
│   ├── admin/                          # Paginación extrema (page=999999, limit=0) e IDs inexistentes
│   ├── gestor/                         # Límites de ID de evento y paginación en transacciones
│   └── operador/                       # Payloads QR corruptos y cadenas de longitud extrema (5,000 chars)
│
├── E2E/                                # End-to-End Testing (Flujos Completos de Principio a Fin)
│   ├── usuario/                        # Ciclo completo de onboarding, compra gratuita, cartera y logros
│   ├── admin/                          # Ciclo completo admin: Login -> Dashboard -> Tablas -> Usuarios -> Config
│   ├── gestor/                         # Ciclo completo gestor: Login -> Dashboard -> Eventos -> Revenue -> Merch -> Logout
│   └── operador/                       # Turno completo staff: Login -> Dashboard -> Scan -> Fallo -> Historial -> Logout
│
├── API/                                # API Testing (Cobertura de Endpoints HTTP Reales)
│   ├── usuario/                        # 17 endpoints HTTP GET, POST, PUT, DELETE del usuario
│   ├── admin/                          # 37 endpoints HTTP del rol administrador
│   ├── gestor/                         # 25 endpoints HTTP del rol gestor / organizador
│   └── operador/                       # 14 endpoints HTTP del rol operador / staff
│
├── DATABASE/                           # Database Testing (Persistencia e Integridad Física MySQL)
│   ├── usuario/                        # Persistencia de usuarios, boletos, reembolsos y overbooking
│   ├── admin/                          # Persistencia de usuarios creados, system_config, restore_events y ads
│   ├── gestor/                         # Persistencia en laika_events, courtesy_quotas, merchandise_items
│   └── operador/                       # Persistencia en ticket_validation_logs, tickets, users
│
├── flujos_avanzados/                   # Flujos Críticos End-to-End, Big Data y Edge Cases (52 casos CP-ADV-001 a 052)
│   ├── compras_pagos/                  # Create intent de pago, montos no numéricos, eventos inexistentes/caducados, locking de asientos
│   ├── cancelacion_reembolsos/         # Política de reembolso por evento, cotización ticket propio/ajeno (404/403), ticketId inválido
│   ├── transferencias/                 # Auto-transferencia ("No puedes transferirte a ti mismo"), recipient vacío, claim-info inexistente, lista incoming
│   ├── creacion_eventos/               # Creación con funciones anidadas, colisión horaria en salas de recinto, ciclo publish/unpublish
│   ├── mercancia/                      # Catálogo público /api/merchandise, moderación admin_status, órdenes vacías
│   ├── contratos_permisos/             # Contratos B2B /api/b2b/contracts, aislamiento multi-tenant IDOR entre gestores
│   ├── roles_cruzados/                 # Usuario -> Admin (403), Operador -> Admin Config (403), password incorrecta con bitácora, SQLi login
│   ├── operador_escaneo/               # QR en evento diferente, código falsificado INVALID_CODE, canje duplicado, ticket transferido
│   ├── logros_beneficios/              # Consulta de beneficios/cupones (LAIKA-01-2WBIEP), validación activa, cupones caducados/inválidos
│   ├── bigdata_analitica/              # Catálogo Spark, método del codo (Elbow), PCA + K-Means, detección de anomalías/bots, prospección y MongoDB Vault
│   ├── recintos_salas_mapas/           # Catálogo territorial (países/estados), tipos de butaca, creación de recintos, salas y constructor de mapas interactivos
│   ├── bloqueo_cuentas/                # Conteo de intentos fallidos de autenticación y desbloqueo administrativo vía PATCH /unlock
│   ├── cortesias/                      # Emisión oficial (prensa/patrocinadores), validación previa de claim tokens y prevención de doble canje (409)
│   ├── respaldos_vault/                # Disparo manual de backup MySQL/MongoDB, exportaciones JSON/SVG y política de auto-respaldo
│   └── correos/                        # Despacho de correos HTML desde consola administrativa y auditoría SMTP
│
├── config/                             # Configuración centralizada de URLs y credenciales de prueba
├── utils/                              # Helpers reutilizables (case_documenter, auth_helper, db_helper)
│
├── resultados/
│   └── casos/
│       ├── usuario/                    # 78 documentos individuales Markdown (CP-001 a CP-078)
│       ├── admin/                      # 88 documentos individuales Markdown (CP-ADM-001 a CP-ADM-088)
│       ├── gestor/                     # 76 documentos individuales Markdown (CP-GES-001 a CP-GES-076)
│       ├── operador/                   # 60 documentos individuales Markdown (CP-OPE-001 a CP-OPE-060)
│       └── avanzados/                  # 52 documentos individuales Markdown (CP-ADV-001 a CP-ADV-052)
│
├── evidencias/
│   ├── usuario/                        # 78 payloads JSON crudos del rol usuario
│   ├── admin/                          # 88 payloads JSON crudos del rol admin
│   ├── gestor/                         # 76 payloads JSON crudos del rol gestor
│   ├── operador/                       # 60 payloads JSON crudos del rol operador
│   └── avanzados/                      # 52 payloads JSON crudos de flujos avanzados
│
├── reportes/
│   ├── informe_qa_usuario.md           # Informe exclusivo del rol USUARIO (78 casos)
│   ├── informe_qa_admin.md             # Informe exclusivo del rol ADMIN (88 casos)
│   ├── informe_qa_gestor.md            # Informe exclusivo del rol GESTOR (76 casos)
│   ├── informe_qa_operador.md          # Informe exclusivo del rol OPERADOR (60 casos)
│   ├── informe_qa_flujos_avanzados.md  # Informe exclusivo de FLUJOS AVANZADOS (52 casos)
│   └── informe_general_qa.md           # Tablero maestro consolidado multi-rol (354 casos)
│
└── run_all_tests.py                    # Ejecutor maestro parametrizado
```

---

## 3. GUÍA DE EJECUCIÓN

### Ejecución por Rol Específico
```bash
# 1. Ejecutar únicamente la suite del rol USUARIO (78 casos)
python test/run_all_tests.py --role usuario

# 2. Ejecutar únicamente la suite del rol ADMIN (88 casos)
python test/run_all_tests.py --role admin

# 3. Ejecutar únicamente la suite del rol GESTOR (76 casos)
python test/run_all_tests.py --role gestor

# 4. Ejecutar únicamente la suite del rol OPERADOR (60 casos)
python test/run_all_tests.py --role operador

# 5. Ejecutar únicamente la suite de FLUJOS AVANZADOS (52 casos)
python test/run_all_tests.py --role avanzados
```

### Ejecución de la Suite Completa Consolidada
```bash
# 6. Ejecutar los 354 casos de toda la plataforma
python test/run_all_tests.py --role all
```

### Destino Azure

Por defecto, las pruebas HTTP usan Pilgrim en `https://laikaclub-pqxdo7.westus.cloudapp.azure.com`. Las verificaciones OAT de servicios utilizan las rutas proxy `/api/auth`, `/api/events`, `/api/tickets`, `/api/stats`, `/api/admin`, `/api/achievements`, `/api/analytics` y `/api/merchandise`; no intentan conectarse a puertos internos de Docker.

Para comprobar la conectividad de producción sin modificar datos, ejecuta únicamente las verificaciones de disponibilidad:

```bash
python test/OAT/disponibilidad/salud_gateway_pilgrim_oat.test.py
python test/OAT/disponibilidad/salud_todos_microservicios_oat.test.py
python test/OAT/despliegue/verificacion_puertos_activos_oat.test.py
```

La suite completa contiene casos que crean, actualizan o eliminan datos, pruebas de carga/estrés y pruebas de seguridad. No la ejecutes contra producción sin una revisión y autorización específicas.

Las URLs pueden sobreescribirse mediante variables de entorno (`GATEWAY_URL`, `FRONTEND_URL` y `*_SERVICE_URL`) para usar otro entorno. Los puertos internos de la VM no se prueban desde clientes externos.

---

## 4. TABLERO DE CALIDAD MULTI-ROL CONSOLIDADO

| Rol / Módulo Evaluado | Casos Totales | Aprobados (PASS) | Fallidos (FAIL) | Tasa de Aprobación |
|---|---|---|---|---|
| **Rol USUARIO** | 78 | 73 | 5 | 93.6% |
| **Rol ADMIN** | 88 | 87 | 1 | 98.9% |
| **Rol GESTOR** | 76 | 72 | 4 | 94.7% |
| **Rol OPERADOR** | 60 | 59 | 1 | 98.3% |
| **FLUJOS AVANZADOS** | 52 | 52 | 0 | 100.0% |
| **TOTAL CONSOLIDADO** | **354** | **343** | **11** | **96.9%** |
