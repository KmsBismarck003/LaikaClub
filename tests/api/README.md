# Pruebas de API y Contratos de Servicio (Tipo Postman)

Este directorio contiene las pruebas de integración a nivel de API para verificar los endpoints expuestos a través del API Gateway (puerto `8000`) y los microservicios de `auth` y `tickets`.

## Herramientas Utilizadas
- **Postman**: Para pruebas interactivas, inspección manual y colaboración de equipo.
- **Newman**: CLI oficial de Postman para ejecutar la colección en terminal o pipelines CI/CD.
- **Node.js**: Script ejecutor ligero para verificar estado y contratos sin dependencias pesadas.

## Endpoints y Escenarios Cubiertos
1. **`POST /auth/login`**:
   - Autenticación exitosa y emisión de token JWT.
   - Rechazo de contraseñas erróneas (`401 Unauthorized`).
   - Bloqueo y respuesta segura ante inyecciones SQL (`' OR '1'='1`).
2. **`POST /tickets/verify`**:
   - Verificación de código inexistente (`INVALID_CODE`).
   - Comprobación de metadatos de acceso y contexto de terminal.
3. **`POST /tickets/redeem`**:
   - Detección de boletos ya canjeados (`ALREADY_REDEEMED`).
   - Prevención de doble ingreso físico.
4. **`POST /tickets/payments/create-intent`**:
   - Rechazo de montos negativos o inválidos (`400 Bad Request`).

## Cómo Ejecutar

### Opción A: Script Node Rápido
Verifica el estado del Gateway y los contratos de la colección:
```bash
node tests/api/api-runner.js
```

### Opción B: Ejecución con Newman (CLI de Postman)
Ejecuta todas las aserciones y genera un reporte en consola:
```bash
npx newman run tests/api/laika_postman_collection.json --env-var "BASE_URL=http://localhost:8000"
```

### Opción C: Interfaz Gráfica de Postman
1. Abre Postman.
2. Haz clic en **Import**.
3. Selecciona el archivo `tests/api/laika_postman_collection.json`.
4. Ejecuta la colección con el botón **Run collection**.
