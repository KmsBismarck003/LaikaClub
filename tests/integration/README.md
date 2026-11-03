# Pruebas de Integración en Vivo (Cero Mocks)

Este directorio alberga la suite de pruebas de integración **en caliente y sin simulaciones falsas (0 MOCKS)** que se conecta y ejecuta directamente contra los microservicios y la base de datos de LAIKA Club que tienes corriendo en Docker.

## Infraestructura Real Evaluada
- **API Gateway (Pilgrim)**: `http://localhost:8000`
- **Microservicio de Autenticación (Spring Boot)**: `http://localhost:8101`
- **Microservicio de Boletos y Asientos (Spring Boot)**: `http://localhost:8202`
- **Microservicio de Administración (Spring Boot)**: `http://localhost:8102`
- **Base de Datos MySQL (Docker `laika_db`)**: `laika_auth`, `laika_tickets`, `laika_events`

---

## Los 20 Escenarios de Negocio Evaluados en Vivo

### Grupo 1: Autenticación, Correo y Contraseñas
1. **¿El correo existe o no? (Usuario inexistente)**: Comprueba que el backend rechaza correos no registrados con código `401 Unauthorized` y mensaje exacto `"Credenciales inválidas"`.
2. **¿La contraseña es correcta o no? (Clave incorrecta)**: Verifica que al intentar loguearse con un usuario existente y contraseña errónea se deniega el acceso con `401`.
3. **Login Exitoso Real**: Autentica al usuario real `admin@laikaclub.com` con su credencial real, valida la emisión del token JWT y el rol `admin`.
4. **Login Operador Real**: Autentica a `operador@laikaclub.com` y valida la emisión de token con rol `operador`.
5. **Inyección SQL en Login**: Envía cargas maliciosas (`' OR '1'='1`) y comprueba que la capa de validación las bloquea de forma segura sin romper la base de datos.

### Grupo 2: Creación de Cuenta y Validaciones de Entrada
6. **Registro con correo ya existente**: Intenta registrar una cuenta con el correo del administrador y comprueba que la base de datos deniega el alta con `"El correo ya está registrado"`.
7. **Formato de correo inválido**: Envía un correo sin `@` ni dominio y valida el rechazo con código `422` y mensaje exacto `"Formato de email inválido"`.
8. **Contraseña corta**: Envía una contraseña de 3 caracteres y valida el rechazo con código `422` y mensaje `"La contraseña debe tener al menos 6 caracteres"`.
9. **Campos obligatorios vacíos**: Intenta registrar usuario con campos en blanco y valida el rechazo por validadores Jakarta / DTO.

### Grupo 3: Control de Acceso por Roles (RBAC)
10. **Acceso Anónimo**: Intenta consumir rutas administrativas (`/api/admin/users`) sin credenciales y comprueba el bloqueo con `401`.
11. **¿Si quiere entrar con otro rol? (Violación de Rol)**: Envía una petición a `/api/admin/users` usando el token del Operador y comprueba que el Gateway Pilgrim bloquea el acceso con `"Access Denied"`.
12. **Acceso Legítimo de Administrador**: Comprueba que con el token de Admin el sistema autoriza el ingreso con código `200` y entrega el catálogo de usuarios.

### Grupo 4: Compras, Asientos y Prevención de Doble Cobro (Doble Clic)
13. **Consulta de Asientos Ocupados**: Consulta `/api/tickets/busy-seats/19` y valida que retorna los miles de asientos ocupados reales en la base de datos.
14. **Apartar Asiento Ocupado**: Intenta apartar el asiento `28-U-5` (que ya está ocupado) y valida que el microservicio de Java responde con código `409 Conflict: "El asiento ... ya está ocupado o siendo comprado por otro usuario"`.
15. **¿Si se pulsa 2 veces al comprar un boleto, se cobra 2 veces o se previene?**:
    - Dispara **2 peticiones idénticas en el mismo milisegundo** sobre un asiento libre.
    - Comprueba que el motor de concurrencia de Java (`ReentrantLock`) autoriza **exactamente 1 compra (`200 OK`)** y **bloquea la segunda con `409 Conflict`**, impidiendo el doble cobro.
16. **Monto no numérico en Pasarela de Pagos**: Envía texto en lugar de números en `/api/tickets/payments/create-intent` y valida el rechazo con `400 Bad Request: "amount debe ser numérico"`.

### Grupo 5: Control de Acceso (Torniquetes / QR), Sesión y Cierre
17. **Escaneo de Boleto Inexistente**: Envía un código inventado a `/api/tickets/verify` y valida que el servicio responde con `statusCode: INVALID_CODE` y `valid: false`.
18. **Verificación de Sesión**: Consulta `/api/auth/verify` con Bearer token y confirma que el microservicio retorna los datos completos del titular activo.
19. **Protección contra Fuerza Bruta (`/check-lockout`)**: Comprueba el contador de intentos fallidos y el estado de bloqueo de la cuenta.
20. **Cierre de Sesión Seguro (Logout)**: Envía `/api/auth/logout`, confirma la invalidación de sesión con `200 OK` y el registro de auditoría en la tabla `auth_logs`.

---

---

## Suite 2: Auditoría de Puertos, Métodos HTTP y Pilgrim Gateway

El archivo [pilgrim_and_ports_audit.js](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/tests/integration/pilgrim_and_ports_audit.js) ejecuta 22 comprobaciones de infraestructura en vivo:

1. **Escaneo de 12 Puertos TCP**:
   - `8000` (Pilgrim API Gateway), `8101` (Auth), `8102` (Admin), `8103` (Stats), `8201` (Events), `8202` (Tickets), `8203` (Merch), `8301` (Achievements), `8302` (Analytics), `8303` (BigData), `3000` (Frontend), `3306` (MySQL Database).
2. **Salud y Proxy Inverso de Pilgrim Gateway**:
   - `GET /api/health` -> Valida estado `healthy`.
   - `GET /` -> Valida catálogo maestro de roles y microservicios.
   - Proxy Inverso a Auth (`/api/auth/health`) y Tickets (`/api/tickets/health`).
3. **Verificación de Métodos HTTP (Verbos REST)**:
   - **GET**: Consulta de salud y metadatos.
   - **POST**: Enrutamiento de payloads en login y registro.
   - **PUT**: Actualización de permisos y roles en el backend.
   - **DELETE**: Liberación y borrado de locks de boletos.
   - **OPTIONS**: Preflight CORS validando cabeceras `Access-Control-Allow-Origin` y métodos autorizados.
   - **404**: Manejo limpio de rutas inexistentes.

### Cómo Ejecutar Esta Suite
```bash
node tests/integration/pilgrim_and_ports_audit.js
```
