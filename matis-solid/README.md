# MATIS Analytics Dashboard - SolidJS Engine (matis-solid)

Plataforma de inteligencia de negocios, visualizacion analitica y generacion de reportes ejecutivos en PDF de alto rendimiento para LAIKA Club, desarrollada sobre SolidJS.

---

## 1. Descripcion General

`matis-solid` es un modulo analitico reactivo disenado para procesar y renderizar grandes volumenes de metricas de eventos, ventas y comportamiento de usuarios sin la sobrecarga del Virtual DOM tradicional. Mediante la reactividad de grano fino de SolidJS, el dashboard actualiza unicamente los nodos especificos del DOM que experimentan cambios de estado, garantizando una tasa de refresco fluida incluso bajo cargas intensivas de datos.

El sistema incorpora un motor nativo de generacion y descarga de reportes PDF ejecutivos, con tablas de datos estructuradas e instantaneas graficas de alta resolucion.

---

## 2. Stack Tecnologico

- **Nucleo Reactivo**: SolidJS 1.9.14
- **Empaquetador y Servidor**: Vite 8.2.0 con plugin `@vitejs/plugin-solid` 2.11.13
- **Motor de Generacion PDF**: jsPDF 4.2.1
- **Tabulado Automatico en PDF**: jspdf-autotable 5.0.8
- **Captura Grafica de Lienzo**: html2canvas 1.4.1
- **Estilos**: CSS modular y tokens semanticos centralizados

---

## 3. Arquitectura y Comunicacion

- **Puerto Local**: 3040 (configurado en `package.json` mediante `vite --port 3040 --host`)
- **Conexion de Datos**: Consume los servicios analiticos y transaccionales a traves de Pilgrim API Gateway (`http://localhost:8000`)
- **Patron de Reactividad**: Signals y Memos nativos de SolidJS (`createSignal`, `createMemo`, `createResource`), eliminando re-renders en cascada.

```
[ Navegador Web ]
       |
       | HTTP / Localhost:3040
       v
[ matis-solid (SolidJS Dashboard) ]
       |
       | Peticiones HTTP a la API
       v
[ Pilgrim API Gateway (Puerto 8000) ]
       |
       +---> /api/analytics/*       ---> Microservicio Analytics (Java: 8302 / PySpark: 8303)
       +---> /api/events/*          ---> Microservicio Events (Puerto 8201)
       +---> /api/merchandise/*     ---> Microservicio Merchandise (Puerto 8203)
```

---

## 4. Modulos Analiticos y Componentes de Graficas

La aplicacion divide sus capacidades de visualizacion en modulos independientes ubicados en `src/graficas/`:

1. **Grafica de Categorias (`GraficaCategorias`)**:
   - Distribucion porcentual y volumen de ventas segmentado por genero o categoria de espectaculo (Conciertos, Festivales, Teatro, Deportes).

2. **Comparativa Multievento (`GraficaComparacionEventos`)**:
   - Evaluacion simultanea de dos o mas eventos para contrastar curvas de venta, velocidad de colocacion de boletos y margen de ganancia.

3. **Tendencias Temporales (`GraficaTendenciaTemporal`)**:
   - Analisis de series de tiempo para identificar horas pico de compra, patrones semanales y proyecciones de demanda.

4. **Clasificacion de Eventos Top (`GraficaTopEventos`)**:
   - Ranking de eventos de mayor recaudacion, porcentaje de aforo completado e indice de satisfaccion.

5. **Rendimiento de Tienda Oficial (`GraficaVentasTienda`)**:
   - Metricas de conversion de articulos de mercancia, ticket promedio y correlacion entre asistencia a eventos y compra de souvenirs.

6. **Generador Ejecutivo PDF (`matispdf`)**:
   - Generacion de informes impresos directamente desde el navegador, con encabezados corporativos de LAIKA Club, tablas formateadas con `jspdf-autotable` y capturas de graficas mediante `html2canvas`.

---

## 5. Estructura del Proyecto

```
matis-solid/
├── src/
│   ├── estilos/             # Hojas de estilo globales y variables CSS
│   │   └── global.css
│   ├── funciones/           # Logica pura desacoplada
│   │   ├── api.js           # Consultas asincronas al API Gateway
│   │   └── formatters.js    # Formato de moneda (MXN/USD), porcentajes y fechas
│   ├── graficas/            # Componentes analiticos modulares
│   │   ├── GraficaCategorias/
│   │   ├── GraficaComparacionEventos/
│   │   ├── GraficaTendenciaTemporal/
│   │   ├── GraficaTopEventos/
│   │   ├── GraficaVentasTienda/
│   │   └── PlantillasAlternas/
│   ├── matispdf/            # Modulo de exportacion a documentos PDF
│   │   ├── components/      # BotonExportarPDF y dialogos de configuracion
│   │   ├── services/        # pdfGenerator.js (construccion vectorial del PDF)
│   │   └── index.js
│   ├── vista/               # Pantalla orquestadora principal
│   │   └── Dashboard.jsx    # Ensamblado del panel analitico
│   ├── App.jsx              # Componente raiz
│   ├── index.css            # Reset y tipografia
│   └── index.jsx            # Punto de montaje SolidJS
├── package.json
└── vite.config.js
```

---

## 6. Instalacion y Puesta en Marcha

### Prerrequisitos
- Node.js version 18 o superior.
- API Gateway Pilgrim activo en el puerto 8000 para alimentacion de datos en vivo.

### Instalacion de Dependencias
```bash
cd matis-solid
npm install
```

### Ejecucion en Entorno de Desarrollo
```bash
npm run dev
```
El panel estara accesible en `http://localhost:3040`.

### Compilacion de Produccion
```bash
npm run build
```
Genera los archivos estaticos en el directorio `dist/`.

### Previsualizacion de Build
```bash
npm run preview
```
Inicia un servidor local para verificar el comportamiento de los artefactos compilados.
