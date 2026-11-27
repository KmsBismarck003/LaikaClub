# MATIS Analytics Dashboard - SolidJS Engine (matis-solid)

Dashboard de inteligencia de negocios, visualizacion analitica y exportacion de reportes PDF para LAIKA Club, desarrollado con SolidJS y Vite.

---

## 1. Descripcion General

`matis-solid` consume la sub-API MATIS del microservicio `analytics_bigdata` (via Pilgrim API Gateway en el puerto `8000` o mediante fallback directo) para presentar KPIs ejecutivos, desempeno por categoria, comparativa de eventos, tendencia temporal, eventos de mayor recaudacion y ventas de tienda oficial, con exportacion a PDF desde el navegador.

---

## 2. Stack Tecnologico

Versiones exactas declaradas en `matis-solid/package.json`:

- **Framework Reactivo**: `solid-js` `^1.9.14`
- **Empaquetador y Servidor**: `vite` `^8.2.0`, `vite-plugin-solid` `^2.11.13`
- **Generacion de PDF**: `jspdf` `^4.2.1`
- **Tablas en PDF**: `jspdf-autotable` `^5.0.8`
- **Captura de Lienzo / Graficas**: `html2canvas` `^1.4.1`

---

## 3. Arquitectura y Comunicacion con el Backend

- **Puerto Local**: `3040` (`vite --port 3040 --host`).
- **Servicio Docker**: Declarado en `docker-compose.yml` como `laika_matis` (puerto `3040:3040`).
- **Resolucion de Endpoints (`src/funciones/api.js`)**: Intenta conectar en orden a las siguientes bases hasta obtener respuesta satisfactoria:
  1. `http://localhost:8000/api/analytics/matis` (Pilgrim API Gateway)
  2. `http://localhost:8303/api/analytics/matis` (servicio `analytics_bigdata` directo)
  3. `http://localhost:8009/api/analytics/matis`
  4. `http://localhost:8007/api/analytics/matis`

Endpoints consumidos en `src/funciones/api.js`:
- `/executive/kpis`
- `/executive/category-performance`
- `/executive/sales-trend`
- `/events/top-revenue`
- `/products/sales`
- (y demas endpoints de comparativa/detalles provistos por `microservices/analytics_bigdata/matis/`)

---

## 4. Modulos Graficos y Exportacion PDF

Cada grafica en `src/graficas/` separa su implementacion en `componente.jsx`, `vista.jsx`, `funciones.js` y `estilo.css`:

1. `GraficaCategorias`: Rendimiento y ventas segmentadas por categoria.
2. `GraficaComparacionEventos`: Comparativa entre eventos seleccionados.
3. `GraficaTendenciaTemporal`: Evolucion temporal de ventas.
4. `GraficaTopEventos`: Clasificacion de eventos con mayores ingresos.
5. `GraficaVentasTienda`: Metricas de ventas de articulos de mercancia.
6. `PlantillasAlternas/MotorGraficoEmergencia.jsx`: Motor grafico de respaldo.
7. `matispdf/`: Modulo de exportacion compuesto por `components/BotonExportarPDF.jsx`, `services/pdfGenerator.js` e `index.js`.

---

## 5. Estructura del Proyecto

```text
matis-solid/
├── src/
│   ├── estilos/
│   │   └── global.css
│   ├── funciones/
│   │   ├── api.js
│   │   └── formatters.js
│   ├── graficas/
│   │   ├── GraficaCategorias/
│   │   ├── GraficaComparacionEventos/
│   │   ├── GraficaTendenciaTemporal/
│   │   ├── GraficaTopEventos/
│   │   ├── GraficaVentasTienda/
│   │   └── PlantillasAlternas/
│   ├── matispdf/
│   │   ├── components/BotonExportarPDF.jsx
│   │   ├── services/pdfGenerator.js
│   │   └── index.js
│   ├── vista/
│   │   └── Dashboard.jsx
│   ├── App.jsx
│   ├── index.css
│   └── index.jsx
├── Dockerfile
├── package.json
└── vite.config.js
```

---

## 6. Instalacion y Ejecucion

### Prerrequisitos
- Node.js 18 o superior.
- Pilgrim API Gateway activo en el puerto `8000` (o `analytics_bigdata` en el puerto `8303`).

### Comandos Disponibles (`package.json`)
```bash
cd matis-solid
npm install

# Servidor de desarrollo en http://localhost:3040
npm run dev

# Compilacion de produccion (salida en dist/)
npm run build

# Previsualizacion del build
npm run preview
```

### Ejecucion con Docker Compose
Desde la raiz de `LaikaClub`:
```bash
docker compose up -d matis
```
