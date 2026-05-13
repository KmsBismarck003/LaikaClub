from __future__ import annotations
import copy, os, shutil, zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree as ET

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
XML_NS = "http://www.w3.org/XML/1998/namespace"
ET.register_namespace("w", W_NS)

def w_tag(name: str) -> str:
    return f"{{{W_NS}}}{name}"

@dataclass
class Block:
    kind: str
    text: str = ""
    lines: list[str] | None = None

def read_snippet(path: Path, start: int, end: int) -> list[str]:
    lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    return [lines[i].rstrip() for i in range(start - 1, min(end, len(lines)))]

def append_run(paragraph: ET.Element, text: str, font: str = "Arial", size_half_points: int = 24, bold: bool = False) -> None:
    run = ET.SubElement(paragraph, w_tag("r"))
    rpr = ET.SubElement(run, w_tag("rPr"))
    fonts = ET.SubElement(rpr, w_tag("rFonts"))
    fonts.set(w_tag("ascii"), font); fonts.set(w_tag("hAnsi"), font); fonts.set(w_tag("cs"), font)
    sz = ET.SubElement(rpr, w_tag("sz")); sz.set(w_tag("val"), str(size_half_points))
    sz_cs = ET.SubElement(rpr, w_tag("szCs")); sz_cs.set(w_tag("val"), str(size_half_points))
    if bold:
        ET.SubElement(rpr, w_tag("b"))
    text_el = ET.SubElement(run, w_tag("t"))
    if text.startswith(" ") or text.endswith(" ") or "  " in text:
        text_el.set(f"{{{XML_NS}}}space", "preserve")
    text_el.text = text

def make_paragraph(text: str = "", style: str | None = None, align: str = "both", font: str = "Arial", size_half_points: int = 24, bold: bool = False) -> ET.Element:
    p = ET.Element(w_tag("p"))
    ppr = ET.SubElement(p, w_tag("pPr"))
    if style:
        pstyle = ET.SubElement(ppr, w_tag("pStyle")); pstyle.set(w_tag("val"), style)
    jc = ET.SubElement(ppr, w_tag("jc")); jc.set(w_tag("val"), align)
    spacing = ET.SubElement(ppr, w_tag("spacing"))
    spacing.set(w_tag("after"), "120"); spacing.set(w_tag("line"), "360"); spacing.set(w_tag("lineRule"), "auto")
    if text:
        append_run(p, text, font=font, size_half_points=size_half_points, bold=bold)
    return p

def make_page_break() -> ET.Element:
    p = ET.Element(w_tag("p")); r = ET.SubElement(p, w_tag("r")); br = ET.SubElement(r, w_tag("br")); br.set(w_tag("type"), "page"); return p

def make_code_paragraph(line: str) -> ET.Element:
    return make_paragraph(line if line else " ", style="HTMLconformatoprevio", align="left", font="Consolas", size_half_points=18)

def set_style_font(style: ET.Element, font: str, size_half_points: int, bold: bool | None = None, align: str | None = None) -> None:
    ppr = style.find(w_tag("pPr")) or ET.SubElement(style, w_tag("pPr"))
    if align:
        jc = ppr.find(w_tag("jc")) or ET.SubElement(ppr, w_tag("jc")); jc.set(w_tag("val"), align)
    spacing = ppr.find(w_tag("spacing")) or ET.SubElement(ppr, w_tag("spacing"))
    spacing.set(w_tag("after"), "120"); spacing.set(w_tag("line"), "360"); spacing.set(w_tag("lineRule"), "auto")
    rpr = style.find(w_tag("rPr")) or ET.SubElement(style, w_tag("rPr"))
    fonts = rpr.find(w_tag("rFonts")) or ET.SubElement(rpr, w_tag("rFonts"))
    fonts.set(w_tag("ascii"), font); fonts.set(w_tag("hAnsi"), font); fonts.set(w_tag("cs"), font)
    sz = rpr.find(w_tag("sz")) or ET.SubElement(rpr, w_tag("sz")); sz.set(w_tag("val"), str(size_half_points))
    szcs = rpr.find(w_tag("szCs")) or ET.SubElement(rpr, w_tag("szCs")); szcs.set(w_tag("val"), str(size_half_points))
    if bold is True and rpr.find(w_tag("b")) is None:
        ET.SubElement(rpr, w_tag("b"))

def update_styles_xml(styles_xml: bytes) -> bytes:
    root = ET.fromstring(styles_xml)
    doc_defaults = root.find(w_tag("docDefaults")) or ET.SubElement(root, w_tag("docDefaults"))
    rpr_default = doc_defaults.find(w_tag("rPrDefault")) or ET.SubElement(doc_defaults, w_tag("rPrDefault"))
    rpr = rpr_default.find(w_tag("rPr")) or ET.SubElement(rpr_default, w_tag("rPr"))
    fonts = rpr.find(w_tag("rFonts")) or ET.SubElement(rpr, w_tag("rFonts"))
    fonts.set(w_tag("ascii"), "Arial"); fonts.set(w_tag("hAnsi"), "Arial"); fonts.set(w_tag("cs"), "Arial")
    sz = rpr.find(w_tag("sz")) or ET.SubElement(rpr, w_tag("sz")); sz.set(w_tag("val"), "24")
    szcs = rpr.find(w_tag("szCs")) or ET.SubElement(rpr, w_tag("szCs")); szcs.set(w_tag("val"), "24")
    ppr_default = doc_defaults.find(w_tag("pPrDefault")) or ET.SubElement(doc_defaults, w_tag("pPrDefault"))
    ppr = ppr_default.find(w_tag("pPr")) or ET.SubElement(ppr_default, w_tag("pPr"))
    jc = ppr.find(w_tag("jc")) or ET.SubElement(ppr, w_tag("jc")); jc.set(w_tag("val"), "both")
    style_map = {style.get(w_tag("styleId")): style for style in root.findall(w_tag("style"))}
    for sid, font, size, bold, align in [
        ("Normal", "Arial", 24, False, "both"),
        ("msonormal0", "Arial", 24, False, "both"),
        ("Ttulo1", "Arial", 32, True, "left"),
        ("Ttulo2", "Arial", 28, True, "left"),
        ("Ttulo3", "Arial", 24, True, "left"),
        ("HTMLconformatoprevio", "Consolas", 18, False, "left"),
    ]:
        if sid in style_map:
            set_style_font(style_map[sid], font, size, bold=bold, align=align)
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)

def render_blocks(blocks: Iterable[Block]) -> list[ET.Element]:
    rendered: list[ET.Element] = []
    for block in blocks:
        if block.kind == "page_break":
            rendered.append(make_page_break())
        elif block.kind == "title":
            rendered.append(make_paragraph(block.text, style="Ttulo1", align="left", font="Arial", size_half_points=32, bold=True))
        elif block.kind == "subtitle":
            rendered.append(make_paragraph(block.text, style="Ttulo2", align="left", font="Arial", size_half_points=28, bold=True))
        elif block.kind == "h1":
            rendered.append(make_paragraph(block.text, style="Ttulo1", align="left", font="Arial", size_half_points=30, bold=True))
        elif block.kind == "h2":
            rendered.append(make_paragraph(block.text, style="Ttulo2", align="left", font="Arial", size_half_points=26, bold=True))
        elif block.kind == "h3":
            rendered.append(make_paragraph(block.text, style="Ttulo3", align="left", font="Arial", size_half_points=24, bold=True))
        elif block.kind == "code":
            for line in block.lines or []:
                rendered.append(make_code_paragraph(line))
            rendered.append(make_paragraph("", align="both"))
        else:
            rendered.append(make_paragraph(block.text, style="Normal", align="both", font="Arial", size_half_points=24))
    return rendered

def add_paragraphs(blocks: list[Block], paragraphs: list[str]) -> None:
    for paragraph in paragraphs:
        blocks.append(Block("p", paragraph))

def build_blocks(project_root: Path) -> list[Block]:
    gateway_snippet = read_snippet(project_root / "microservices" / "gateway.py", 20, 60)
    auth_snippet = read_snippet(project_root / "microservices" / "auth" / "security.py", 19, 58)
    ticket_snippet = read_snippet(project_root / "microservices" / "tickets" / "controller.py", 45, 120)
    mongo_snippet = read_snippet(project_root / "microservices" / "common" / "mongodb_sync.py", 14, 40)
    launcher_snippet = read_snippet(project_root / "run_microservices.py", 100, 153)
    admin_backup_snippet = read_snippet(project_root / "microservices" / "admin" / "main.py", 94, 173)
    app_snippet = read_snippet(project_root / "src" / "App.jsx", 1, 130)
    api_client_snippet = read_snippet(project_root / "src" / "services" / "apiClient.js", 1, 98)
    auth_context_snippet = read_snippet(project_root / "src" / "context" / "AuthContext.jsx", 1, 140)
    cart_context_snippet = read_snippet(project_root / "src" / "context" / "CartContext.jsx", 1, 170)
    checkout_snippet = read_snippet(project_root / "src" / "pages" / "Checkout" / "Checkout.jsx", 1, 87)
    event_detail_snippet = read_snippet(project_root / "src" / "pages" / "EventDetail" / "EventDetail.jsx", 1, 110)
    admin_dashboard_snippet = read_snippet(project_root / "src" / "pages" / "admin" / "Dashboard" / "Dashboard.jsx", 1, 149)

    frontend_modules = {
        "Aplicación principal y ruteo": "El archivo App.jsx es el corazón de la composición visual. Carga proveedores de contexto, maneja la pantalla de carga inicial, decide layouts, protege rutas por rol y articula una experiencia continua entre módulos públicos, privados y administrativos.",
        "Rutas públicas": "El sistema publica páginas informativas, autenticación, home, detalle de evento, tienda, carrito y checkout. Esto permite que un usuario todavía no autenticado pueda descubrir eventos, agregar productos y preparar una compra antes de completar login o registro.",
        "Rutas de usuario": "El espacio /user concentra dashboard personal, billetera, historial, perfil, logros y seguimiento de reembolsos. Esta estructura separa la experiencia del comprador final del espacio administrativo y evita mezclar responsabilidades en una sola navegación.",
        "Rutas de gestor": "El gestor administra eventos, analytics, transacciones, asistentes y mercancía. El código utiliza rutas protegidas y layouts específicos para que la navegación del organizador tenga foco operacional y no herede ruido de la experiencia del cliente final.",
        "Rutas de staff": "El personal operativo dispone de terminales para verificación, historial e incidentes. Esta capa es fundamental porque traduce la lógica transaccional del ticket a una operación de acceso física en el venue.",
        "Rutas de administración": "El administrador tiene acceso a dashboard, usuarios, eventos, configuración, base de datos, monitoreo, anuncios, CMS, reportes, auditoría, venues, constructor de boletos, radar y merchandising. La amplitud de esta sección convierte al frontend en un centro de control y no solo en una fachada de venta.",
        "Layouts": "MainLayout, AuthLayout y DashboardLayout reducen duplicidad de encabezados, sidebars, patrones de navegación y wrappers visuales. En una base tan grande, esa separación es clave para mantener coherencia visual y disciplina técnica.",
        "Contextos": "Los contextos de autenticación, carrito, favoritos, notificaciones, tema, sistema y skeleton comparten estado transversal. Esto reduce prop drilling y vuelve más estable la comunicación entre páginas distantes del árbol de React.",
        "Servicios JS": "El frontend encapsula acceso HTTP en apiClient, servicios de dominio y un bridge retrocompatible en api.js. Con ello, la aplicación puede evolucionar en arquitectura sin romper imports heredados distribuidos por componentes antiguos.",
        "Checkout": "El checkout se organiza como flujo por pasos con componentes especializados para identidad, envío, pago y confirmación. Esta modularidad vuelve más mantenible un flujo que mezcla datos del usuario, totalización, medios de pago y visualización final.",
        "Detalle de evento": "La página EventDetail es uno de los nodos más complejos del sistema. Integra datos del evento, mapa de venue, motor de tickets, Lucky Seat, mercancía, modales, sincronización de asientos ocupados y compra directa."
    }

    backend_services = {
        "API Gateway": "Centraliza el enrutamiento HTTP y se comporta como fachada del sistema. Filtra headers, construye URLs destino, maneja errores de proxy y añade cache temporal para recursos públicos como anuncios y catálogos de eventos visibles al visitante.",
        "Auth Service": "Gestiona identidad, login clásico, login social, verificación de sesión, refresco de token, recuperación de contraseña, gestión de avatares, auditoría y administración de usuarios. Desde el punto de vista del dominio es la autoridad principal de identidad y permisos.",
        "Event Service": "Administra el catálogo de eventos, vistas públicas, vistas por gestor, detalle individual y atributos del recinto. Es responsable de sostener la información de negocio que el cliente consume para descubrir y seleccionar experiencias.",
        "Ticket Service": "Controla la compra, verificación, canje, refunds, pagos, asientos ocupados y Lucky Seat. Es uno de los servicios más sensibles porque toca consistencia, experiencia económica y operación presencial.",
        "Stats Service": "Concentra tableros rápidos y métricas de administración. Sirve como fuente agregada para visualizar estado general sin obligar al frontend a consultar múltiples servicios por separado.",
        "Admin Service": "Expone respaldos, exportaciones, gestión de anuncios, archivos y estadísticas de base de datos. También funciona como caja de herramientas administrativas para contingencia y soporte técnico.",
        "Achievements Service": "Aísla la gamificación y evita acoplarla a la ruta crítica de compra. Esta decisión ayuda a que un fallo en logros o cupones no derribe la venta de tickets.",
        "Analytics Big Data": "Agrupa endpoints analíticos, inteligencia, limpieza, predicción, anomalías y sincronización de snapshots. Se trata del plano más exploratorio y de explotación de datos del ecosistema.",
        "Merchandise Service": "Extiende el modelo de negocio hacia mercancía ligada a eventos y managers. Su presencia confirma que la plataforma ya no es solo un sistema de boletaje, sino una plataforma de monetización más amplia."
    }

    db_topics = {
        "MySQL como capa transaccional": "MySQL es la fuente de verdad preferente para usuarios, eventos, tickets, pagos y respaldo histórico. Su papel es garantizar consistencia fuerte en operaciones que afectan inventario, identidad y dinero.",
        "SQLite como fallback local": "Varios microservicios pueden degradar a SQLite cuando MySQL no está disponible. Este mecanismo es útil para desarrollo, pruebas y recuperación, aunque exige una política clara para evitar bifurcación de datos en entornos productivos.",
        "MongoDB Atlas como plano analítico": "MongoDB absorbe sincronización de compras, pagos y otras huellas de comportamiento. Al separar este tráfico del plano relacional, la plataforma protege el tiempo de respuesta de las operaciones críticas.",
        "Migraciones no destructivas": "Auth, Events y Tickets incluyen rutinas que detectan tablas o columnas faltantes y ejecutan alteraciones mínimas. Esta práctica reduce el costo de despliegues incrementales cuando el proyecto avanza de forma rápida.",
        "Backups y restauración": "El sistema implementa historial de respaldos, dumps SQL, exportaciones JSON y volcados de MongoDB. La documentación extensa debe reflejar no solo el modelo ideal, sino el procedimiento real de recuperación."
    }

    flows = {
        "Autenticación": "El usuario envía credenciales desde el frontend, apiClient agrega headers, el gateway redirige a auth y auth responde con token JWT y perfil normalizado. AuthContext persiste la sesión en localStorage o sessionStorage según rememberMe y mantiene verificación periódica.",
        "Exploración de eventos": "El visitante consume rutas públicas, visualiza home, anuncios, tienda y detalle de evento. EventDetail actualiza secciones, funciones, mapa y asientos ocupados, lo que prepara el terreno para compra directa o agregado al carrito.",
        "Carrito": "CartContext sostiene items de ticket y merch, recalcula totales, comisión de servicio, cupones y tarjetas guardadas. Su diseño por usuario evita que un cambio de sesión mezcle carritos de distintas personas en el mismo navegador.",
        "Checkout": "El checkout divide identidad, envío, pago y éxito. Esto mejora trazabilidad de errores, validación de datos y reutilización de UI. Además permite vender tickets y mercancía en un mismo recorrido sin colapsar la interfaz.",
        "Compra de boletos": "Ticket Service genera códigos únicos, registra la compra, guarda medio de pago y dispara sincronización hacia MongoDB. La operación se complementa con verificación posterior, canje y flujo de refunds según estado del ticket.",
        "Operación de acceso": "Staff consulta el ticket, verifica validez y ejecuta redeem cuando corresponde. El sistema debe impedir doble ingreso, manejar estados usados y mostrar contexto suficiente para que el operador tome decisiones rápidas.",
        "Administración y monitoreo": "Admin Dashboard consume métricas, ordena accesos rápidos y actúa como centro de coordinación. Desde ahí se salta a monitoreo, radar, auditoría, base de datos, restauración y otras vistas con responsabilidad operativa."
    }

    endpoint_inventory = {
        "Auth": ["/login", "/register", "/request-permission", "/all-requests", "/check-lockout", "/login/google", "/login/apple", "/users/me", "/verify", "/logout", "/refresh", "/forgot-password", "/reset-password", "/users/me/avatar", "/admin/users", "/admin/broadcast", "/audit"],
        "Events": ["/public", "/all", "/my-events", "/manager/events", "/{event_id}", "POST /", "PUT /{event_id}"],
        "Tickets": ["/manager/transactions", "/my-tickets", "/refunds/my-refunds", "/refunds/request", "/verify", "/redeem", "/busy-seats/{event_id}", "/purchase", "/payments/create-intent", "/payments/{reference}/confirm", "/refund", "/lucky-seat/assign"],
        "Stats": ["/admin/dashboard", "/admin/sales", "/status", "/metrics", "/logs"],
        "Admin": ["/database/backups", "/database/backup", "/database/tables", "/database/stats", "/database/export/json", "/database/backups/{backup_id}/download"],
        "Analytics": ["/api/analytics/tables", "/api/analytics/suggestions", "/api/analytics/full", "/api/analytics/incremental", "/api/analytics/mapreduce", "/api/analytics/3d", "/api/analytics/predict", "/api/analytics/anomalies", "/api/analytics/clean", "/api/analytics/intelligence"],
        "Merchandise": ["/", "/{merch_id}", "/settings/{manager_id}", "/orders/", "/orders/{order_id}"],
    }

    blocks: list[Block] = []
    blocks.append(Block("title", "MANUAL TÉCNICO INTEGRAL DE LAIKA CLUB"))
    blocks.append(Block("subtitle", "Frontend, Backend y Base de Datos"))
    add_paragraphs(blocks, [
        "Versión del sistema documentada: 3.0.0. Fecha de actualización documental: 14 de abril de 2026. Este manual fue reconstruido a partir del estado real del código fuente del proyecto y amplía de forma sustancial el alcance del documento previo para cubrir la aplicación completa, desde la interfaz React hasta la malla de microservicios y el esquema híbrido de persistencia.",
        "Criterio editorial del documento: texto continuo en Arial 12, justificado, con fragmentos de código cortos y representativos. El objetivo no es solo describir la teoría del sistema, sino dejar una guía práctica que sirva para mantenimiento, transferencia de conocimiento, auditoría técnica, despliegue, contingencia y evolución futura.",
        "Alcance total del manual: arquitectura frontend, arquitectura backend, pasarela de APIs, contextos globales, rutas por rol, servicios JavaScript, microservicios FastAPI, seguridad, autenticación, compra de tickets, flujo de pagos, carrito, checkout, módulo de merchandising, analítica, gamificación, bases de datos, planes de respaldo, monitoreo, operación y recomendaciones técnicas.",
    ])
    blocks.append(Block("page_break"))
    blocks.append(Block("h1", "ÍNDICE GENERAL"))
    for item in [
        "1. Introducción y objetivo del sistema",
        "2. Visión global de la solución",
        "3. Arquitectura del frontend",
        "4. Arquitectura del backend",
        "5. Bases de datos y persistencia",
        "6. Seguridad, autenticación y permisos",
        "7. Flujos funcionales críticos",
        "8. Operación administrativa y monitoreo",
        "9. Despliegue, contingencia y recuperación",
        "10. Inventario técnico de rutas y módulos",
        "11. Recomendaciones de mantenimiento y evolución",
        "12. Apéndices de código representativo",
    ]:
        blocks.append(Block("p", item))

    blocks.append(Block("page_break"))
    blocks.append(Block("h1", "1. INTRODUCCIÓN Y OBJETIVO DEL SISTEMA"))
    add_paragraphs(blocks, [
        "LAIKA Club es una plataforma integral para la gestión de eventos, venta de boletos, control de acceso, administración operativa, analítica de comportamiento y comercialización de productos asociados al evento. Su ambición funcional rebasa el modelo tradicional de una simple ticketera porque articula experiencia pública, gestión profesional, operación de staff y analítica avanzada dentro de un mismo ecosistema.",
        "La meta principal del sistema es concentrar en una sola plataforma el ciclo de vida digital del evento. Un usuario descubre un evento, revisa funciones y secciones, compra boletos o mercancía, conserva sus activos digitales, solicita reembolsos y consulta historial. En paralelo, gestores y administradores crean eventos, monitorean ventas, revisan incidencias, generan respaldos, ejecutan campañas y operan infraestructura.",
        "Desde el punto de vista arquitectónico, el proyecto ha evolucionado hacia una solución de varias capas. En la parte de experiencia se usa React 19 con múltiples layouts, contextos y páginas segmentadas por rol. En la parte transaccional se usa FastAPI con un API Gateway y servicios de dominio especializados. En la persistencia se combina MySQL, SQLite de respaldo y MongoDB Atlas para desacoplar operación crítica y analítica.",
        "El valor de este manual radica en dejar claro cómo conviven todos esos elementos. No basta con enumerar archivos o dependencias. Un documento útil debe explicar por qué existe cada capa, qué responsabilidades tiene, cómo se relaciona con las demás y qué riesgos aparecen cuando una pieza falla, cambia o se despliega en condiciones diferentes a las del entorno de desarrollo local.",
    ])

    blocks.append(Block("h1", "2. VISIÓN GLOBAL DE LA SOLUCIÓN"))
    add_paragraphs(blocks, [
        "El sistema puede imaginarse como tres grandes planos acoplados. El primer plano es la interfaz React, que organiza navegación, estados globales, formularios, mapas, paneles y componentes visuales. El segundo plano es la malla backend, que materializa las reglas de negocio y entrega respuestas JSON. El tercer plano es la persistencia, que almacena transacciones, respaldos y analítica en tecnologías distintas según la naturaleza de cada dato.",
        "En la práctica, el usuario solo conoce el gateway y la interfaz. Sin embargo, detrás de la compra de un boleto intervienen múltiples capas: la selección visual del asiento, la consulta de asientos ocupados, la autenticación del usuario, la emisión del ticket, la trazabilidad del pago, la sincronización hacia MongoDB y el posterior canje en staff. Esa cadena hace evidente la importancia de documentar tanto la experiencia visible como el andamiaje técnico.",
        "Otro rasgo central de la versión 3.0.0 es la ampliación del dominio comercial. Ya no se trata solo de eventos y entradas; el proyecto incorpora tienda, checkout híbrido, catálogo de merch por manager y aprobación administrativa. Esa ampliación exige una documentación que una frontend, backend y base de datos, porque el negocio cruza fronteras funcionales que antes podían describirse por separado.",
    ])

    blocks.append(Block("h1", "3. ARQUITECTURA DEL FRONTEND"))
    add_paragraphs(blocks, [
        "La capa de frontend fue construida con React 19.2.3 y react-router-dom 7.12.0. Además de la librería base, el proyecto incorpora una colección extensa de componentes, hooks, páginas, layouts y servicios, lo que convierte al cliente web en una aplicación de alta complejidad. No es un simple catálogo estático; es un cliente de negocio con reglas locales, almacenamiento temporal, protección de rutas, módulos de administración y lógica transaccional de apoyo.",
        "La organización del código cliente sigue una estructura por dominios y utilidades. Existen carpetas separadas para páginas, componentes, contextos, hooks, servicios, layouts, estilos y utilidades. Esta división facilita localizar responsabilidades. Por ejemplo, la navegación vive en routes y App.jsx, el estado transversal se concentra en context, la integración HTTP se encapsula en services y la presentación concreta de las pantallas se implementa en pages y components.",
    ])
    blocks.append(Block("h2", "3.1 Aplicación principal y composición raíz"))
    blocks.append(Block("code", lines=app_snippet))
    add_paragraphs(blocks, [
        "El archivo principal ensambla proveedores de autenticación, carrito, notificaciones, tema, sistema, skeleton y favoritos. Esta decisión revela una filosofía importante del frontend: mover el estado compartido fuera de componentes individuales y definirlo en capas globales para que distintas vistas puedan reaccionar al mismo contexto sin acoplamientos innecesarios.",
        "El arranque de la aplicación incluye una pantalla de carga con control de tiempo mínimo. Esto no solo aporta estética; también estabiliza la percepción del usuario mientras se inicializan validaciones de sesión, contextos y rutas. El código contempla además una excepción de modo monitor para no bloquear herramientas operativas que necesitan arrancar rápido.",
        "La composición raíz también decide qué layout corresponde a cada familia de pantallas. Las rutas públicas suelen colgar de MainLayout; los paneles especializados usan DashboardLayout; y ciertas pantallas de autenticación o mantenimiento se tratan de forma separada. Esta organización evita repetir navegación, sidebars y estructuras visuales en cada página concreta.",
    ])
    blocks.append(Block("h2", "3.2 Módulos funcionales del frontend"))
    for title, desc in frontend_modules.items():
        blocks.append(Block("h3", title.upper()))
        add_paragraphs(blocks, [
            desc,
            f"Desde una perspectiva de mantenimiento, el módulo \"{title}\" también cumple una función de aislamiento. Cuando el sistema crece, la capacidad de encapsular decisiones visuales y de flujo en una zona específica del frontend reduce el costo de refactorización y minimiza regresiones en áreas no relacionadas.",
        ])

    blocks.append(Block("h2", "3.3 Cliente HTTP y contrato con el backend"))
    blocks.append(Block("code", lines=api_client_snippet))
    add_paragraphs(blocks, [
        "El apiClient es la pieza que traduce acciones del usuario en solicitudes HTTP contra el gateway. Determina la URL base usando variables de entorno o el hostname actual, construye headers, adjunta el token Bearer cuando existe sesión y normaliza errores a través de una clase ApiError. Esta encapsulación disminuye duplicidad y vuelve más uniforme el tratamiento de errores de red o autenticación.",
        "La ventaja de esta estrategia es doble. Por un lado, los componentes visuales no necesitan conocer los detalles finos de fetch, códigos HTTP o serialización. Por otro lado, el proyecto puede mantener un bridge retrocompatible en api.js que exporta nombres históricos sin destruir el diseño más modular del nuevo paquete services. Es una solución pragmática para evolucionar la base de código sin un corte brusco.",
    ])
    blocks.append(Block("h2", "3.4 Contexto de autenticación"))
    blocks.append(Block("code", lines=auth_context_snippet))
    add_paragraphs(blocks, [
        "AuthContext no solo guarda el usuario autenticado. También normaliza atributos con nombres distintos provenientes del backend, elige entre localStorage y sessionStorage según rememberMe, sincroniza pestañas, verifica la sesión contra el servidor y decide cuándo mantener el estado local aunque el servicio remoto no responda. Esa última decisión es importante porque privilegia resiliencia de experiencia frente a fallos transitorios de red.",
        "La estandarización del usuario es especialmente valiosa en un sistema que ha pasado por varias iteraciones. Al mapear first_name a firstName, avatar_url a avatarUrl o is_premium a isPremium, el contexto protege al resto del frontend de cambios de naming en la capa API. Esto reduce fricción y evita que cada componente tenga que interpretar formatos heterogéneos.",
        "Otra contribución del contexto es la apertura de un modal global de autenticación. Este patrón permite que módulos como el detalle de evento o la compra disparen un login contextual sin expulsar al usuario de su flujo actual. En plataformas de conversión, esta continuidad puede marcar una diferencia clara en la tasa de finalización de compra.",
    ])
    blocks.append(Block("h2", "3.5 Contexto de carrito y cálculo comercial"))
    blocks.append(Block("code", lines=cart_context_snippet))
    add_paragraphs(blocks, [
        "CartContext maneja productos de naturalezas diferentes dentro de una sola canasta: boletos y mercancía. También calcula subtotal, service fee, descuentos, cupones y tarjetas guardadas, y persiste todo por usuario para que no se mezclen carritos cuando varias personas usan el mismo navegador. Este diseño refleja una ampliación del modelo de negocio que la documentación anterior no cubría de forma suficiente.",
        "El contexto también trabaja como bisagra con el módulo de logros. Cuando existe usuario autenticado, intenta cargar cupones disponibles desde achievementsAPI. Si el servicio de logros falla, el carrito sigue funcionando y la caída se trata como no crítica. Esa degradación elegante ayuda a mantener viva la conversión comercial incluso cuando módulos secundarios presentan indisponibilidad.",
        "Desde la ingeniería de frontend, el carrito es uno de los lugares donde convergen estado persistente, cálculo de negocio y experiencia de usuario. Por eso conviene documentarlo con profundidad: es un punto donde un bug aparentemente pequeño puede provocar pérdidas económicas, errores de cobro o frustración del comprador.",
    ])
    blocks.append(Block("h2", "3.6 Checkout por pasos"))
    blocks.append(Block("code", lines=checkout_snippet))
    add_paragraphs(blocks, [
        "La página de checkout divide el recorrido en identidad, envío, pago y éxito. La información resumida del pedido se construye a partir del contexto de carrito y del hook useCheckoutFlow. Esta separación vuelve visible qué parte del problema es puramente de estado y cuál es de presentación, una distinción sana cuando la pantalla debe evolucionar o corregirse con frecuencia.",
        "El hecho de que la compra pueda incluir mercancía además de boletos justifica la existencia de un paso de envío, algo que no sería estrictamente necesario en una ticketera tradicional. Esta combinación confirma que el frontend actual atiende un dominio de comercio mixto y por eso requiere una documentación más cercana a una plataforma ecommerce que a un simple checkout de entrada digital.",
    ])
    blocks.append(Block("h2", "3.7 Detalle de evento como núcleo transaccional del cliente"))
    blocks.append(Block("code", lines=event_detail_snippet))
    add_paragraphs(blocks, [
        "EventDetail es una página orquestadora. Integra datos del evento, zonas del recinto, mapa interactivo, motor de tickets, inventario de mercancía, lógica de Lucky Seat, reanudación de compra tras login, validación de tarjetas y una secuencia visual de construcción o impresión del boleto. Documentarla es esencial porque resume buena parte del valor diferencial del producto.",
        "La página consulta información inicial, refresca asientos ocupados de forma periódica y sincroniza las zonas visuales con las secciones reales retornadas por el backend. Además soporta modales para compra directa y maneja casos específicos cuando el usuario vuelve desde autenticación con intención pendiente de compra. En otras palabras, no es una vista decorativa; es un motor de conversión asistido por múltiples submódulos.",
        "Para mantenimiento futuro conviene tratar este archivo y sus hooks asociados como un subdominio completo. Cualquier modificación en selección de asientos, validación de pagos, experiencia de merch o reanudación de compra debe revisarse aquí y en sus dependencias, no solo en los endpoints del backend.",
    ])
    blocks.append(Block("h2", "3.8 Dashboard administrativo del cliente"))
    blocks.append(Block("code", lines=admin_dashboard_snippet))
    add_paragraphs(blocks, [
        "El dashboard administrativo muestra que la aplicación React también funciona como consola operativa. Consume métricas del backend, permite reordenar accesos rápidos, muestra alertas y facilita el salto a módulos especializados. En términos de producto, el frontend sirve simultáneamente como sitio comercial y como backoffice.",
        "La capacidad de persistir el orden de secciones en localStorage indica un interés por personalizar la operación del administrador. Detalles como este son relevantes en una documentación extensa porque muestran que la plataforma no solo expone CRUDs, sino que busca optimizar el trabajo diario de los equipos internos.",
    ])

    blocks.append(Block("page_break"))
    blocks.append(Block("h1", "4. ARQUITECTURA DEL BACKEND"))
    add_paragraphs(blocks, [
        "La capa backend actual se apoya en FastAPI y se organiza como un conjunto de microservicios independientes expuestos detrás de un API Gateway. Esta arquitectura sustituye la visión anterior de un monolito modular y resulta más acorde con la realidad actual del proyecto. Cada dominio vive en su propia carpeta, escucha en un puerto fijo y puede iniciar de forma separada mediante Uvicorn.",
        "El gateway del puerto 8000 es la única puerta que necesita conocer el frontend. Este componente resuelve la ruta final según el prefijo solicitado, reenvía headers y cuerpo, maneja errores de proxy y cachea ciertos GET públicos. Esa decisión simplifica el cliente, pero también concentra responsabilidad en una pieza que debe estar muy bien documentada y observada.",
    ])
    blocks.append(Block("h2", "4.1 Configuración base del gateway"))
    blocks.append(Block("code", lines=gateway_snippet))
    add_paragraphs(blocks, [
        "El diccionario SERVICES establece un mapa explícito entre alias lógicos y URLs destino. Las claves auth, events, tickets, stats, admin, achievements, analytics y merchandise evidencian que el backend vigente ya trabaja con nueve procesos coordinados, incluyendo el nuevo dominio de merchandising en el puerto 8008.",
        "La lógica de proxy examina el path solicitado y construye target_url según prefijos concretos. Además distingue rutas cacheables, en especial aquellas relacionadas con recursos públicos. Este mecanismo no reemplaza un gateway empresarial, pero sí ofrece una capa útil de centralización y protección para el cliente web de desarrollo o despliegues ligeros.",
    ])
    blocks.append(Block("h2", "4.2 Servicios backend actuales"))
    for service, desc in backend_services.items():
        blocks.append(Block("h3", service.upper()))
        add_paragraphs(blocks, [
            desc,
            f"Documentar el servicio {service} con detalle es importante porque cualquier cambio en su contrato impacta al menos a una parte del frontend y en varios casos a otros servicios internos. La claridad de límites entre servicios ayuda a reducir ambigüedad cuando se depura una falla distribuida.",
        ])
    blocks.append(Block("h2", "4.3 Orquestación local de servicios"))
    blocks.append(Block("code", lines=launcher_snippet))
    add_paragraphs(blocks, [
        "run_microservices.py cumple una función cercana a un pequeño orquestador de desarrollo. Antes de arrancar los servicios verifica salud de MySQL y MongoDB, crea la carpeta de logs si hace falta y levanta cada aplicación Uvicorn en modo reload. La salida de cada proceso se redirige a archivos separados dentro de microservices_logs.",
        "Aunque esta estrategia no sustituye a un process manager formal, resulta suficientemente expresiva para entornos locales, pruebas integradas y demostraciones. Desde el punto de vista documental es valiosa porque deja visible el inventario canónico de servicios y puertos realmente utilizados por el sistema.",
    ])

    blocks.append(Block("h1", "5. BASES DE DATOS Y PERSISTENCIA"))
    add_paragraphs(blocks, [
        "La solución de persistencia es híbrida por necesidad funcional. MySQL resuelve el plano transaccional. SQLite actúa como mecanismo de continuidad o fallback local. MongoDB Atlas recibe sincronizaciones y colecciones analíticas. Esta diversidad obliga a pensar la base de datos no como una sola entidad, sino como un conjunto de responsabilidades diferenciadas.",
    ])
    for topic, desc in db_topics.items():
        blocks.append(Block("h3", topic.upper()))
        add_paragraphs(blocks, [
            desc,
            "En la documentación integral esto importa porque cada tecnología requiere criterios distintos de respaldo, rendimiento, consistencia y diagnóstico. Un problema de latencia en MongoDB no se aborda igual que una tabla faltante en MySQL ni que una degradación a SQLite en un entorno local.",
        ])
    blocks.append(Block("h2", "5.1 Sincronización hacia MongoDB"))
    blocks.append(Block("code", lines=mongo_snippet))
    add_paragraphs(blocks, [
        "La sincronización asíncrona evita bloquear el flujo de compra mientras se envía información hacia el plano analítico. Si Mongo no responde, la compra puede concluir en el plano principal y el sistema registra la falla sin interrumpir al usuario. Esta tolerancia es importante en una plataforma cuyo objetivo económico depende de no perder conversiones por módulos secundarios.",
    ])
    blocks.append(Block("h1", "6. SEGURIDAD, AUTENTICACIÓN Y PERMISOS"))
    blocks.append(Block("code", lines=auth_snippet))
    add_paragraphs(blocks, [
        "La seguridad actual se basa en contraseñas hasheadas con bcrypt y tokens JWT firmados con HS256. Un aspecto notable del código vigente es el parche defensivo aplicado para convivir con bcrypt 4.x cuando passlib espera el atributo __about__. Este tipo de compatibilidad operativa raramente aparece en documentos superficiales, pero sí debe aparecer en un manual técnico exhaustivo.",
        "OAuth2PasswordBearer se utiliza como dependencia para extraer el token desde Authorization Bearer. Sobre esa base se construye get_current_user, que permite que las rutas protegidas reciban el payload de usuario sin tener que repetir lógica de decodificación en cada endpoint.",
        "El sistema opera con varios roles: usuario, gestor, operador y admin. En frontend estos roles controlan acceso a layouts y rutas; en backend delimitan capacidades sensibles como administración de usuarios, eventos, monitoreo y configuración. Documentar el modelo de autorización como una responsabilidad transversal evita confundir roles de interfaz con permisos de negocio.",
    ])

    blocks.append(Block("h1", "7. FLUJOS FUNCIONALES CRÍTICOS"))
    for flow, desc in flows.items():
        blocks.append(Block("h3", flow.upper()))
        add_paragraphs(blocks, [
            desc,
            "Cuando se documenta un flujo crítico es importante no quedarse en la pantalla visible. También deben detallarse persistencia, validaciones, servicios involucrados, estados de error, comportamiento del cliente y consideraciones de continuidad operativa.",
        ])
    blocks.append(Block("h2", "7.1 Lógica de compra en tickets"))
    blocks.append(Block("code", lines=ticket_snippet))
    add_paragraphs(blocks, [
        "La rutina de compra recorre cada item, extrae eventId, seatId, sectionName y price, genera un ticket_code único, inserta el registro en la base y luego lanza una tarea asíncrona para replicar la compra en MongoDB. El commit consolidado al final del ciclo reduce la probabilidad de estados parciales dentro del mismo lote.",
        "En caso de error, el servicio hace rollback e intenta además registrar un pago fallido para dejar auditoría del incidente. Esta práctica es relevante porque un error de compra sin registro deja ciega al área de soporte. El código actual procura no perder completamente la huella del fallo.",
    ])

    blocks.append(Block("h1", "8. OPERACIÓN ADMINISTRATIVA Y MONITOREO"))
    add_paragraphs(blocks, [
        "El sistema incorpora una faceta operativa robusta. No solo se venden entradas; también se gestionan respaldos, tablas, anuncios, logs, auditorías, radar de operaciones, paneles de ventas y restauraciones. Esta dimensión convierte a LAIKA Club en una herramienta de administración integral y no solo en una capa de checkout.",
    ])
    blocks.append(Block("h2", "8.1 Backups desde el servicio administrativo"))
    blocks.append(Block("code", lines=admin_backup_snippet))
    add_paragraphs(blocks, [
        "El servicio administrativo permite crear respaldos de MySQL o MongoDB, registrar historial en backup_history y ejecutar el trabajo pesado en background. Este patrón libera la respuesta HTTP y hace posible lanzar operaciones costosas desde la interfaz sin bloquear por completo la experiencia del operador.",
        "La presencia de descargas de respaldo, estadísticas de base de datos y exportaciones muestra que la capa admin está diseñada como una suite de soporte y continuidad. En un manual amplio esto merece una explicación detallada porque son funciones que suelen activarse en momentos críticos.",
    ])

    blocks.append(Block("h1", "9. DESPLIEGUE, CONTINGENCIA Y RECUPERACIÓN"))
    add_paragraphs(blocks, [
        "run_microservices.py ejecuta verificaciones preventivas antes de iniciar. Si la base MySQL está vacía, dañada o ausente, puede activar automáticamente el Plan de Invierno. Si MongoDB Atlas carece de colecciones críticas, invoca el Plan LIA. Esta automatización introduce resiliencia, pero también significa que el equipo debe entender muy bien qué datos se restauran, desde dónde y con qué impacto.",
        "Los respaldos locales y los planes automáticos no eliminan la necesidad de procedimientos formales. Un despliegue serio requiere definir periodicidad de dumps, retención, revisión de integridad, pruebas de restauración y criterios de promoción entre ambientes. Un buen manual debe enunciar esas prácticas incluso si parte de la automatización actual vive en scripts auxiliares.",
        "La observabilidad actual se basa en logs por proceso y mensajes impresos. Es funcional para desarrollo, pero limitada para producción. A futuro sería recomendable incorporar logging estructurado, trazabilidad distribuida, correlación por request_id y tableros centralizados. La presente documentación lo señala porque es una de las áreas con mayor retorno técnico potencial.",
    ])

    blocks.append(Block("h1", "10. INVENTARIO TÉCNICO DE RUTAS Y MÓDULOS"))
    add_paragraphs(blocks, [
        "A continuación se incluye un inventario resumido pero amplio de endpoints y superficies funcionales. Este tipo de catálogo no reemplaza un OpenAPI consolidado, pero ayuda a los equipos de desarrollo, QA y soporte a orientarse rápidamente en la topología real del sistema.",
    ])
    for area, endpoints in endpoint_inventory.items():
        blocks.append(Block("h3", f"{area.upper()}"))
        blocks.append(Block("p", f"Rutas registradas o representativas en el dominio {area}: {', '.join(endpoints)}."))
        blocks.append(Block("p", f"Desde una perspectiva de mantenimiento, el inventario del dominio {area} debe contrastarse periódicamente con el código real para evitar que el manual quede desfasado. En sistemas vivos, el mayor riesgo documental no es la falta de detalle inicial, sino la obsolescencia progresiva."))

    blocks.append(Block("h1", "11. RECOMENDACIONES DE MANTENIMIENTO Y EVOLUCIÓN"))
    recommendations = [
        "Unificar el versionado mostrado por todos los servicios FastAPI para que el ecosistema backend no mezcle 1.0.0, 2.0.0 y 3.0.0 en distintas respuestas y metadatos.",
        "Externalizar URLs internas fijas como EVENT_SERVICE_URL y otras dependencias localhost para favorecer despliegues con Docker, entornos remotos o infraestructura más formal.",
        "Sustituir parte de la comunicación implícita entre módulos por contratos versionados y documentación OpenAPI por servicio o consolidada a nivel gateway.",
        "Definir una política clara sobre el uso de SQLite de respaldo en producción para evitar divergencia silenciosa frente a MySQL.",
        "Introducir pruebas automáticas para login, verify, purchase, refund, backup, restore y checkout híbrido con tickets y merch.",
        "Agregar observabilidad estructurada y métricas homogéneas de latencia, errores y dependencia externa.",
        "Documentar con más profundidad el modelo de datos real del microservicio de merchandise y su relación con managers, inventario y órdenes.",
        "Revisar el tamaño y complejidad de EventDetail para considerar separación adicional en submódulos si el dominio de compra sigue creciendo.",
        "Fortalecer políticas de seguridad operacional, incluyendo rotación de secretos, endurecimiento de CORS y control de entornos para credenciales sensibles.",
        "Mantener este manual como artefacto vivo, regenerándolo en cada iteración mayor del producto para que siga acompañando la realidad del código."
    ]
    for rec in recommendations:
        blocks.append(Block("p", rec))

    blocks.append(Block("h1", "12. DESARROLLO EXHAUSTIVO POR COMPONENTE"))
    add_paragraphs(blocks, [
        "La siguiente sección amplía la lectura arquitectónica con un enfoque más analítico. El propósito es que el manual no se limite a un resumen ejecutivo, sino que sirva como material de referencia para onboarding, revisión de cambios, auditoría de deuda técnica y discusión de arquitectura entre perfiles de frontend, backend y datos.",
        "Cada componente se describe desde cuatro ángulos: propósito funcional, integración con el resto del sistema, riesgos operativos y oportunidades de mejora. Este formato convierte el manual en una herramienta más cercana a una memoria técnica o dossier de ingeniería que a un simple documento de consulta rápida.",
    ])
    for title in frontend_modules:
        blocks.append(Block("h3", f"FRONTEND DETALLADO: {title.upper()}"))
        add_paragraphs(blocks, [
            f"En el área de frontend denominada {title}, la responsabilidad primaria consiste en traducir reglas de negocio a interacción comprensible. Esto exige coordinar estado, navegación, visualización, mensajes de error, datos remotos y continuidad del flujo. En una plataforma comercial como LAIKA Club, un módulo visual nunca es solo decoración; es una superficie donde se materializan decisiones de negocio y se sienten directamente los aciertos o fallas de la arquitectura.",
            f"El módulo {title} también debe leerse en relación con la mantenibilidad. Cuando un componente o una ruta crece sin límites claros, aumenta el costo de incorporar nuevas funciones y se vuelve más probable introducir regresiones. Por eso esta documentación insiste en límites, responsabilidades y contratos. Aunque React permite gran flexibilidad, en proyectos extensos esa flexibilidad necesita disciplina documental y criterios de separación suficientemente explícitos.",
            f"Desde la perspectiva operativa, {title} afecta métricas reales como conversión, tasa de abandono, tiempo de resolución para staff o eficiencia administrativa. Un error en esta zona puede no romper el sistema completo, pero sí deteriorar la experiencia o el desempeño del negocio. Por eso el manual lo trata como una pieza estratégica y no como un simple detalle de implementación del cliente web.",
        ])
    for service in backend_services:
        blocks.append(Block("h3", f"BACKEND DETALLADO: {service.upper()}"))
        add_paragraphs(blocks, [
            f"El servicio {service} debe evaluarse no solo por sus endpoints, sino por el tipo de compromiso que asume dentro del ecosistema. Algunos servicios son transaccionales, otros agregadores, otros analíticos y otros puramente administrativos. Documentar ese matiz evita exigir el mismo comportamiento de disponibilidad, consistencia o latencia a componentes cuyo propósito es distinto.",
            f"En términos de integración, {service} participa en una red donde el frontend consume el gateway, el gateway enruta hacia dominios concretos y ciertos servicios consultan a otros para enriquecer respuestas. Esa malla distribuye responsabilidades, pero también genera superficies de falla cruzada. Por eso conviene registrar dependencias, supuestos y expectativas de cada nodo, de modo que el diagnóstico de incidentes no dependa solo del conocimiento tácito del equipo.",
            f"Desde el punto de vista de evolución futura, el servicio {service} ofrece una oportunidad clara para reforzar contratos, versionado, observabilidad y pruebas. El crecimiento sostenido del sistema hace necesario identificar qué partes del backend ya operan como dominios maduros y cuáles todavía dependen de convenciones locales o de URLs internas que deberían abstraerse mejor.",
        ])
    for topic in db_topics:
        blocks.append(Block("h3", f"PERSISTENCIA DETALLADA: {topic.upper()}"))
        add_paragraphs(blocks, [
            f"La dimensión de datos asociada a {topic} no debe verse como un simple detalle de infraestructura. Define cómo se conserva la verdad del sistema, cómo se responde ante fallas, cómo se diagnostican inconsistencias y cómo se sostienen tareas analíticas o administrativas sin comprometer el plano de venta. En plataformas mixtas, la estrategia de persistencia es parte central de la arquitectura del producto.",
            f"Una lectura madura de {topic} exige mirar más allá del almacenamiento. También importa el ciclo de respaldo, la posibilidad de degradación controlada, la legibilidad de los datos para soporte y la forma en que las aplicaciones cliente toleran indisponibilidad parcial. El manual incorpora esta discusión porque los problemas de datos suelen emerger cuando ya existe presión operativa y es demasiado tarde para improvisar criterios.",
            f"En evolución futura, {topic} debe acompañarse de estándares más formales de monitoreo, validación y restauración. La complejidad del ecosistema ya justifica una postura más explícita sobre ownership de tablas, colecciones, migraciones y fuentes oficiales de verdad para cada tipo de información.",
        ])
    for flow in flows:
        blocks.append(Block("h3", f"FLUJO DETALLADO: {flow.upper()}"))
        add_paragraphs(blocks, [
            f"El flujo de {flow} es crítico porque une experiencia de usuario con efectos persistentes en datos, seguridad y operación. La calidad del flujo no depende únicamente de si el botón funciona; depende también de si el sistema registra bien el estado, tolera errores parciales, comunica fallos con claridad y deja suficiente rastro para soporte y auditoría.",
            f"En la práctica, {flow} involucra decisiones distribuidas entre frontend, gateway, microservicios y almacenamiento. Cuando una organización documenta este tipo de trayectorias con detalle, reduce dependencia de héroes técnicos y mejora la capacidad de intervenir rápido ante incidentes. Esa es una de las razones principales por las que este manual insiste tanto en secuencias de negocio y no solo en catálogos de archivos o endpoints.",
        ])

    blocks.append(Block("h1", "13. GLOSARIO OPERATIVO Y MATRIZ DE ESCENARIOS"))
    glossary = [
        "Usuario final", "Gestor", "Operador", "Administrador", "API Gateway", "Microservicio", "Contexto React",
        "Checkout", "Lucky Seat", "Refund", "Backup", "Restauración", "Sincronización MongoDB", "Ticket Code",
        "Radar de operaciones", "Constructor de boletos", "Dashboard", "Venue map", "Orden de merchandising", "Log de auditoría"
    ]
    for term in glossary:
        blocks.append(Block("h3", term.upper()))
        add_paragraphs(blocks, [
            f"El término {term} se usa en este proyecto con un sentido operativo concreto y no meramente teórico. Entenderlo bien ayuda a leer el código, interpretar incidencias y conversar con claridad entre perfiles de frontend, backend, soporte y administración. En plataformas grandes, buena parte de los errores de coordinación nace de usar la misma palabra para realidades distintas, por lo que un glosario técnico se vuelve una herramienta de ingeniería y no solo de estilo.",
            f"En la práctica, {term} aparece ligado a rutas, permisos, componentes, tablas, procesos o decisiones de soporte. Documentarlo permite acelerar onboarding, revisar tickets de incidencia con menos ambigüedad y sostener discusiones de mejora sin depender exclusivamente del conocimiento oral acumulado por quienes ya dominan el sistema. Por eso esta sección forma parte del núcleo documental y no de un anexo marginal.",
        ])

    scenarios = [
        "Usuario compra un boleto y luego solicita reembolso",
        "Gestor crea un evento y habilita mercancía asociada",
        "Administrador ejecuta un respaldo mientras la plataforma sigue operando",
        "Staff verifica un QR y detecta que el ticket ya fue usado",
        "El servicio de auth cae temporalmente pero el frontend intenta mantener sesión local",
        "MySQL no responde y un servicio degrada a SQLite",
        "MongoDB Atlas no está disponible durante una compra",
        "El dashboard administrativo muestra métricas incompletas por fallo parcial del backend",
        "El usuario regresa del login con intención pendiente de compra",
        "Un equipo nuevo necesita entender rápido cómo navegar el sistema completo"
    ]
    for scenario in scenarios:
        blocks.append(Block("h3", f"ESCENARIO: {scenario.upper()}"))
        add_paragraphs(blocks, [
            f"En el escenario \"{scenario}\", la documentación debe servir como mapa de diagnóstico y no solo como descripción pasiva. Lo importante es identificar qué capas participan, qué estado cambia, qué logs o tablas ayudan a verificar lo ocurrido y qué experiencia debe percibir el usuario o el operador en cada paso. Un manual verdaderamente útil permite reconstruir el caso sin depender de intuiciones aisladas.",
            f"Este tipo de escenarios también ayuda a QA, soporte y producto porque transforma el código en relatos verificables de operación. Cuando un incidente real se parece a uno de estos recorridos documentados, la organización responde con más velocidad y menos improvisación. Por eso la matriz de escenarios extiende el manual más allá de la arquitectura y lo convierte en herramienta de continuidad operativa.",
        ])

    blocks.append(Block("h1", "14. APÉNDICES DE CÓDIGO REPRESENTATIVO"))
    add_paragraphs(blocks, [
        "Los siguientes fragmentos no buscan replicar el código completo, sino dejar evidencia textual de cómo están modeladas hoy las piezas clave del sistema. Sirven como referencia rápida para lectura arquitectónica y como puente entre el manual y el repositorio.",
    ])
    for title, snippet in [
        ("Gateway y enrutamiento", gateway_snippet),
        ("Cliente HTTP del frontend", api_client_snippet),
        ("AuthContext y persistencia de sesión", auth_context_snippet),
        ("CartContext y lógica comercial", cart_context_snippet),
        ("Checkout por pasos", checkout_snippet),
        ("Detalle de evento", event_detail_snippet),
        ("Seguridad JWT", auth_snippet),
        ("Compra de tickets", ticket_snippet),
        ("Sincronización MongoDB", mongo_snippet),
        ("Backups administrativos", admin_backup_snippet),
    ]:
        blocks.append(Block("h2", title.upper()))
        blocks.append(Block("code", lines=snippet))
        blocks.append(Block("p", f"Este fragmento fue seleccionado porque el módulo {title.lower()} representa una responsabilidad estructural del sistema y ayuda a enlazar la descripción conceptual del manual con la implementación concreta presente en el repositorio."))

    blocks.append(Block("h1", "CIERRE"))
    add_paragraphs(blocks, [
        "LAIKA Club 3.0.0 es una plataforma mucho más extensa que la descrita por versiones tempranas del manual. Hoy combina un frontend rico en estados y rutas por rol, un backend de microservicios con gateway, múltiples bases de datos y procedimientos de respaldo y contingencia. Por eso la documentación también necesitaba crecer en longitud, detalle y cobertura temática.",
        "Este documento deja una base sólida para desarrollo, soporte, despliegue y continuidad operativa. Su valor será mayor si se mantiene sincronizado con la evolución del código. En una plataforma con este nivel de amplitud, documentar bien no es un lujo: es parte de la infraestructura de calidad.",
    ])
    return blocks

def update_document_xml(doc_xml: bytes, blocks: list[Block]) -> bytes:
    root = ET.fromstring(doc_xml)
    body = root.find(w_tag("body"))
    if body is None:
        raise RuntimeError("No se encontró body en document.xml")
    sect_pr = body.find(w_tag("sectPr"))
    sect_pr_copy = copy.deepcopy(sect_pr) if sect_pr is not None else None
    for child in list(body):
        body.remove(child)
    for paragraph in render_blocks(blocks):
        body.append(paragraph)
    if sect_pr_copy is not None:
        body.append(sect_pr_copy)
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)

def build_docx(source_docx: Path, output_docx: Path, project_root: Path) -> None:
    temp_dir = project_root / "tmp" / "backend_manual_docx_build"
    if temp_dir.exists():
        shutil.rmtree(temp_dir)
    temp_dir.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(source_docx, "r") as zf:
        zf.extractall(temp_dir)
    document_xml_path = temp_dir / "word" / "document.xml"
    styles_xml_path = temp_dir / "word" / "styles.xml"
    document_xml_path.write_bytes(update_document_xml(document_xml_path.read_bytes(), build_blocks(project_root)))
    styles_xml_path.write_bytes(update_styles_xml(styles_xml_path.read_bytes()))
    output_docx.parent.mkdir(parents=True, exist_ok=True)
    if output_docx.exists():
        output_docx.unlink()
    with zipfile.ZipFile(output_docx, "w", zipfile.ZIP_DEFLATED) as zf:
        for file_path in temp_dir.rglob("*"):
            if file_path.is_file():
                zf.write(file_path, file_path.relative_to(temp_dir).as_posix())
    shutil.rmtree(temp_dir, ignore_errors=True)

def main() -> None:
    project_root = Path(__file__).resolve().parent.parent
    source_docx = Path(r"c:\Users\Pc\Desktop\MANUAL TÉCNICO DEL BACKEND.docx")
    output_docx = project_root / "MANUAL_TECNICO_INTEGRAL_LAIKA_CLUB_V3_EXTENDIDO.docx"
    if not source_docx.exists():
        raise FileNotFoundError(f"No existe el documento base: {source_docx}")
    build_docx(source_docx, output_docx, project_root)
    print(output_docx)
    print(f"Tamaño final: {os.path.getsize(output_docx)} bytes")

if __name__ == "__main__":
    main()
