# 📁 `src/features/` — Módulos de Dominio

## Propósito

Esta carpeta contiene **módulos de dominio funcional** (feature modules). Cada módulo agrupa **todo lo relacionado con un área de negocio específica**: sus hooks, componentes internos, y servicios.

## Regla Fundamental

> **Un feature = un dominio = una carpeta.**
> Si agregas funcionalidad nueva, primero pregunta: ¿a qué feature pertenece?

## Estructura de Cada Feature

```
features/<nombre>/
├── components/     ← UI exclusiva del dominio
│   └── <ComponentName>/
│       ├── ComponentName.jsx
│       ├── ComponentName.css
│       └── index.js
├── hooks/          ← Lógica de estado del dominio
│   └── use<DomainLogic>.js
└── index.js        ← Barrel: qué exporta este feature (interfaz pública)
```

## Features Actuales

| Feature | Dominio | Hooks Disponibles |
|---|---|---|
| `auth/` | Autenticación y sesión | `useLoginForm` |
| `events/` | Catálogo y detalle de eventos | `useEvents`, `useEventDetail` |
| `user/` | Perfil y funciones de usuario | `useAchievements`, `useRefunds` |
| `admin/` | Panel de administración | `useAdminDashboard`, `useAdminUsers` |
| `manager/` | Gestión de eventos del gestor | `useManagerEvents` |
| `staff/` | Operaciones del personal | `useTicketValidation` |

## ❌ Lo que NO va aquí

- Componentes UI reutilizables en múltiples dominios → `components/`
- Hooks genéricos (useFetch, useForm, useDebounce) → `hooks/`
- Llamadas directas a API → `services/`
- Configuración global → `core/config/`

## ✅ Cómo agregar un nuevo Feature

```bash
mkdir src/features/pagos
mkdir src/features/pagos/hooks
mkdir src/features/pagos/components
touch src/features/pagos/index.js
touch src/features/pagos/hooks/usePagos.js
```

Luego añadir la exportación en `features/index.js`:
```js
export * from './pagos'
```
