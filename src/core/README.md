# 📁 `src/core/` — Configuración Global del Sistema

## Propósito

La capa `core/` es la **única fuente de verdad** para la configuración global de la aplicación.

Ningún componente, hook o servicio debe hardcodear:
- URLs de la API
- Versiones de la app
- Constantes de roles
- Timeouts o duraciones
- Feature flags

## Archivos

| Archivo | Contenido |
|---|---|
| `config/app.config.js` | Constantes globales: API, auth, UX, paginación, feature flags |
| `config/roles.config.js` | Roles, permisos por módulo, funciones `hasPermission()` y `canAccess()` |

## Cómo Usar

```js
// ✅ Correcto — importar desde core
import { API_CONFIG, ROLES, hasPermission } from '../core'

// ❌ Incorrecto — hardcodear constantes
const url = 'http://localhost:8000/api'
if (user.role === 'admin') { ... }
```

## ❌ Lo que NO va aquí

- Lógica de negocio → `features/` o `hooks/`
- Componentes React → `components/`
- Estado reactivo → `context/`

## Regla

> Si un valor aparece en más de un lugar del código → pertenece a `core/config/`.
