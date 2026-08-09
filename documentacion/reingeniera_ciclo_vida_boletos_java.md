# Reingeniería Total del Ciclo de Vida y Validación de Boletos (Ecosistema LAIKA Club)

## 1. Visión Arquitectónica y Principios de Diseño
La gestión de boletos en **LAIKA Club** ha sido completamente reestructurada para centralizar toda la lógica transaccional, de estado y de auditoría de acceso en el stack nativo de **Java / Spring Boot** (`microservices2/tickets`), eliminando cualquier dependencia de lógica duplicada u obsoleta en Python (reservando el entorno Python exclusivamente para analítica de Big Data e Inteligencia Artificial).

El diseño cumple estrictamente con los siguientes principios:
* **Arquitectura SOLID:** Separación estricta de responsabilidades transaccionales, de acceso a datos y de evaluación lógica mediante repositorios específicos (`TicketValidationLogRepository`), servicios de dominio (`TicketService`) y motores de validación contextual (`ContextualValidationService`).
* **Cero Tolerancia a Deuda Técnica y Mocks:** Todas las validaciones operan contra bases de datos reales y contratos DTO estrictos sin datos ficticios ni caracteres gráficos impersonales (cero emojis).
* **Diseño UI/UX de Alta Fidelidad (Dark Premium):** Interacción fluida con tipografía moderna, paletas de alto contraste y jerarquías visuales corporativas para usuarios y operadores de campo.

---

## 2. Máquina de Estados del Boleto
El ciclo de vida de cada boleto abandona los estados binarios ambiguos y pasa a un modelo formal de 7 estados determinísticos:

```
                  +-----------------------------------+
                  |        ACTIVE / CONFIRMED         |
                  +-----------------+-----------------+
                                    |
            +-----------------------+-----------------------+
            |                       |                       |
            v                       v                       v
      [ Canje en Puerta ]   [ Expiración Temporal ]   [ Cancelación / Reembolso ]
            |                       |                       |
            v                       v                       v
     REDEEMED / USED            UNUTILIZED          REFUNDED / CANCELLED
```

### Definición de Estados:
1. **`ACTIVE` (o `CONFIRMED`):** Boleto emitido, pagado y válido. Concede derecho de acceso al evento programado en la ventana temporal permitida.
2. **`REDEEMED` (o `USED`):** Acceso consumido. El QR fue escaneado en un punto de control físico o digital y el titular ingresó al recinto. El asiento continúa registrado como ocupado.
3. **`UNUTILIZED` (No Utilizado / Archivado):** Estado promovido automáticamente mediante el patrón de **Evaluación en Lectura (Lazy State Evaluation)** cuando una función o evento concluye sin que el boleto haya sido canjeado físicamente. El derecho de acceso expira de forma irrevocable, pero el registro se conserva intacto en la bóveda digital para el historial y fidelidad del titular.
4. **`REFUNDED` / `CANCELLED`:** Acceso revocado administrativamente o devuelto al titular por política de reembolso. El código QR queda inhabilitado para siempre y su asiento asociado se libera en el mapa del recinto.
5. **`TRANSFERRED`:** Propiedad cedida a otro miembro del club. El código QR original queda inhabilitado.

---

## 3. Motor de Validación Contextual (Java Spring Boot)
El servicio `ContextualValidationService` analiza cada intento de lectura en terminales evaluando **5 capas de seguridad e inteligencia transaccional**:

1. **Autenticidad:** Verificación criptográfica de pertenencia del código en el ecosistema.
2. **Revocación:** Bloqueo instantáneo ante boletos reembolsados, cancelados o transferidos.
3. **Control de Duplicidad:** Prevención de re-ingreso ilegal con retorno de metadatos precisos sobre qué operador, qué terminal, qué puerta y a qué hora fue canjeado el boleto originario.
4. **Coherencia Geográfica y Operativa:** Alerta al staff si un boleto auténtico es presentado en una terminal configurada para un evento o función diferente (`WRONG_FUNCTION`).
5. **Ventana Temporal:** Rechazo Informativo ante eventos futuros (`FUTURE_EVENT` con cálculo de segundos restantes para apertura de puertas) o promoción a `UNUTILIZED` si el evento concluyó en fechas anteriores (`CONCLUDED_EVENT`).

### Trazabilidad Inmutable (Audit Logging)
Cada intento de lectura (sea exitoso, rechazado, preventivo o de canje) se registra de manera permanente en la tabla `ticket_validation_logs`:
* **Attributes:** `ticket_id`, `ticket_code`, `user_id`, `event_id`, `operator_id`, `operator_name`, `platform`, `device_info`, `access_point`, `action_type`, `result_status`, `validation_date`, `validation_time`, `notes`.
* **Soporte Multiplataforma:** Captura de intentos originados en `WEB_OPERATOR`, `LAIKA_MOBILE` y dispositivos IoT `LAIKA_WEAR`.

---

## 4. Mejoras en Interfaces e Interconexión Multiplataforma

### A. Bóveda Digital (Web Portal - `UserTickets.jsx`)
* **Segmentación Inteligente:** Dividida en pestañas para separar de manera nítida **Accesos Activos** del **Historial y Concluidos**.
* **Gestión Visual de Boletos No Utilizados:** Cuando un boleto caducó sin uso (`UNUTILIZED`), el portal reemplaza la visualización del QR por un panel informativo de diseño corporativo explicando la conclusión de la función y la conservación del registro conmemorativo.

### B. Consola del Operador de Campo (`StaffTerminal.jsx` & `useStaffTerminal.js`)
* Implementación integral del DTO `TicketValidationResponse`.
* Reemplazo de mensajes genéricos por tarjetas de diagnóstico de alta precisión sin caracteres gráficos ambiguos (utilizando iconos corporativos vectoriales).
* Notificaciones acústicas y visuales diferenciadas para aperturas futuras, errores de evento y alarmas por re-intento de canje.

### C. Sincronización IoT (`LaikaWear`)
* Optimización en el servicio de telemetría y consulta (`MysqlWearableRepository.ts`) mediante filtrado temporal SQL que impide el envío de boletos obsoletos o caducados al almacenamiento en caché de los relojes inteligentes Wear OS, optimizando memoria y batería en los terminales del usuario.

---
*Documento autogenerado por el Arquitecto de Software Empresarial del ecosistema LAIKA Club.*
