# Pruebas de Rendimiento, Carga y Concurrencia (JMeter & Stress)

Este directorio contiene los planes de prueba de estrés y simuladores de concurrencia para certificar la capacidad de respuesta y la resiliencia del sistema LAIKA Club ante picos de demanda y prevenir condiciones de carrera (Race Conditions) como la doble compra de un mismo boleto o asiento.

## Herramientas Utilizadas
- **Apache JMeter 5.0+**: Herramienta estándar de la industria para pruebas de carga HTTP masivas.
- **Node.js**: Simulador nativo de alta concurrencia para auditoría inmediata de race conditions.

## Escenarios de Rendimiento y Estrés
1. **Prevención de Doble Compra (Race Condition)**:
   - Simulación de 30 a 50 usuarios virtuales intentando apartar y pagar exactamente el mismo asiento en el mismo milisegundo.
   - Garantía de que solo un usuario logra concretar la compra y el resto recibe rechazo controlado.
2. **Validación Masiva en Puerta (Torniquetes)**:
   - Simulación de 50 hilos concurrentes enviando peticiones a `POST /tickets/verify` y `POST /tickets/redeem`.
   - Medición de tiempos de respuesta (latencia menor a 200ms por boleto).

## Cómo Ejecutar

### Opción A: Simulador de Concurrencia Rápido (En Terminal)
Ejecuta la simulación de colisión de compras sin dependencias externas:
```bash
node tests/performance/simulate_concurrency_stress.js
```

### Opción B: Ejecución de Plan Apache JMeter
1. **Modo Gráfico**:
   - Abre Apache JMeter.
   - Menú **File** > **Open** > Selecciona `ticket_validation_load_test.jmx`.
   - Presiona el botón verde **Start** (Play) para ver métricas y gráficos en tiempo real.
2. **Modo Línea de Comandos (Headless / CI/CD)**:
   ```bash
   jmeter -n -t tests/performance/ticket_validation_load_test.jmx -l tests/performance/resultados.jtl -e -o tests/performance/reporte_html
   ```
