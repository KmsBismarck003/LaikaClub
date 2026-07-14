# 🧠 Guía Ejecutiva de Inteligencia Artificial - LaikaClub

Esta guía explica de forma sencilla y directa cómo funcionan los motores de **Machine Learning No Supervisado** que dan vida a LaikaClub. El objetivo de estas herramientas es analizar montañas de datos para ahorrarte horas de trabajo manual y ayudarte a vender más boletos.

---

## 1. Agrupación de Clientes (Algoritmo: *K-Means + PCA*)

* **¿Para qué sirve?** Para descubrir qué tipos de clientes compran en tu plataforma y armar campañas de marketing (correos, anuncios) altamente personalizadas.
* **¿Cómo funciona?** La IA toma a miles de usuarios y los "agrupa" con los que se parecen más entre sí. Para no volverse loca analizando demasiados detalles a la vez, usa una técnica llamada *PCA (Análisis de Componentes Principales)* que resume los datos más importantes, y luego usa *K-Means* para armar los grupos.
* **¿Qué datos trata?** El dinero total gastado, cuántos eventos diferentes visitan, si asisten siempre al mismo género de evento, etc.
* **¿Dónde lo encuentro?** En el **Dashboard de Administración**, pestaña **"Recomendaciones Inteligentes"** seleccionando la opción **"Clasificación de Fans"**.
* **Ejemplo Práctico:** En lugar de mandar un correo de "Promoción de Rock" a 5,000 personas al azar (y aburrirlos), la IA detectará un grupo de "Fans del Rock que gastan más de $2,000". Le envías el correo solo a ellos y tus ventas se disparan.

---

## 2. Buscador de "Negocios Gemelos" (Algoritmo: *Distancia Euclidiana*)

* **¿Para qué sirve?** Para ayudarte a cerrar contratos B2B con dueños de recintos (Venues). Si te fue muy bien con un lugar, la IA te dice qué otros lugares del mundo son idénticos a ese.
* **¿Cómo funciona?** Imagina un mapa. La IA usa una fórmula matemática (Distancia Euclidiana) para medir qué tan "lejos" o "cerca" está un recinto de otro basándose en sus características físicas, no solo en su ubicación geográfica.
* **¿Qué datos trata?** Capacidad máxima de asistentes, metros cuadrados, tipo de recinto (bar, estadio, teatro), y los servicios que ofrece.
* **¿Dónde lo encuentro?** En el módulo de **Prospección B2B** (cuando analizas un recinto específico y pides sugerencias de expansión).
* **Ejemplo Práctico:** Agotaste todas las fechas en el "Foro Sol" (capacidad masiva, al aire libre). La IA usa este algoritmo para decirte: *"El estadio XYZ en Monterrey tiene un 95% de similitud de infraestructura. Deberías llamarlos para firmar un contrato."*

---

## 3. Optimizador Automático de Campañas (Algoritmo: *Método del Codo*)

* **¿Para qué sirve?** Para evitar que tengas que "adivinar" cuántas campañas de marketing diferentes debes crear. La IA te dice exactamente el número ideal.
* **¿Cómo funciona?** El algoritmo simula hacer grupos de clientes (desde 2 hasta 8 grupos) y mide qué tan "apretados" y diferentes son entre sí. Busca el momento exacto donde hacer un grupo más ya no aporta valor (esto hace que la gráfica parezca un brazo doblado, de ahí el nombre "Codo").
* **¿Qué datos trata?** Reutiliza los historiales de compra y comportamiento del módulo de segmentación.
* **¿Dónde lo encuentro?** En el **Dashboard de Administración**, pestaña **"Recomendaciones Inteligentes"** seleccionando **"Optimización de Segmentos"**.
* **Ejemplo Práctico:** Quieres hacer una campaña publicitaria pero no sabes si hacer 2, 5 o 10 anuncios diferentes. Presionas este botón y la IA te responde: *"Te recomiendo crear exactamente 3 grupos de anuncios; si haces 4, gastarás dinero en vano."*

---

## 4. Evaluador de Calidad (Algoritmos: *Silhouette Score & WCSS*)

* **¿Para qué sirve?** Es el "juez" de la Inteligencia artificial. Nos asegura que la segmentación de clientes que hicimos sea confiable y no solo un error de la máquina.
* **¿Cómo funciona?** El *Silhouette Score* califica del 0% al 100% qué tan similares son los usuarios dentro de un mismo grupo y qué tan diferentes son de los demás grupos. 
* **¿Qué datos trata?** Las distancias matemáticas entre cada cliente dentro del sistema.
* **¿Dónde lo encuentro?** Junto a la herramienta de "Clasificación de Fans", aparece humanizado como **"Confiabilidad del Perfil"** o **"Fidelidad"**.
* **Ejemplo Práctico:** La IA te sugiere un perfil de compradores. Si el "Silhouette Score" es del 85%, te está diciendo: *"Estoy súper segura de esto, apuesta dinero aquí"*. Si es del 30%, te dice: *"Tus usuarios son muy raros hoy, no inviertas todavía, espérate a vender más boletos para tener datos más claros"*.

---

## 5. El Armador de Paquetes y Promociones (Algoritmo: *Reglas de Asociación / Market Basket*)

* **¿Para qué sirve?** Para aumentar el ticket promedio de compra (lograr que la gente gaste más dinero en cada transacción) vendiéndoles artículos de mercancía que naturalmente compran juntos.
* **¿Cómo funciona?** Analiza el "Carrito de Compras" de todos los usuarios. Si nota que cuando alguien compra el Producto A, casi siempre también se lleva el Producto B, crea una regla matemática de "Confianza".
* **¿Qué datos trata?** Todo el historial de tickets y compras de la tienda de mercancía (Merchandising).
* **¿Dónde lo encuentro?** En la pantalla principal del Dashboard donde se generan las **Recomendaciones de Ventas**.
* **Ejemplo Práctico:** La IA detecta que el 80% de los fans que compran una "Playera Talla M de Rock" terminan comprando también "2 Cervezas Artesanales". El sistema te recomienda: *"Crea un Combo Playera + 2 Cervezas con un 5% de descuento, tus ventas se multiplicarán"*.

---

## 6. El Policía de Seguridad (Algoritmo: *Isolation Forest / Anti-Bot*)

* **¿Para qué sirve?** Para detectar revendedores (Scalpers), granjas de Bots y compras fraudulentas masivas antes de que arruinen tu evento.
* **¿Cómo funciona?** *Isolation Forest* es como un juego de adivina quién. En lugar de buscar qué clientes son normales, se enfoca en "aislar" a los que son sumamente raros. Si requiere muy pocas preguntas para aislarte del resto de las personas, significa que eres una anomalía (un Bot).
* **¿Qué datos trata?** Velocidad de compra, cuántos boletos compró de golpe, para cuántos eventos distintos, y cuánto dinero gastó en un tiempo récord.
* **¿Dónde lo encuentro?** En el **Dashboard de Administración**, pestaña **"Recomendaciones Inteligentes"**, bajo el modo **"Seguridad Anti-Bot"**.
* **Ejemplo Práctico:** Un humano normal compra 2 a 4 boletos y se tarda unos minutos. De pronto, una cuenta llamada "usuario123" compra 150 boletos para 8 eventos distintos en 3 segundos y gasta $50,000. El *Isolation Forest* enciende una alarma roja en tu panel recomendándote bloquear a ese usuario inmediatamente porque es un bot revendedor.
