# Recomendaciones Arquitectónicas - LAIKA Club

Este documento enumera las recomendaciones prioritarias para mitigar la deuda técnica identificada en el sistema, asegurando que la arquitectura se mantenga escalable, limpia y libre de inconsistencias.

---

## 1. Eliminar Duplicidad de Archivos de Servicio (Frontend)
* **Problema**: Coexistencia de servicios duplicados en `src/services/` con extensiones inconsistentes (ej. `adminService.js` junto a `admin.service.js`, `authService.js` junto a `auth.service.js`).
* **Recomendación**: 
  * Seleccionar un estándar de nomenclatura unificado (preferiblemente camelCase `xxxService.js` ya que es el más común en las importaciones existentes).
  * Consolidar el código de ambos archivos en uno solo, reescribir las referencias rotas en el código y eliminar el archivo duplicado sobrante para evitar fallos de mantenimiento.

---

## 2. Refactorizar el Hotpatch del API Gateway (`gateway.py`)
* **Problema**: El API Gateway conecta directamente a MySQL usando `pymysql` para la ruta `/api/ads/public`, rompiendo el principio de responsabilidad única.
* **Recomendación**:
  * Migrar el endpoint de anuncios al microservicio `admin` (:8005) o crear un microservicio ligero dedicado si crece el módulo de banners.
  * Modificar `gateway.py` para enrutar `/api/ads/public` mediante HTTP/JSON hacia dicho microservicio de manera consistente con el resto de las rutas del sistema.

---

## 3. Reubicar Hooks de Dominio Específico
* **Problema**: Presencia de hooks específicos de negocio (como `useAdminUsers.js`, `useAuth.js`, `useExternalBackup.js`) en la carpeta global `src/hooks/` en lugar de sus respectivas carpetas `features/`.
* **Recomendación**:
  * Mover `useAdminUsers.js` y `useExternalBackup.js` a `src/features/admin/hooks/`.
  * Mover `useAuth.js` y `useUserPermissions.js` a `src/features/auth/hooks/`.
  * Dejar en `src/hooks/` exclusivamente utilidades de comportamiento genéricas y puras (ej. `useDebounce.js`, `useLocalStorage.js`).

---

## 4. Limpieza de Repositorio (Carpeta `tiradero/`)
* **Problema**: La carpeta `tiradero/` acumula archivos obsoletos, copias de seguridad de SQL y scripts de depuración descontinuados.
* **Recomendación**:
  * Añadir `tiradero/` y `backups/` al archivo `.gitignore` para prevenir subidas accidentales de datos pesados o sensibles al control de versiones.
  * Depurar los archivos inservibles y documentar de forma explícita en un `README.md` local el propósito de los scripts de soporte vigentes.

---

## 5. Modularización de Vistas Administrativas
* **Problema**: La carpeta `src/pages/admin/` cuenta con 18 subcarpetas distintas, provocando dispersión visual y duplicación de vistas CRUD.
* **Recomendación**:
  * Agrupar vistas secundarias bajo componentes controladores de paneles compartidos.
  * Implementar componentes de tablas, listados y formularios reutilizables en `src/components/` para reducir la densidad de líneas de código en las páginas del administrador.
