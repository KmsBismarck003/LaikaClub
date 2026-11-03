# Pruebas Unitarias y Reglas de Negocio (UT)

Este directorio alberga las pruebas unitarias aisladas para las reglas de negocio críticas de LAIKA Club, enfocadas en validaciones de entrada, seguridad, sanitización, ciclo de vida de boletos y prevención de doble compra/canje.

## Herramientas Utilizadas
- **Node.js**: Entorno de ejecución nativo (sin dependencias externas pesadas).
- **Jest / Vitest** (Opcional): Compatible con runners estándar de JavaScript.

## Casos de Prueba Implementados (25 Pruebas)
1. **Validación de Correo**: Formato RFC, rechazo de dobles arrobas y correos sin dominio.
2. **Duplicidad de Correos**: Verificación de correos existentes vs. nuevos registros.
3. **Robustez de Contraseñas**: Validación de 8 caracteres, mayúsculas, minúsculas, números y símbolos.
4. **Coincidencia de Contraseña**: Detección de discrepancias en confirmación de registro.
5. **Detección de Inyección SQL**: Bloqueo de patrones `' OR '1'='1` y comandos `DROP TABLE`.
6. **Detección de Vectores XSS**: Identificación de etiquetas `<script>` y payloads de inyección.
7. **Sanitización de Texto**: Remoción de tags HTML y caracteres nulos (`\u0000`).
8. **Estados de Boletos**: 
   - `VALID_ACCESS` (Boleto activo).
   - `ALREADY_REDEEMED` (Prevención de doble ingreso).
   - `REVOKED_TICKET` (Boletos cancelados o reembolsados).
   - `TRANSFERRED_TICKET` (Boletos cedidos a otro usuario).
   - `PENDING_CLAIM` (Cortesías pendientes de reclamo).
   - `INVALID_CODE` (Códigos inexistentes).
9. **Bloqueo de Asientos (`SeatLockManager`)**: Prevención de colisión entre dos usuarios apartando el mismo asiento.
10. **Prevención de Doble Compra**: Detección de boletos ya emitidos y carritos con montos inválidos o negativos.

## Cómo Ejecutar
Desde la raíz del proyecto, ejecuta:
```bash
node tests/unit/run-unit-tests.js
```
O directamente dentro de esta carpeta:
```bash
node run-unit-tests.js
```
