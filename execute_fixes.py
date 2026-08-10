import os
import re

base_dir = r"c:\Users\redja\Music\entorno laika\PruebaJava\LaikaClub\matis-solid\src\graficas"

# 1. Fix GraficaTopEventos (Truncation & Contrast)
top_eventos_comp = os.path.join(base_dir, "GraficaTopEventos", "componente.jsx")
with open(top_eventos_comp, 'r', encoding='utf-8') as f:
    content = f.read()
    
# Increase padding left
content = re.sub(r'const padding = { top: 20, right: 90, bottom: 35, left: 160 };', 
                 'const padding = { top: 20, right: 90, bottom: 35, left: 200 };', content)
# Increase truncation limit
content = re.sub(r'bar.name.length > 22 \? \`\$\{bar.name.substring\(0, 20\)\}\.\.\.\` : bar.name', 
                 'bar.name.length > 32 ? `${bar.name.substring(0, 30)}...` : bar.name', content)
# Improve contrast of secondary text in annotation
content = re.sub(r'fill="var\(--text-secondary\)" style="font-size: 7px; font-weight: 600;"', 
                 'fill="var(--text-primary)" style="font-size: 7px; font-weight: 600;"', content)

with open(top_eventos_comp, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Fix GraficaVentasTienda (Pie -> Bar Chart)
ventas_tienda_dir = os.path.join(base_dir, "GraficaVentasTienda")

funciones_js = """export function prepareProductData(data, sortBy) {
  if (!data || data.length === 0) return [];
  
  // Sort descending by selected metric first
  const sorted = [...data].sort((a, b) => {
    const valA = sortBy === "revenue" ? (a.total_revenue || 0) : (a.units_sold || 0);
    const valB = sortBy === "revenue" ? (b.total_revenue || 0) : (b.units_sold || 0);
    return valB - valA;
  });
  
  // Take top 10 items instead of 3 + Others
  return sorted.slice(0, 10).map(item => ({
    name: item.name || "Producto",
    value: sortBy === "revenue" ? (item.total_revenue || 0) : (item.units_sold || 0),
    price: item.price || 0,
    units_sold: item.units_sold || 0,
    total_revenue: item.total_revenue || 0
  }));
}

export function calculateBars(preparedData, width, height, padding) {
  if (preparedData.length === 0) return [];
  
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const maxVal = Math.max(...preparedData.map(d => d.value), 1);
  const barHeight = Math.min(24, (chartHeight / preparedData.length) * 0.7);
  
  return preparedData.map((d, index) => {
    const y = padding.top + index * (chartHeight / preparedData.length) + (chartHeight / preparedData.length - barHeight) / 2;
    const barWidth = (d.value / maxVal) * chartWidth;
    
    return {
      name: d.name,
      value: d.value,
      x: padding.left,
      y,
      width: barWidth,
      height: barHeight,
      revenue: d.total_revenue,
      units: d.units_sold,
      price: d.price
    };
  });
}
"""
with open(os.path.join(ventas_tienda_dir, "funciones.js"), 'w', encoding='utf-8') as f:
    f.write(funciones_js)

componente_jsx = """import { For } from "solid-js";
import { formatCurrency, formatInteger } from "../../funciones/formatters";
import "./estilo.css";

export default function Componente(props) {
  const width = 500;
  const height = 300;
  const padding = { top: 20, right: 90, bottom: 35, left: 180 };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style="width: 100%; height: 100%; display: block;">
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="var(--border-color)" stroke-width="1" />
      <text
        transform="rotate(-90)"
        x={-((height - padding.bottom + padding.top) / 2)}
        y={15}
        fill="var(--text-secondary)"
        style="font-size: 9px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        Artículos Vendidos
      </text>

      <For each={props.bars}>
        {(bar, index) => (
          <g>
            <text
              x={padding.left - 10}
              y={bar.y + bar.height / 2 + 4}
              fill="var(--text-primary)"
              style="font-size: 8.5px; font-weight: 700; text-anchor: end; text-transform: uppercase;"
            >
              {bar.name.length > 28 ? `${bar.name.substring(0, 26)}...` : bar.name}
            </text>

            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={index() === 0 ? "var(--color-preattentive, #ff6b00)" : "var(--accent-color, #94a3b8)"}
              onMouseMove={(e) => props.onHover(e, bar.name, props.isRevenue ? bar.revenue : bar.units)}
              onMouseLeave={props.onLeave}
              style="transition: all 0.3s ease; cursor: crosshair;"
            />

            <text
              x={bar.x + bar.width + 8}
              y={bar.y + bar.height / 2 + 4}
              fill="var(--text-primary)"
              style="font-size: 8.5px; font-weight: 800; text-anchor: start;"
            >
              {props.isRevenue ? formatCurrency(bar.revenue) : `${formatInteger(bar.units)} u.`}
            </text>
          </g>
        )}
      </For>
    </svg>
  );
}
"""
with open(os.path.join(ventas_tienda_dir, "componente.jsx"), 'w', encoding='utf-8') as f:
    f.write(componente_jsx)

vista_jsx = """import { createSignal, createResource, createMemo, For, Show } from "solid-js";
import { fetchProductSales } from "../../funciones/api";
import { formatCurrency, formatInteger } from "../../funciones/formatters";
import { prepareProductData, calculateBars } from "./funciones";
import Componente from "./componente";

export default function Vista() {
  const [metric, setMetric] = createSignal("revenue");
  const [data] = createResource(fetchProductSales);
  const [tooltip, setTooltip] = createSignal({ show: false, x: 0, y: 0, name: "", value: "" });

  const handleMouseMove = (e, name, val) => {
    const container = e.currentTarget.closest('.chart-body');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const formatted = metric() === "revenue" ? formatCurrency(val) : `${formatInteger(val)} unidades`;
    setTooltip({
      show: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      name,
      value: formatted
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, name: "", value: "" });
  };

  const prepared = createMemo(() => {
    if (!data()) return [];
    return prepareProductData(data(), metric());
  });

  const bars = createMemo(() => {
    return calculateBars(prepared(), 500, 300, { top: 20, right: 90, bottom: 35, left: 180 });
  });

  const chartTitle = createMemo(() => {
    return metric() === "revenue"
      ? "Ingresos Totales (MXN) por Producto en LaikaShop"
      : "Total de Unidades Vendidas por Producto en LaikaShop";
  });

  const chartSubtitle = createMemo(() => {
    return metric() === "revenue"
      ? "Muestra la repartición del dinero cobrado por la venta de artículos de merchandising"
      : "Muestra la cantidad de piezas de merch entregadas a los clientes según el artículo";
  });

  return (
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">{chartTitle()}</h3>
        <p class="chart-subtitle">{chartSubtitle()}</p>
      </div>

      <div class="chart-controls">
        <div class="filter-group" style="min-width: 160px; flex: none;">
          <label class="filter-label">Métrica Visualizada</label>
          <select 
            class="filter-select" 
            value={metric()} 
            onChange={(e) => setMetric(e.target.value)}
          >
            <option value="revenue">Ingresos Totales (MXN)</option>
            <option value="units">Unidades Vendidas</option>
          </select>
        </div>
      </div>

      <div class="chart-body" style="height: 480px; display: flex; align-items: center; justify-content: center; position: relative;">
        {data.loading ? (
          <div style="font-weight: 700; text-transform: uppercase; font-size: 0.9rem;">
            Analizando inventario y ventas...
          </div>
        ) : (
          <>
            <Componente 
              bars={bars()} 
              isRevenue={metric() === "revenue"}
              onHover={handleMouseMove} 
              onLeave={handleMouseLeave} 
            />
            <Show when={tooltip().show}>
              <div 
                class="chart-tooltip" 
                style={{
                  position: 'absolute',
                  left: `${tooltip().x}px`,
                  top: `${tooltip().y}px`,
                  transform: 'translate(-50%, -100%) translateY(-10px)',
                  'pointer-events': 'none',
                  'background-color': 'var(--bw-black)',
                  color: 'var(--bw-white)',
                  padding: '0.6rem 1rem',
                  'border-radius': '6px',
                  'font-size': '0.75rem',
                  'text-transform': 'uppercase',
                  'font-weight': '700',
                  'z-index': 100,
                  'box-shadow': '0 4px 12px rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  'white-space': 'nowrap',
                  'line-height': '1.4'
                }}
              >
                <div style="color: var(--text-secondary); font-size: 0.7rem;">{tooltip().name}</div>
                <div style="color: var(--color-preattentive, #ff6b00); font-size: 0.85rem; font-weight: 800; margin-top: 2px;">
                  {tooltip().value}
                </div>
              </div>
            </Show>
          </>
        )}
      </div>

      <div class="table-container" style="border-top: 2px solid var(--border-color); padding-top: 1rem; margin-top: 1.5rem;">
        <table class="bw-table">
          <thead>
            <tr>
              <th>Artículo Merch</th>
              <th style="text-align: right;">Precio Unitario</th>
              <th style="text-align: right;">Unidades vendidas</th>
              <th style="text-align: right;">Ingresos Totales (MXN)</th>
            </tr>
          </thead>
          <tbody>
            <For each={prepared()}>
              {(orig) => (
                <tr>
                  <td style="font-weight: 700;">{orig.name}</td>
                  <td style="text-align: right;">{orig.price > 0 ? formatCurrency(orig.price) : "N/A"}</td>
                  <td style="text-align: right;">{formatInteger(orig.units_sold)} </td>
                  <td style="text-align: right; font-weight: 700;">{formatCurrency(orig.total_revenue)}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
}
"""
with open(os.path.join(ventas_tienda_dir, "vista.jsx"), 'w', encoding='utf-8') as f:
    f.write(vista_jsx)

print("Phase 4 fixes applied successfully.")
