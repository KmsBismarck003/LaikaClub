# Guion de Exposición — LAIKA Club

Guía práctica para presentar sin leer la pantalla. Cada diapositiva muestra solo el ancla visual en tres segundos; tú cuentas la historia de forma natural con tus propias palabras.

## Reglas rápidas antes de hablar
- **No leas las láminas:** la pantalla apoya, tú lideras la conversación.
- **Ritmo sugerido:** 25 a 45 segundos por lámina en explicación, más el tiempo de la demostración en vivo.
- **Conexión entre bloques:** recuerda que el color de cada bloque cambia visualmente para guiar a la audiencia — Ámbar en Gestión, Cian en Producto y Esmeralda en Calidad y Nube.

---

## Apertura

### Lámina 01 — Portada
- **Idea clave:** Presentar la marca y la promesa central en diez segundos.
- **Qué decir:** "Hola a todos. Hoy les presentamos LAIKA Club, una plataforma creada para que cualquier negocio pueda digitalizar sus eventos y vender boletos a costo accesible, mientras sus clientes compran en segundos y sin fricción."
- **Transición:** "Empecemos directo con el problema que estamos resolviendo."

### Lámina 02 — Gancho en 30 segundos
- **Idea clave:** Plantear el dolor real del mercado y el impacto de LAIKA Club desde el arranque.
- **Qué decir:** "Hoy existen dos problemas claros: para muchos negocios, llevar sus eventos a lo digital es caro y complejo; y para quien compra un boleto, muchas boleteras piden demasiado tiempo y demasiadas pantallas. Con LAIKA Club reducimos la compra a tres pasos directos, separamos la operación en seis aplicaciones enfocadas por rol y respaldamos todo con 98 por ciento de aprobación en pruebas y operación continua."
- **Transición:** "Vamos a recorrer esto en tres bloques claros: primero cómo organizamos la gestión, después el producto y su arquitectura, y al final la calidad y la nube."

---

## Bloque 01 — Gestión y Planificación · Láminas 03 a 09

> Este bloque permanece reservado para integrar los datos definitivos de planeación, sprints, tablero y retrospectiva.

- **Lámina 03 — Portadilla Bloque 01:** Introduce cómo se planeó y coordinó el trabajo del equipo.
- **Lámina 04 — Planeación:** Explica el objetivo inicial, quiénes integraron el equipo y la metodología ágil aplicada.
- **Lámina 05 — Cronograma:** Resume cuántos sprints hubo y qué entregó cada ciclo.
- **Lámina 06 — Seguimiento:** Comenta qué herramienta usaron para el backlog, el nivel de cumplimiento y las desviaciones ajustadas.
- **Lámina 07 — Riesgos:** Explica los retos de tiempos o coordinación y cómo se resolvieron.
- **Lámina 08 — Lecciones:** Cierra con lo que mejor funcionó y lo que mejorarían en un siguiente proyecto.
- **Lámina 09 — Galería visual:** Muestra el tablero de tareas y el cronograma como respaldo.

---

## Bloque 02 — Producto y Arquitectura · Láminas 10 a 17

### Lámina 10 — Portadilla Bloque 02
- **Qué decir:** "Ahora entramos al corazón de LAIKA Club: qué resuelve el producto, cómo está construido por dentro y cómo funciona en vivo."

### Lámina 11 — Comparativa 7 pasos frente a 3 pasos
- **Idea clave:** Contrastar la experiencia lenta tradicional frente a la compra directa de LAIKA Club.
- **Qué decir:** "En la parte superior ven lo que suele vivir un comprador: registros largos, filas, demasiadas pantallas y cargos sorpresa que terminan en abandono. En LAIKA Club simplificamos el recorrido a tres momentos claros: eliges el evento, apartas tu asiento con bloqueo inmediato y recibes tu código QR. Así el comprador no pierde tiempo y el negocio vende más sin costos inaccesibles."
- **Transición:** "Veamos con total transparencia qué está operando hoy y cómo se expande la plataforma."

### Lámina 12 — Alcance actual y expansión modular
- **Idea clave:** Mostrar un producto funcional hoy, siendo transparentes sobre la simulación de pagos y las mejoras pendientes.
- **Qué decir:** "Hoy tenemos operativo el flujo completo de compra, pases QR, transferencias, cortesías, cancelaciones, la aplicación móvil, el control de acceso en puerta y la gestión funcional de eventos para organizadores. Respecto a la pasarela de pagos bancaria, por recomendación implementamos la lógica transaccional completa en modo simulación, de modo que solo falta conectar el procesador de pagos que elija cada cliente. También dejamos claro que existen apartados secundarios que se seguirán refinando sin detener el núcleo comercial, y una base inicial para futuros relojes inteligentes."
- **Transición:** "Para lograr que todo esto funcione en armonía, diseñamos una arquitectura limpia que veremos a continuación."

### Lámina 13 — Arquitectura distribuida
- **Idea clave:** Explicar el viaje de una petición desde el cliente hasta la base de datos y de regreso.
- **Qué decir:** "A la izquierda están los seis canales desacoplados: la web pública, los paneles de administrador, gestor, operador, el tablero analítico MATIS y la aplicación móvil LaikaMobil. Ninguno habla directo con los servidores internos; todos pasan por Nginx y entran por **Pilgrim API Gateway** en el puerto 8000. Pilgrim identifica el rol, revisa si puede responder rápido desde caché en memoria y reenvía la petición de forma asíncrona al microservicio dueño de esa función: autenticación, eventos, boletos, mercancía, logros o analítica con Python y PySpark. Cada microservicio consulta su esquema en MySQL 8 o la bóveda en MongoDB y devuelve la respuesta JSON al usuario."
- **Dato de respaldo si preguntan:** "En `laika_tickets` usamos bloqueos concurrentes por asiento con `ReentrantLock`; si dos personas eligen la misma butaca al mismo milisegundo, una completa y la otra recibe conflicto 409, evitando doble cobro y sobreventa."
- **Transición:** "Veamos de cerca por qué separamos los seis clientes de la izquierda."

### Lámina 14 — Seis aplicaciones enfocadas por rol
- **Idea clave:** Desacoplar roles simplifica pantallas, protege permisos y facilita actualizaciones.
- **Qué decir:** "En lugar de meter todo en una sola página gigantesca, dimos a cada persona exactamente lo que necesita: el comprador usa la web pública o LaikaMobil con su bóveda QR offline y biometría; el organizador controla sus eventos desde `laika-gestor`; el personal en puerta valida códigos con `laika-operador`; el administrador gobierna recintos y auditoría en `laika-admin`; y la dirección consulta ingresos y reportes PDF en `matis-solid`."
- **Transición:** "Aquí reservamos un espacio visual para mostrar pantallas y diagramas complementarios."

### Lámina 15 — Galería visual Bloque 02
- **Qué decir:** "En esta lámina integramos las vistas reales del sistema y el modelo de datos para apreciar el detalle visual de cada módulo."

### Lámina 16 — Tecnología con propósito
- **Idea clave:** Justificar el POR QUÉ de cada tecnología, no solo nombrarla.
- **Qué decir:** "No elegimos tecnologías al azar. Usamos React y Expo porque el equipo ya las domina y nos permiten llegar a cualquier teléfono, tablet o computadora con una sola línea visual. En los microservicios de ventas elegimos **Java con Spring Boot** en lugar de Python porque el manejo de boletos exige tipado estático estricto y concurrencia real sin bloqueos globales cuando muchos usuarios compran al mismo tiempo. En cambio, usamos **Python con FastAPI y PySpark** donde más brilla: como puerta de enlace ligera en Pilgrim y para analítica avanzada y detección de bots. Finalmente, MySQL resguarda la integridad transaccional de cada venta y MongoDB almacena instantáneas analíticas."
- **Transición:** "Dejemos la teoría y veamos el sistema trabajando en vivo."

### Lámina 17 — Demostración en vivo
- **Idea clave:** Guiar al público en cuatro pasos claros durante la demo real.
- **Qué decir:** "Vamos a recorrer cuatro momentos reales sobre el entorno desplegado: primero haremos una compra rápida y generaremos el boleto QR; luego veremos ese boleto sincronizado en LaikaMobil; después entraremos al panel de gestor para ver el control de eventos y ventas; y cerraremos validando el código en la terminal de operador para comprobar que impide reutilizar una entrada. También contamos con el video demostrativo como respaldo complementario."
- **Transición:** "Con el sistema visto en acción, pasemos al último bloque para mostrar cómo garantizamos su calidad y operación continua."

---

## Bloque 03 — Confiabilidad, Calidad y Nube · Láminas 18 a 24

### Lámina 18 — Portadilla Bloque 03
- **Qué decir:** "Construir un producto atractivo es solo la mitad; la otra mitad es lograr que resista errores, pruebas y operación diaria en la nube."

### Lámina 19 — Cuatro retos superados
- **Idea clave:** Contar con honestidad los problemas reales enfrentados y cómo se resolvieron con ingeniería.
- **Qué decir:** "En el camino resolvimos cuatro desafíos importantes. Primero, al desacoplar los roles y conectar la app móvil fue complejo hacer que todas las acciones se comunicaran sin fallos; eso nos llevó a crear Pilgrim Gateway como puente único. Segundo, tuvimos conflictos de versiones y cambios que afectaban módulos ya funcionales; lo resolvimos aislando servicios en Docker y metiendo pruebas automáticas. Tercero, corregimos fallos de conexión en bases de datos y direcciones locales heredadas en nube mediante red privada Docker y esquemas separados. Y cuarto, ante restricciones de regiones y límites de recursos y presupuesto en Azure, diseñamos una infraestructura en Terraform capaz de correr las 24 horas con costo mínimo y sin perder velocidad."
- **Transición:** "Todo esto se apoya en prácticas de ingeniería y automatización."

### Lámina 20 — Ingeniería y flujo CI/CD
- **Idea clave:** Demostrar disciplina técnica desde el código hasta la publicación.
- **Qué decir:** "Aplicamos principios SOLID y arquitectura limpia para mantener el código modular. Nuestro repositorio en GitHub registra más de 155 commits trazables en ramas separadas y cuenta con pipelines automáticos: cada integración ejecuta 60 pruebas unitarias y compila los microservicios en Java 17; cuando todo aprueba, el flujo de despliegue actualiza el servidor en Azure por SSH y verifica la salud del gateway automáticamente."
- **Transición:** "Veamos los números reales que arrojó nuestro ciclo de pruebas."

### Lámina 21 — Calidad comprobada
- **Idea clave:** Respaldar la estabilidad con cifras concretas y transparencia sobre pendientes menores.
- **Qué decir:** "Ejecutamos 354 escenarios reales cubriendo todos los roles, alcanzando un **98 por ciento de aprobación**, con 100 por ciento en flujos avanzados, 60 de 60 pruebas en CI y pruebas de estrés de 200 usuarios compitiendo por un mismo asiento sin generar sobreventa. Los defectos críticos de compra, sesiones móviles y concurrencia quedaron corregidos. Solo restan siete ajustes menores en validaciones internas de permisos y rutas secundarias que no afectan la venta ni el acceso y ya están documentados."
- **Transición:** "¿Dónde corre todo esto en producción? Veamos la nube."

### Lámina 22 — Diagrama completo de infraestructura híbrida en Azure
- **Idea clave:** Explicar de izquierda a derecha cómo conviven Vercel, LaikaMobil y GitHub Actions con el núcleo en Microsoft Azure.
- **Qué decir:** "Aquí vemos el mapa completo de cómo convive todo en producción. A la izquierda están los frontends web servidos con alta velocidad desde **Vercel CDN**, nuestra aplicación móvil **LaikaMobil** orientada a Google Play Store y el flujo de **GitHub Actions** para despliegues. Todas las peticiones viajan cifradas por HTTPS hacia nuestra nube en **Microsoft Azure**, donde un firewall NSG filtra únicamente puertos 80, 443 y 22. Dentro de nuestra máquina virtual Ubuntu ARM64, **Nginx** gestiona TLS y compresión y pasa todo el tráfico de API hacia **Pilgrim Gateway** en el puerto 8000 dentro de la red privada Docker `laika_network`. Desde ahí Pilgrim coordina los 8 microservicios Java, el motor Big Data en Python y MySQL 8, conectándose además hacia **MongoDB Atlas** para analítica y **SMTP** para correos."
- **Transición:** "Veamos en la siguiente lámina los detalles operativos, de seguridad y de costos detrás de esta nube."

### Lámina 23 — Detalles técnicos de servicios, redes, seguridad y FinOps
- **Idea clave:** Justificar decisiones de red, memoria JVM, monitoreo y control presupuestal en Azure.
- **Qué decir:** "Toda esta infraestructura se aprovisiona como código con Terraform en el grupo `rg-laikaclub`, con red privada `10.0.0.0/16`, subred dedicada, IP estática y llaves RSA de 4096 bits. Para alojar 11 contenedores en un solo servidor eficiente de 2 vCPU y 8 GB de RAM sin saturar memoria, agregamos 8 GB de swap en el arranque con `cloud-init` y optimizamos cada microservicio Java a 150 MB con `SerialGC` e hilos virtuales. Todo se actualiza automáticamente con `deploy_remote.sh`, cuenta con reinicio automático, monitoreo en `/api/health` y alertas FinOps al 80 y 95 por ciento para mantener el gasto cerca de 30 dólares mensuales."
- **Transición:** "Aquí reservamos espacio para las capturas directas del portal de Azure y el tablero de calidad."

### Lámina 24 — Galería técnica Bloque 03
- **Qué decir:** "En este espacio presentamos las evidencias visuales del despliegue en la nube, los pipelines en verde y nuestro tablero de pruebas."

### Lámina 25 — Hoja de ruta y evolución
- **Idea clave:** Mostrar madurez técnica y visión clara de crecimiento.
- **Qué decir:** "Con el núcleo comercial funcionando, tenemos claros los tres siguientes pasos de evolución: primero, hacer aún más ágiles e interactivos los módulos de comprador y gestor; segundo, cerrar la deuda técnica conectando una pasarela de pagos real, concluyendo funciones secundarias en espera y ampliando pruebas nativas en los microservicios Java restantes; y tercero, evolucionar hacia una arquitectura más ordenada con base de datos administrada y múltiples nodos para alta disponibilidad."
- **Transición:** "Para cerrar, les comparto cómo pasar de esta presentación a la acción."

---

## Cierre

### Lámina 26 — Cierre accionable
- **Idea clave:** Terminar con una invitación clara y tres pasos concretos, nunca con una despedida vacía.
- **Qué decir:** "LAIKA Club ya demuestra que es posible ofrecer compra rápida, control accesible y tecnología confiable sin costos desproporcionados. El camino para adoptarlo es simple: hacer una prueba guiada con tu equipo, adaptar tus recintos y pasarela bancaria preferida, y lanzar tu primer evento en la nube. Quedamos abiertos a sus preguntas y a explorar cualquier módulo en detalle."

