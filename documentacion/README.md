# Documentación Técnica de LAIKA Club

Este directorio contiene la documentación formal sobre la arquitectura, diseño de sistema, decisiones críticas y recomendaciones de mejora para **LAIKA Club**.

---

## Estructura de Documentos

1. **[Arquitectura General](arquitectura-general.md)**  
   Detalla el desglose completo del sistema, la función de cada capa (Cliente, API Gateway, Microservicios) y la justificación de los puertos asignados.
   
2. **[Diagrama de Arquitectura (Mermaid)](diagramas/arquitectura.mmd)**  
   Archivo de definición Mermaid que representa gráficamente el flujo de datos, el Gateway, los 8 microservicios y el mecanismo de persistencia híbrida.

3. **[Decisiones de Arquitectura](decisiones-arquitectura.md)**  
   Justifica decisiones clave de diseño, como el uso del API Gateway centralizado, el mecanismo de fallback relacional (MySQL -> SQLite), la sincronización OLAP (MongoDB Atlas) y la resiliencia en la inicialización de Spark.

4. **[Recomendaciones Arquitectónicas](recomendaciones.md)**  
   Mapea los puntos identificados de deuda técnica (duplicidad de archivos de servicio, acoplamiento en gateway, etc.) y propone acciones concretas para mitigarlos.
