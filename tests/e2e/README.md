# Pruebas End-to-End (E2E) y Automatización de Navegador

Este directorio contiene las especificaciones y scripts para pruebas de extremo a extremo que automatizan la interacción con navegadores reales (Chromium, Firefox, WebKit) mediante herramientas como **Playwright** o **Selenium**.

## Herramientas Utilizadas
- **Playwright**: Framework recomendado para automatización moderna, rápida y confiable.
- **Selenium WebDriver** (Alternativa): Para entornos tradicionales empresariales.

## Flujos Críticos Automatizados
1. **Flujo de Login y Credenciales Erróneas**:
   - Ingreso de credenciales inválidas.
   - Comprobación visual de que se despliega el mensaje de error correspondiente.
2. **Inoculación de Caracteres Prohibidos en la UI**:
   - Inyección de caracteres de escape y scripts en formularios de entrada.
   - Verificación de que el DOM no sufre alteraciones ni vulnerabilidades XSS.
3. **Validación de Fortaleza de Contraseña**:
   - Verificación de indicadores visuales interactivos y bloqueo del botón de envío si la clave no cumple las directrices.
4. **Consola de Operador (Acceso y Torniquetes)**:
   - Escaneo de códigos inexistentes -> Alerta visual `CÓDIGO INEXISTENTE`.
   - Intento de reingreso con boleto usado -> Despliegue de modal `BOLETO PREVIAMENTE CANJEADO`.

## Cómo Ejecutar

### Opción A: Diagnóstico de Escenarios en Consola
```bash
node tests/e2e/auth_and_tickets.spec.js
```

### Opción B: Ejecución en Navegador Real con Playwright
Si deseas ver la automatización abriendo el navegador:
```bash
npx playwright test tests/e2e/auth_and_tickets.spec.js --headed
```
Para ejecutar en modo headless (ideal para CI/CD):
```bash
npx playwright test tests/e2e/auth_and_tickets.spec.js
```
