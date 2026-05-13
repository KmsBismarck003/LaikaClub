# 📐 ARQUITECTURA FRONTEND — LAIKA CLUB

> Documento de referencia para el equipo. Actualizar al modificar la estructura.
> **Versión:** 2.1 | **Última actualización:** 2026-04-23

---

## 🗺️ MAPA DE CAPAS

```
src/
├── core/           → Configuración global (app.config, roles.config)
├── context/        → React Providers (estado global de la app)
├── components/     → Átomos y moléculas UI puras (sin lógica de dominio)
├── features/       → Módulos por dominio funcional (auth, events, admin…)
├── layouts/        → Estructuras visuales globales (Main, Dashboard, Auth)
├── pages/          → Vistas delgadas que ensamblan features
├── hooks/          → Hooks UNIVERSALES (reutilizables entre dominios)
├── services/       → Capa HTTP (apiClient + servicios por dominio)
├── routes/         → Configuración centralizada de rutas
├── utils/          → Helpers puros sin dependencias React
└── styles/         → Variables CSS, globals, animaciones, tema
```

---

## ✅ REGLA DE UBICACIÓN (preguntas para decidir)

| Pregunta | Destino |
|---------|---------|
| ¿Es un átomo UI sin estado de dominio? (Button, Card, Input) | `components/` |
| ¿Es lógica reutilizable entre MÚLTIPLES dominios? | `hooks/` |
| ¿Es lógica específica de UN dominio (admin, events...)? | `features/<dominio>/hooks/` |
| ¿Es un componente visual ligado a UN dominio? | `features/<dominio>/components/` |
| ¿Son datos/constantes de un dominio? | `features/<dominio>/constants/` |
| ¿Es configuración global de la app? | `core/config/` |
| ¿Es una llamada HTTP? | `services/<dominio>.service.js` |
| ¿Es una vista principal? | `pages/` |
| ¿Es la estructura visual de múltiples páginas? | `layouts/` |
| ¿Es un helper sin dependencias React? | `utils/` |

---

## 🚫 PROHIBIDO (evita estos errores comunes)

1. **`fetch()` directo en componentes** → Usar servicios de `services/`
2. **Lógica de negocio en páginas** → Páginas son thin wrappers, lógica en hooks
3. **Componentes de dominio en `components/`** → Van en `features/<dominio>/components/`
4. **URLs de API hardcodeadas** → Usar `API_CONFIG` de `core/config/app.config.js`
5. **Magic strings** → Usar constantes de `utils/constants.js` o `features/<dominio>/constants/`
6. **Duplicar hooks** → Si existe en `features/`, re-exportar desde `hooks/` solo para compat
7. **Estado local en layouts** → Si es lógica de dominio, extraer a un hook

---

## 📦 ESTRUCTURA DE UN FEATURE

Cada feature en `features/` sigue esta estructura:

```
features/<dominio>/
├── components/         ← Componentes visuales del dominio
│   └── MiModal.jsx
├── hooks/              ← Lógica encapsulada del dominio
│   └── useMiLogica.js
├── constants/          ← Datos estáticos y configuración del dominio
│   └── misDatos.js
└── index.js            ← Barrel: re-exporta todo lo del feature
```

**Regla:** El código fuera del feature SOLO puede importar desde `features/<dominio>/index.js` (el barrel), nunca desde subcarpetas directamente.

---

## 🔗 ORDEN DE IMPORTS (convención)

```js
// 1. React y librerías externas
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. Configuración global
import { API_CONFIG, ROLES } from '../core/config/app.config'

// 3. Contextos y providers
import { useAuth } from '../context'

// 4. Features (hooks y constantes de dominio)
import { useAdminUsers, useSidebar } from '../features/admin'

// 5. Hooks universales
import { useDebounce, usePagination } from '../hooks'

// 6. Componentes UI
import { Button, Card, Modal } from '../components'

// 7. Servicios (solo si el componente llama directamente — evitar)
import { eventAPI } from '../services'

// 8. Utils
import { formatDate } from '../utils'

// 9. Estilos locales
import './MiComponente.css'
```

---

## 🧩 SISTEMA UX GLOBAL

El `UXContext` controla globalmente:
- **Animaciones** → `animationsEnabled`, `toggleAnimations()`
- **Densidad de UI** → `density`, `setDensity('compact'|'comfortable'|'spacious')`
- **Sidebar** → `sidebarCollapsed`, `toggleSidebar()`
- **Motion reducido** → `reducedMotion` (respeta OS preference)

**CSS Variables automáticas:**
```css
--animation-duration-factor: 1 | 0
--transition-duration-factor: 1 | 0
[data-animations="on|off"]
[data-density="comfortable|compact|spacious"]
```

**Uso en cualquier componente:**
```js
const { animationsEnabled, toggleAnimations, density } = useUX()
```

---

## ⚙️ SERVICIOS API

Toda comunicación HTTP pasa por `services/`:

```
services/
├── apiClient.js     ← Clase ApiClient (OOP): GET, POST, PUT, PATCH, DELETE, upload
├── auth.service.js  ← authAPI
├── user.service.js  ← userAPI
├── event.service.js ← eventAPI
├── admin.service.js ← adminUsersAPI, databaseAPI, monitoringAPI, logsAPI…
├── merch.service.js ← merchService
└── index.js         ← Barrel oficial (importar siempre desde aquí)
```

**Importar servicios:**
```js
import { authAPI, eventAPI, adminUsersAPI } from '../services'
// o el objeto consolidado:
import api from '../services'
```

---

## 🔐 SISTEMA DE ROLES

Roles definidos en `core/config/app.config.js`:
```js
ROLES = { ADMIN: 'admin', GESTOR: 'gestor', OPERADOR: 'operador', USUARIO: 'usuario' }
```

Control de acceso con `ProtectedRoute`:
```jsx
<ProtectedRoute allowedRoles={['admin', 'gestor']}>
  <MiPaginaProtegida />
</ProtectedRoute>
```

---

## 📌 FEATURES EXISTENTES

| Feature | Dominio | Hooks | Constants |
|---------|---------|-------|-----------|
| `auth` | Autenticación | `useLoginForm` | — |
| `events` | Eventos | `useEvents`, `useEventDetail` | — |
| `admin` | Administración | `useAdminDashboard`, `useAdminUsers`, `useSidebar` | `sidebarSections` |
| `manager` | Gestión de eventos | — | — |
| `staff` | Operaciones | — | — |
| `user` | Usuario final | — | — |
