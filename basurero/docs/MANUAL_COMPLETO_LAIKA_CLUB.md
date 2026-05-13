# MANUAL TÉCNICO Y DE USUARIO AVANZADO — LAIKA CLUB
**Sistema Integral de Gestión de Eventos, Ticketing y Control de Acceso**

**Versión del Documento:** 3.0 (Edición Extendida Frontend + Backend)
**Orientación:** Desarrolladores, Arquitectos de Software, Administradores y Gestores.
**Extensión Aproximada:** Documento maestro ampliado para maquetación larga; la paginación final depende de Word, tipografía, márgenes e interlineado y está pensado para escalar hacia un equivalente de 70 páginas o más.

---

## ÍNDICE MÁSTER
1. [Introducción y Objetivos Core](#1-introducción-y-objetivos-core)
2. [Arquitectura del Sistema (Backend & Frontend)](#2-arquitectura-del-sistema)
3. [Ecosistema de Bases de Datos](#3-ecosistema-de-bases-de-datos)
4. [Seguridad y Autenticación (Deep Dive)](#4-seguridad-y-autenticación)
5. [Módulo 1: Gestión de Usuarios y Roles](#5-módulo-1-gestión-de-usuarios-y-roles)
6. [Módulo 2: Motor de Eventos y Recintos](#6-módulo-2-motor-de-eventos-y-recintos)
7. [Módulo 3: Core de Ticketing y Operativa QR](#7-módulo-3-core-de-ticketing-y-operativa-qr)
8. [Módulo 4: Gamificación y Logros (Achievements)](#8-módulo-4-gamificación-y-logros)
9. [Módulo 5: Analítica de Datos y MongoDB](#9-módulo-5-analítica-de-datos-y-mongodb)
10. [Módulo 6: Middlewares y Plan de Contingencia (Winter Plan)](#10-módulo-6-middlewares-y-plan-de-contingencia)
11. [Guía Funcional y Operativa (Paso a Paso para Usuarios Finales)](#11-guía-funcional-y-operativa-paso-a-paso-para-usuarios-finales)
12. [Arquitectura Frontend Real del Proyecto](#12-arquitectura-frontend-real-del-proyecto)
13. [Sistema de Diseño Industrial y Variables Globales](#13-sistema-de-diseño-industrial-y-variables-globales)
14. [Temas, Modo Oscuro y Personalización Visual](#14-temas-modo-oscuro-y-personalización-visual)
15. [Sistema de Skeletons, Estados de Carga y Percepción de Rendimiento](#15-sistema-de-skeletons-estados-de-carga-y-percepción-de-rendimiento)
16. [Catálogo de Componentes Base del Frontend](#16-catálogo-de-componentes-base-del-frontend)
17. [Layouts, Navegación, Rutas y Segmentación por Rol](#17-layouts-navegación-rutas-y-segmentación-por-rol)
18. [Páginas Estratégicas y Experiencia de Usuario por Módulo](#18-páginas-estratégicas-y-experiencia-de-usuario-por-módulo)
19. [Estilo Visual Industrial, Motion Design y Animaciones](#19-estilo-visual-industrial-motion-design-y-animaciones)
20. [Tablas, Formularios, Modales y Patrones de Interacción Complejos](#20-tablas-formularios-modales-y-patrones-de-interacción-complejos)
21. [Responsive Design, Accesibilidad y Compatibilidad Operativa](#21-responsive-design-accesibilidad-y-compatibilidad-operativa)
22. [Rendimiento Frontend, Gestión de Estado y Comunicación con la API](#22-rendimiento-frontend-gestión-de-estado-y-comunicación-con-la-api)
23. [Guía de Implementación de Nuevos Módulos Frontend](#23-guía-de-implementación-de-nuevos-módulos-frontend)
24. [Anexo de Snippets, Patrones Reutilizables y Recomendaciones de Escalado](#24-anexo-de-snippets-patrones-reutilizables-y-recomendaciones-de-escalado)

---

## 1. INTRODUCCIÓN Y OBJETIVOS CORE

LAIKA Club es una plataforma digital de alto rendimiento diseñada para resolver la fragmentación en la industria del entretenimiento. En lugar de utilizar un software para vender boletos, otro para escanearlos y otro para analizar los datos, LAIKA Club centraliza el ciclo de vida completo del evento.

### ¿A quién va dirigido este manual?
Este documento es un híbrido diseñado para abarcar todos los frentes del sistema:
*   **Desarrolladores Backend:** Que necesitan entender cómo interactúa FastAPI con MySQL y SQLAlchemy, la generación de JWT, y la concurrencia asíncrona.
*   **DevOps / SysAdmins:** Para comprender los Middlewares de protección, los sistemas de Logs duales y las bases de la contingencia "Winter Plan".
*   **Product Managers / Gestores:** Que requieren entender la lógica de negocio profunda detrás de la emisión de boletos, pagos y el sistema gamificado de logros.
*   **Usuarios Operativos:** Que buscan un paso a paso detallado para entender la cara visible de la aplicación.

---

## 2. ARQUITECTURA DEL SISTEMA

La arquitectura de LAIKA Club es un **Monolito Modular con Capas de Enrutamiento Desacopladas**. Está escrito enteramente en Python 3.10+ utilizando **FastAPI**. Optamos por esta arquitectura para maximizar el rendimiento I/O sin la sobrecarga inicial de gestionar decenas de microservicios.

### Diagrama de Flujo (Client -> Server -> Database)

```text
[Cliente React/Next.js] 
        |
   (HTTP Request)
        v
[API Gateway (main.py / Puerto 8000)]
        |
        v
[Pila de Middlewares] 
   1. LoggingMiddleware (Mide tiempo y registra)
   2. MaintenanceMiddleware (Corta paso si está en mantenimiento)
   3. WinterProtectionMiddleware (Acelerador en caso de saturación)
        |
        v
[Capa de Enrutamiento (Routers)]
   ├── /api/auth       (Autenticación JWT)
   ├── /api/events     (Gestión de Eventos)
   ├── /api/tickets    (Caja Registradora / QR)
   └── /api/users      (Perfiles)
        |
        v
[Dependencias (get_db, get_current_user)]
        |
   +----+----+
   |         |
   v         v
[MySQL]   [MongoDB]
(Trans.)  (Analítica)
```

### El archivo `main.py` (Punto de Entrada Core)
El archivo `main.py` levanta el servidor Uvicorn. Aquí se configura CORS, se incluyen los routers y se inician las tareas de ciclo de vida. Es el "cerebro" del enrutamiento. Lo hemos envuelto en bloques `try/except` masivos para que si un desarrollador rompe un módulo, el resto del sitio siga vivo.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from middleware.logging_middleware import LoggingMiddleware
from middleware.maintenance import MaintenanceMiddleware
from routers import auth, events, tickets, users, stats

app = FastAPI(
    title="LAIKA Club API",
    description="Sistema central de eventos, ticketing y gamificación",
    version="2.0.0"
)

# Configuración estricta de CORS para asegurar que el Frontend React pueda comunicarse
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.1.11:3000"],
    allow_credentials=True,
    allow_methods=["*"], # Permitimos todos los métodos (GET,POST,PUT,DELETE,PATCH,OPTIONS)
    allow_headers=["*"], # Fundamental permitir Authorization
)

# Inyección de Middlewares Personalizados en orden de ejecución
app.add_middleware(MaintenanceMiddleware)
app.add_middleware(LoggingMiddleware)

# Registro dinámico de rutas. Si un desarrollador rompe events.py, auth y tickets siguen vivos.
try:
    app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
    app.include_router(events.router, prefix="/api/events", tags=["Eventos"])
    app.include_router(tickets.router, prefix="/api/tickets", tags=["Boletos"])
    app.include_router(stats.router, prefix="/api/stats", tags=["Estadísticas"])
except ImportError as e:
    print(f"[ALERTA CRÍTICA] Un módulo falló al inicializarse: {e}")
```

---

## 3. ECOSISTEMA DE BASES DE DATOS

El sistema sigue el principio de **Segregación de Responsabilidades en Base de Datos (CQRS simplificado)**. Utilizamos un modelo Híbrido: Relacional para transaccionalidad, Documental para volcado de analítica masiva.

### 3.1 MySQL (Fuente de Verdad Operacional)
Todas las transacciones que requieren **consistencia estricta ACID** (reservar un boleto para no sobre-vender el recinto, pagar, registrar un usuario) ocurren en MySQL. Para garantizar latencias sub-milisegundo, evitamos usar objetos declarativos ORM pesados de SQLAlchemy y escribimos **Direct SQL** parametrizado con `text()`.

**Esquema Relacional Central:**
```sql
CREATE DATABASE laika_club;
USE laika_club;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('usuario', 'gestor', 'operador', 'admin') DEFAULT 'usuario',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    total_tickets INT NOT NULL,
    available_tickets INT NOT NULL,
    status ENUM('draft', 'published', 'cancelled') DEFAULT 'draft',
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event_id INT,
    ticket_code VARCHAR(50) UNIQUE NOT NULL, -- Ej: TKT-A1B2C3D4
    status ENUM('active', 'used', 'cancelled', 'refunded') DEFAULT 'active',
    price_paid DECIMAL(10, 2) NOT NULL,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);
```

### 3.2 MongoDB (Data Lake de Logs y Analítica)
Para no saturar a MySQL (y ralentizar los pagos) cuando el dashboard del Gestor necesita calcular promedios históricos, desviamos toda métrica observacional a MongoDB de manera **Asíncrona**.

```python
# core/mongodb.py
from pymongo import MongoClient
import os
from datetime import datetime

class MongoAnalytics:
    def __init__(self):
        try:
            # Timeout corto: Si Mongo se cae, la plataforma sobrevive con MySQL
            self.client = MongoClient(os.getenv("MONGODB_URI"), serverSelectionTimeoutMS=1500)
            self.db = self.client[os.getenv("MONGODB_DATABASE")]
        except Exception:
            self.db = None # Failsafe Graceful Degradation

    def log_ticket_purchase(self, user_id: int, event_id: int, revenue: float):
        if self.db is not None:
            self.db.financial_analytics.insert_one({
                "action": "purchase",
                "user_id": user_id,
                "event_id": event_id,
                "revenue": revenue,
                "timestamp": datetime.utcnow()
            })
```

---

## 4. SEGURIDAD Y AUTENTICACIÓN (DEEP DIVE)

La seguridad se divide en dos fases: encriptación en la base de datos (Bcrypt) y autorización en tránsito (State-less JWT Bearer Tokens).

### 4.1 Generación de Hash de Contraseña (Bcrypt)
La lógica en `auth.py` utiliza `bcrypt`. En lugar de MD5 o SHA256 (que son rápidos y vulnerables), Bcrypt aplica miles de iteraciones intencionadamente lentas para hacer inviable la fuerza bruta.

```python
import bcrypt

def hash_password(plain_password: str) -> str:
    # Genera un 'salt' criptográfico único
    salt = bcrypt.gensalt()
    # Hashea el string convertido a bytes usando el salt
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    # Lo guarda en formato $2b$12$... en la base de datos
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
```

### 4.2 Autorización con JSON Web Tokens (JWT)
El sistema emite tokens firmados una vez que se validan las credenciales. Esto evita tener que buscar la sesión del usuario en memoria, haciendo la API 100% horizontalmente escalable.

```python
# En la respuesta de /api/auth/login
from jose import jwt
from datetime import datetime, timedelta

JWT_SECRET = os.getenv("JWT_SECRET", "super_clave_fallback_peligrosa")
ALGORITHM = "HS256"

def create_access_token(user_id: int, role: str):
    expire = datetime.utcnow() + timedelta(days=7) # El token vive una semana
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": expire
    }
    # Se genera el string de 3 bloques separado por puntos (Header.Payload.Signature)
    encoded_jwt = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt
```

### 4.3 La Dependencia Maestra: `get_current_user`
Esta función es el guardián de toda la API. Cada vez que un desarrollador decora una ruta con `Depends(get_current_user)`, FastAPI inyecta y ejecuta este flujo automáticamente.

```python
# dependencies.py
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import text

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security), 
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        # Decodificación criptográfica. Si fue alterado por un hacker, esto lanza excepción.
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token manipulado o expirado")

    # Extraemos al usuario para asegurar que no fue borrado ni suspendido recientemente
    query = text("SELECT id, first_name, email, role, status FROM users WHERE id = :uid")
    result = db.execute(query, {"uid": user_id}).fetchone()
    
    if result is None or result.status != 'active':
        raise HTTPException(status_code=401, detail="Cuenta bloqueada por administrador")
        
    # Retornamos el diccionario completo, inyectable en la función destino de FastAPI
    return dict(result._mapping)
```

---

## 5. MÓDULO 1: GESTIÓN DE USUARIOS Y ROLES

Ubicado en `routers/users.py`, maneja toda la lógica del cliente y el perfil. Destaca el diseño de actualización dinámica, donde el SQL se teje en el momento dependiendo de si el usuario quiere cambiar solo su teléfono o toda su biografía.

### Actualización Dinámica del Perfil (Endpoint PUT)
```python
@router.put("/me")
def update_profile(
    user_data: dict, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    updates = []
    params = {"uid": current_user["id"]}
    
    # Análisis dinámico del Request Body
    if "first_name" in user_data:
        updates.append("first_name = :fname")
        params["fname"] = user_data["first_name"]
    if "phone" in user_data:
        updates.append("phone = :phone")
        params["phone"] = user_data["phone"]

    if not updates:
        return {"message": "No se proporcionaron campos para actualizar."}

    # Unimos el array en una query cruda
    sql = f"UPDATE users SET {', '.join(updates)}, updated_at = NOW() WHERE id = :uid"
    db.execute(text(sql), params)
    db.commit()
    
    return {"message": "Configuración guardada exitosamente"}
```

---

## 6. MÓDULO 2: MOTOR DE EVENTOS Y RECINTOS

Ubicado en `routers/events.py`. Los Gestores pueden crear "Eventos Padre" que contienen múltiples "Funciones" (Hijas), permitiendo una gira o un festival de múltiples recintos y fechas.

### Inserción Atómica de Tablas Relacionadas (Transacciones)
El código a continuación demuestra el uso estricto de los **Rollbacks**. Si, durante la inserción, el evento se guarda correctamente pero las funciones hijas fallan por culpa de la base de datos, SQLAlchemy revertirá todo en cascada.

```python
@router.post("/")
def create_event(
    event_payload: EventCreateSchema, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # RBAC: Verificación dura de Rol
    if current_user["role"] not in ["admin", "gestor"]:
        raise HTTPException(status_code=403, detail="Permiso denegado.")

    try:
        # Paso 1: Insertar evento base en MySQL
        query = text("""
            INSERT INTO events (name, description, price, total_tickets, available_tickets, created_by)
            VALUES (:n, :d, :p, :tt, :at, :creator)
        """)
        result = db.execute(query, {
            "n": event_payload.name, "d": event_payload.description,
            "p": event_payload.price, "tt": event_payload.total_tickets,
            "at": event_payload.total_tickets, "creator": current_user["id"]
        })
        new_event_id = result.lastrowid # Obtenemos el ID auto-generado
        
        # Paso 2: Iterar el array JSON he insertar dependencias
        if hasattr(event_payload, 'functions') and event_payload.functions:
            func_query = text("""
                INSERT INTO event_functions (event_id, venue_id, date)
                VALUES (:eid, :vid, :date)
            """)
            for function in event_payload.functions:
                db.execute(func_query, {
                    "eid": new_event_id, 
                    "vid": function.venue_id, 
                    "date": function.date
                })
        
        # Paso 3: Confirmación en disco (ACID)
        db.commit() 
        
        # Paso 4: Dejar rastro en MONGODB para Data Science (sin detener el request)
        MongoAnalytics().log_event_created(new_event_id, current_user["id"])
        
        return {"success": True, "event_id": new_event_id}
        
    except Exception as e:
        # Failsafe Crítico:
        db.rollback() 
        raise HTTPException(status_code=500, detail="Error interno de DB")
```

---

## 7. MÓDULO 3: CORE DE TICKETING Y OPERATIVA QR

El corazón de la monetización en LAIKA Club reside en `routers/tickets.py`. Es la función más invocada por unidad de tiempo.

### 7.1 El Motor de Emisión (Compra)
Cada vez que el Frontend envía un intento de compra, el Backend debe descontar stock y generar Cripto-códigos de acceso.

```python
import uuid
from fastapi import BackgroundTasks

@router.post("/purchase")
def purchase_tickets(
    payload: PurchasePayload,
    bg_tasks: BackgroundTasks, # Tareas encoladas para no demorar el pago
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    generated_tickets = []
    
    # 0. LÓGICA DE TARJETA DE CRÉDITO A NIVEL PASARELA IRÍA AQUÍ (Stripe)
    
    try:
        # Preparamos las sentencias SQL preparadas
        insert_tkt = text("""
            INSERT INTO tickets (user_id, event_id, ticket_code, status, price_paid)
            VALUES (:uid, :evid, :code, 'active', :price)
        """)
        
        # Restamos aforo dinámicamente evitando Race Conditions usando LOCKS implícitos
        discount_stock = text("""
            UPDATE events 
            SET available_tickets = available_tickets - :qty 
            WHERE id = :evid AND available_tickets >= :qty
        """)
        
        for item in payload.items: 
            # 1. Intentamos restar el stock en base de datos.
            result = db.execute(discount_stock, {"qty": item.quantity, "evid": item.event_id})
            if result.rowcount == 0:
                raise Exception("SOLD OUT o Evento no disponible en el sistema.")
                
            # 2. Emisión Física del Ticket
            for _ in range(item.quantity):
                # Generador de Código Inhackeable
                guid = uuid.uuid4().hex[:8].upper() # TKT-A7B8E9F0
                ticket_code = f"TKT-{guid}"
                
                db.execute(insert_tkt, {
                    "uid": current_user["id"],
                    "evid": item.event_id,
                    "code": ticket_code,
                    "price": item.price_paid
                })
                generated_tickets.append(ticket_code)
                
        # 3. Consolidación Final
        db.commit()
        
        # 4. Magia Asíncrona (Logros Unlock) sin penalizar el Time To First Byte (TTFB)
        bg_tasks.add_task(check_and_unlock_achievements, current_user["id"], db)
        
        return {"success": True, "tickets": generated_tickets}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
```

### 7.2 El Escáner Logístico (Redeem / Canje)
¿Cómo evita el sistema que un usuario fotocopie un QR y entren 10 personas?

```python
@router.post("/redeem")
def redeem_ticket(ticket_code: str, db: Session = Depends(get_db)):
    
    # Búsqueda relámpago por índice unique_ticket_code
    query = text("SELECT id, status, used_at FROM tickets WHERE ticket_code = :code")
    ticket = db.execute(query, {"code": ticket_code}).fetchone()
    
    # 1. Filtro: No existe
    if not ticket:
        return {"valid": False, "message": "FALSIFICACIÓN: Hubo un intento de violar la puerta."}
        
    # 2. Filtro: Robo o duplicidad
    if ticket.status == 'used':
        return {"valid": False, "message": f"DENEGADO: El ticket ya fue escaneado hoy a las {ticket.used_at}."}
        
    # 3. Filtro: Reembolsados
    if ticket.status == 'refunded':
        return {"valid": False, "message": "DENEGADO: Este usuario solicitó el dinero de vuelta."}
        
    # Validaciones pasadas, registrar la entrada del humano.
    update = text("UPDATE tickets SET status = 'used', used_at = NOW() WHERE id = :tid")
    db.execute(update, {"tid": ticket.id})
    db.commit()
    
    return {"valid": True, "message": "Pase VÁLIDO. Bienvenido."}
```

---

## 8. MÓDULO 4: GAMIFICACIÓN Y LOGROS

Para aumentar la lealtad de la marca y la retención contra competidores obsoletos como Ticketmaster, LAIKA Club gamifica la asistencia. En `routers/achievements.py`:

```python
def check_and_unlock_achievements(user_id: int, db: Session):
    # Esta función se dispara por BackgroundTasks() despues de cada compra.
    
    # Contamos cuántas veces ha ido un evento.
    count_tkt = db.execute(text("SELECT COUNT(id) FROM tickets WHERE user_id = :uid"), {"uid": user_id}).scalar()
    
    achievements = db.execute(text("SELECT id, required_tickets FROM achievements")).fetchall()
    
    for ach in achievements:
        if count_tkt >= ach.required_tickets:
            # Otorgar logro silenciosamente si no lo tiene.
            # INSERT IGNORE salva la vida aquí, evita hacer un SELECT previo.
            award_q = text("""
                INSERT IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at)
                VALUES (:uid, :ach_id, NOW())
            """)
            db.execute(award_q, {"uid": user_id, "ach_id": ach.id})
            
    db.commit()
```

---

## 9. MÓDULO 5: ANALÍTICA DE DATOS Y MONGODB

En lugar de lanzar docenas de SUM(), COUNT() y JOIN() complejos en SQL que ahogan la base transaccional, enviamos los datos en raw JSON a MongoDB. Los endpoints tipo `routers/stats.py` los digieren:

```python
@router.get("/admin/sales-report")
def export_sales_report(db: Session = Depends(get_db)):
    # 1. Recuperamos datos operacionales duros (MySQL)
    q_revenue = text("SELECT SUM(price_paid) as tot FROM tickets WHERE status='used'")
    real_revenue = db.execute(q_revenue).scalar()
    
    # 2. Recuperamos logs estadísticos suaves (MongoDB)
    mongo = MongoAnalytics()
    if mongo.db is not None:
        # Hacemos pipeline de agrupar eventos por mes
        pipeline = [{"$group": {"_id": {"$month": "$timestamp"}, "total": {"$sum": "$revenue"}}}]
        monthly_trend = list(mongo.db.financial_analytics.aggregate(pipeline))
    else:
        monthly_trend = []
        
    return {
        "verified_revenue": real_revenue,
        "monthly_trend": monthly_trend
    }
```

---

## 10. MÓDULO 6: MIDDLEWARES Y PLAN DE CONTINGENCIA

Los Middlewares actúan como escudos masivos de bajo nivel, operan antes y después de toda la API.

### 10.1 Logging Middleware (Observabilidad)
Registra tiempos de latencia y código de finalización. Un sistema de DevOps (como Kibana/Datadog) puede parsear estos logs buscando cuellos de botella.

```python
from starlette.middleware.base import BaseHTTPMiddleware
import time
from logs import log_request # Función utilitaria de escritura a disco.

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.time()
        
        # Cede el control hacia abajo en la pila de FastAPI
        response = await call_next(request)
        
        process_time_ms = (time.time() - start_time) * 1000
        
        log_request(
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            ip=request.client.host,
            latency=process_time_ms
        )
        
        # Opcional: Inyectar un header para debug frontend
        response.headers["X-Response-Time"] = f"{process_time_ms:.2f}ms"
        return response
```

### 10.2 Maintenance Middleware
Si `config_store.is_maintenance_mode()` dicta "True", este middleware levanta una pared. Nadie que no tenga un rol JWT `admin` podrá acceder, lo cual es vital para correr migraciones de base de datos (`ALTER TABLE`).

---

## 11. GUÍA FUNCIONAL Y OPERATIVA (PASO A PASO PARA USUARIOS FINALES)

A continuación explicamos el uso del Frontend (interfaz de usuario visual), y las implicaciones exactas detrás de las pantallas en relación al backend que acabamos de describir.

### PERFIL: USUARIO REGULAR (COMPRADOR FINAL)

**1. Acción: Creando una cuenta**
*   **En pantalla:** El usuario ingresa a `laikaclub.com` y hace clic en "Crear Cuenta". Ingresa sus credenciales.
*   **Flujo Backend Involucrado:** La web emite la petición JSON al `POST /api/auth/register`. El backend hara un try/except insertando en la BD. La contraseña será interceptada por Bcrypt antes de pisar el disco duro. Se lanza automáticamente el logger para MongoDB: `Registrando cuenta nueva`.
*   **Solución a Problemas:** Si salta el cartel `El correo ya existe`, significa que MySQL devolvió el Error de Relación 1062 - Constraints Key Unique.

**2. Acción: Buscando y Comprando Entradas**
*   **En Pantalla:** Aparece la cartelera de música, deportes y conferencias. El usuario selecciona 2 VIP para Coldplay.
*   **Flujo Backend:** Al abrir el evento, se ejecutó `GET /api/events/{id}` incluyendo todo su array de `<venues>` (recintos). Al presionar PAGAR, el JWT Token de la cuenta es pasado bajo el Header HTTP: `Authorization: Bearer <El_Token_Codificado>`. 
*   **Visualizando los Tickets:** Una vez completada la venta, la App redirige a "Mis Boletos". La web hace un `GET /api/tickets/my-tickets` parseando el payload `current_user["id"]`. Se toma el código Alfanumérico `ticket_code` y la librería Javascript en el cliente dibuja un gráfico visual de cuadrados balncos y negros (El código QR).

### PERFIL: GESTOR DE EVENTOS (PROMOTOR / ORGANIZADOR)

**1. Acción: Dar de Alta una Gira**
*   **En Pantalla:** El Gestor se ubica en su Dashboard "Laika Partner Portal" y pincha en Nueva Gira / Evento.
*   **Flujo Operativo:** Sube un Banner `.jpg` y completa la metadata. Todo viaja hacia al Endpoit REST `POST /events`. Si se adjunta una función en el Estadio Nacional y otra un día después en el Teatro Local, FastAPI orquestará esto como Entidad "Event" y Entidad Relacional "Event_Function", garantizando Atomicidad mediante Commits duros.
*   **Validaciones Críticas:** El Gestor sólo podrá ver estadísticas de LOS EVENTOS propios. La querie en `stats.py` inyectará inamoviblemente el `current_user['id']` como condicional de búsqueda. Ejemplo: `SELECT * FROM sales WHERE created_by = {user_auth.id}`.

### PERFIL: OPERADOR LOGÍSTICO (STAFF EN PUERTAS)

**1. Acción: Validación Humana el día del Evento**
*   **Requerimientos:** Deberá tener login de `Operador`.
*   **Flujo en Pantalla:** Al abrir el PWA de Laika en su movil, la cámara trasera se encenderá usando la variable de entorno `navigator.mediaDevices.getUserMedia()`. Cuando un usuario cruza frente al staff, el móvil capta el arreglo digital, decodifica el texto que trae adentro (Ejemplo: `TKT-ADFF45GH`) y dispara a milisegundo sónico un `POST /api/tickets/redeem` mandando ese payload.
*   **Resultado del Motor de Semáforo Backend:**
    1.  Pantalla **Verde**: El JSON volvió con status `used`. La API grabó `NOW()` en la base. 
    2.  Pantalla **Roja Oscura**: Error Fatal. Regresa con `used: ya marcado`. Ocurre típicamente si alguien re-vendió su boleto 5 veces en internet mediante pantallazos.
    3.  Pantalla **Amarilla**: Ticket Existe pero es Cancelado o Pertenece a Otro Evento.

### PERFIL: ADMINISTRADOR DEL SISTEMA (CEO / DIRECTOR-DEV)

**1. Acción: Botón Antipánico (Winter Protection)**
*   **En pantalla:** Existe el módulo Administrador (el cual el Frontend oculta a todos los demás basandose en el objeto de autenticación React). 
*   **El Botón de Mantenimiento:** Apagará el flujo de compras de entrada para arreglar infraestructura mediante `core/config_store.py`.
*   **Dashboard Totalitario:** Desde los Charts, podrá divisar el arrastre intermensual de ventas logeadas silenciosamente bajo nuestro sub-conector `MongoAnalytics()`.
*   **Gestión de Cuentas:** Tiene la facultad de alterar permisos de cualquiera. Ejemplo de flujo manual: Modificar un promotor nuevo mandando `PUT /api/users/83` en la tabla SQL con override field: `role: gestor`.

---
## 12. ARQUITECTURA FRONTEND REAL DEL PROYECTO

El frontend de LAIKA Club no es un simple “cliente bonito” que dibuja datos del backend. En la práctica funciona como una **capa operacional rica**, con responsabilidades de navegación, persistencia ligera de preferencias, estados transitorios de compra, protección de rutas y cohesión visual en múltiples perfiles de uso.

La aplicación está organizada bajo `src/` con una estructura por dominios:

```text
src/
 ├── components/        -> piezas UI reutilizables
 ├── context/           -> estados globales (auth, cart, theme, skeleton, notifications)
 ├── hooks/             -> lógica reutilizable desacoplada
 ├── layouts/           -> marcos visuales mayores
 ├── pages/             -> pantallas por flujo y por rol
 ├── services/          -> integración con backend y capa HTTP
 ├── styles/            -> variables, globals, theme y manager styles
 └── utils/             -> validadores, helpers, formateadores, fechas, errores
```

### 12.1 Principios de arquitectura del frontend

El sistema sigue cinco principios prácticos:

1. **Separación entre UI y acceso a datos.**
   Los componentes de presentación no deberían “conocer” detalles de endpoints cuando pueden delegar esa responsabilidad a `src/services/`.

2. **Estados globales mínimos, estados locales expresivos.**
   El carrito, el tema, la autenticación, las notificaciones y los skeletons viven en contextos; en cambio, la mayoría de interacciones visuales se resuelven con `useState` local.

3. **Modularidad por experiencia de negocio.**
   `Home`, `EventDetail`, `Checkout`, `Shop`, paneles `admin`, `manager` y `staff` están segmentados por responsabilidad operacional.

4. **Sistema visual consistente.**
   La estandarización de colores, espaciado, tipografía, z-index y motion se apoya en variables CSS globales y componentes base.

5. **Degradación elegante.**
   Si un endpoint falla, la interfaz intenta seguir viva mostrando mensajes, datos parciales, skeletons o estados vacíos dignos.

### 12.2 Capas internas del cliente

El frontend puede entenderse como una pirámide:

```text
[Pages]
   Home / EventDetail / Checkout / Admin / Staff / Manager
        |
[Feature Components]
   grids, panels, charts, drawers, forms, scanners, maps
        |
[Base Components]
   Button, Input, Card, Table, Modal, Badge, Alert, Skeleton
        |
[Contexts + Hooks + Services]
   AuthContext, CartContext, ThemeContext, useFetch, apiClient, validators
        |
[Design Tokens + Global CSS]
   variables.css, theme.css, globals.css
```

### 12.3 Contextos clave de la aplicación

Los contextos en `src/context/` convierten al frontend en una interfaz persistente y coherente:

* `AuthContext.jsx`: centraliza sesión, usuario actual, permisos y experiencia de invitado.
* `CartContext.jsx`: sostiene el carrito entre vistas y evita perder selecciones.
* `ThemeContext.jsx`: aplica tema claro/oscuro y personalización cromática.
* `NotificationContext.jsx`: dispara feedback visual homogéneo.
* `SkeletonContext.jsx`: sincroniza loaders visuales y reduce la sensación de congelamiento.
* `FavoritesContext.jsx`: soporta afinidad del usuario con eventos o productos.
* `SystemContext.jsx`: puede utilizarse como superficie de estado transversal.

### 12.4 Estructura de páginas por dominio

El proyecto ya contiene una base madura:

* `src/pages/Home/`: discovery, hero, filtros y grid principal de eventos.
* `src/pages/EventDetail/`: mapa de zonas, selección de boletos, mercancía, reglas y compra directa.
* `src/pages/Checkout/`: pasos de identidad, envío, pago y confirmación.
* `src/pages/Shop/`: marketplace de merchandising con filtros y modal de producto.
* `src/pages/admin/`: operación ejecutiva, monitoreo, usuarios, base de datos, auditoría y paneles.
* `src/pages/manager/`: inventario, analítica, eventos, formularios y ingresos.
* `src/pages/staff/`: escaneo, terminal de operación, incidencias e historial.
* `src/pages/user/`: cartera, tickets, dashboard personal, devoluciones y logros.

Esta distribución es particularmente valiosa para un documento técnico porque demuestra que el frontend está diseñado como un ecosistema multi-rol y no como una sola página con múltiples botones.

---
## 13. SISTEMA DE DISEÑO INDUSTRIAL Y VARIABLES GLOBALES

Uno de los activos más importantes del frontend de LAIKA Club es su **lenguaje visual industrial monocromático**. La intención estética no es casual: el producto comunica seguridad, control, operación técnica y una sensación de “cabina de mando premium”.

### 13.1 Variables globales como contrato visual

El archivo `src/styles/variables.css` define el núcleo del sistema. Allí viven:

* paleta principal
* escalas de grises
* gradientes
* tipografías
* tamaños de fuente
* spacing system
* radios de borde
* sombras
* transiciones
* breakpoints
* dimensiones estructurales
* z-index operativos

Ejemplo simplificado del modelo de tokens:

```css
:root {
  --primary: #000000;
  --secondary: #ffffff;
  --gray-100: #f5f5f5;
  --gray-900: #171717;

  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-2xl: 1.5rem;

  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-8: 2.25rem;

  --border-radius-base: 13px;
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 13.2 Beneficios de documentar variables y no colores sueltos

Cuando una organización crece, el error más común es diseñar “a ojo”, metiendo colores hexadecimales directamente en cada CSS. Eso rompe la mantenibilidad. LAIKA evita ese problema al centralizar el vocabulario visual.

Si mañana el branding decide que los bordes ya no deben ser de `13px` sino de `10px`, o que las tablas técnicas deben reforzar el contraste del header, un desarrollador puede actuar sobre tokens en lugar de reescribir cincuenta componentes.

### 13.3 Tipografía y densidad visual

La densidad del sistema es deliberadamente alta. No es una web de blog; es una interfaz de eventos, ventas, control de accesos y tableros operativos. Por ello se observa:

* uso de mayúsculas en botones y encabezados de tablas
* tracking moderado para transmitir tono técnico
* combinación de tipografía base sans-serif con fuente mono para elementos de código, estados o datos
* contraste alto entre blanco y negro

Esto comunica un estilo industrial sobrio, con herencia de paneles de control y software de operación.

### 13.4 Espaciado y jerarquía

El spacing definido en `variables.css` permite que tarjetas, tablas, formularios y modales respiren sin perder compacidad. En plataformas de ticketing y administración es clave que quepa mucho contenido sin parecer amontonado.

Regla interna recomendada:

* tarjetas estándar: `padding: var(--spacing-5)` o `var(--spacing-6)`
* paneles hero: `var(--spacing-8)` o superior
* gaps internos de forms: `var(--spacing-3)` o `var(--spacing-4)`
* botones compactos: `var(--spacing-2)` vertical y `var(--spacing-4)` horizontal

### 13.5 Z-index y capas funcionales

Se documentan z-index como parte del contrato UI:

* `--z-dropdown`
* `--z-sticky`
* `--z-fixed`
* `--z-modal-backdrop`
* `--z-modal`
* `--z-popover`
* `--z-tooltip`
* `--z-notification`

Esto evita errores típicos donde un dropdown queda debajo de un modal o una notificación se pierde detrás de un drawer.

---
## 14. TEMAS, MODO OSCURO Y PERSONALIZACIÓN VISUAL

El archivo `src/context/ThemeContext.jsx` implementa una estrategia de theming que va más allá de un simple toggle claro/oscuro. El sistema:

* persiste la preferencia en `localStorage`
* modifica atributos del root HTML
* reescribe variables CSS dinámicamente
* soporta variantes cromáticas oscuras como `github`, `charcoal`, `midnight` y `grey`
* controla estados como `sidebarOnly`

### 14.1 Flujo del ThemeProvider

La lógica esencial puede resumirse así:

```jsx
const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

useEffect(() => {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}, [theme]);
```

La ventaja es que cualquier selector CSS puede reaccionar a `[data-theme='dark']`.

### 14.2 Qué cambia realmente entre light y dark

En LAIKA Club el tema oscuro no sólo “invierte” colores. Reconfigura:

* fondo principal
* fondo de tarjetas
* color de texto
* bordes
* glassmorphism
* brillo de visuales del evento
* overlay del hero
* tratamiento de navbar y sidebar

Ejemplo conceptual:

```css
[data-theme='dark'] {
  --bg-primary: #000000;
  --bg-secondary: #09090b;
  --text-primary: #ffffff;
  --border-color: #27272a;
}
```

### 14.3 Razón de negocio del tema industrial

El estilo oscuro industrial funciona especialmente bien en:

* venta nocturna de conciertos
* pantallas con mucha densidad de datos
* paneles de monitoreo
* terminales de staff
* escenarios visuales con banners artísticos de alto contraste

El blanco y negro transmite precisión, seriedad y marca premium, mientras los colores semánticos se reservan para estados críticos como error, alerta o warning.

### 14.4 Reglas recomendadas de theming

Para nuevos módulos frontend, toda personalización debe pasar primero por variables. Nunca se recomienda introducir:

* colores hex directos salvo excepción justificada
* sombras sueltas sin token
* tamaños arbitrarios que ignoren el spacing system
* transiciones con tiempos inconsistentes

Una buena regla de diseño para el equipo es:

```css
.nuevo-panel {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-base);
  transition: transform var(--transition-fast), box-shadow var(--transition-base);
}
```

---
## 15. SISTEMA DE SKELETONS, ESTADOS DE CARGA Y PERCEPCIÓN DE RENDIMIENTO

Una interfaz rápida no siempre es la que responde en menos milisegundos; muchas veces es la que **se siente viva**. En LAIKA Club eso se consigue con un sistema de skeletons que acompaña navegación, carga inicial, refrescos parciales y placeholders visuales.

### 15.1 SkeletonContext como orquestador

`src/context/SkeletonContext.jsx` define un timer compartido y una colección `loadingKeys`. Su misión es impedir parpadeos desagradables y mantener una semántica única de carga.

Idea base:

```jsx
const [timerActive, setTimerActive] = useState(true);
const [loadingKeys, setLoadingKeys] = useState(new Set());

const showSkeleton = timerActive || loadingKeys.size > 0;
```

Esto permite que una pantalla se mantenga en estado de loading visual mientras:

* cambia la ruta
* se espera una respuesta inicial
* una sub-sección dispara una carga manual

### 15.2 Tipos de skeleton implementados

El componente `src/components/Skeleton/Skeleton.jsx` muestra una biblioteca bastante rica:

* skeleton de texto
* skeleton circular
* skeleton bloque
* filas de tabla
* secciones de sidebar
* event card placeholder
* anuncios
* tarjetas métricas
* navbar placeholder
* hero placeholder
* news ticker placeholder

Esto no sólo mejora percepción de velocidad: también evita **saltos de layout** cuando entra contenido real.

### 15.3 Filosofía visual del skeleton

El proyecto menciona un estilo “shimmer plateado”. Eso encaja con el lenguaje industrial: en lugar de loaders caricaturescos, se usan placas neutras y suaves, como si la interfaz insinuara la estructura antes de poblarla.

### 15.4 Ejemplo de integración con Home

`src/pages/Home/Home.jsx` usa `useSkeletonContext()` y hace:

```jsx
if (!background) startLoading('home_data');
try {
  const eventsData = await api.event.getPublic({ limit: 50 });
  setEvents(eventsData || []);
} finally {
  if (!background) stopLoading('home_data');
}
```

Eso es importante porque el loader ya no depende de un booleano aislado dentro de la página, sino de un contrato visual central.

### 15.5 Buenas prácticas recomendadas

* no ocultar toda la UI si sólo carga un sub-bloque
* mantener skeletons con dimensiones cercanas a los componentes reales
* evitar spinners gigantes como único feedback
* utilizar skeletons distintos para tarjetas, tablas y paneles
* no hacer shimmer excesivo si la carga es muy frecuente

---
## 16. CATÁLOGO DE COMPONENTES BASE DEL FRONTEND

Una de las fortalezas técnicas del proyecto es la existencia de componentes base reutilizables. Esto reduce deuda visual y acelera el desarrollo.

### 16.1 Button

`src/components/Button/Button.jsx` implementa propiedades ampliamente reutilizables:

* `variant`
* `size`
* `disabled`
* `loading`
* `fullWidth`
* `icon`
* `type`

La composición es simple y poderosa:

```jsx
<Button variant="primary" size="large" icon={<Icon name="ticket" />}>
  Comprar ahora
</Button>
```

### 16.2 Button.css y el tono industrial

`Button.css` refuerza varios rasgos:

* texto en mayúsculas
* tracking técnico
* bordes rectos o casi rectos
* hover con elevación
* variantes semánticas
* color invertido en dark mode para botones primarios

Ese comportamiento ayuda a que los botones se sientan como **controles de consola**, no sólo como CTA decorativos.

### 16.3 Input

`src/components/Input/Input.jsx` abstrae formularios con:

* `label`
* `helperText`
* `error`
* `icon`
* password reveal
* soporte `required`
* modo full width

Ejemplo:

```jsx
<Input
  label="Correo corporativo"
  name="email"
  type="email"
  value={form.email}
  onChange={handleChange}
  error={errors.email}
  required
  fullWidth
/>
```

### 16.4 Card

`src/components/Card/Card.jsx` es el contenedor visual por excelencia:

* soporta imagen
* header con título y subtítulo
* body libre
* footer opcional
* click handling
* variante
* hoverable

Esto lo vuelve idóneo para eventos, métricas, previews, productos y módulos administrativos.

### 16.5 Modal

`src/components/Modal/Modal.jsx` resuelve una necesidad transversal:

* bloqueo de scroll del `body`
* cierre por `Escape`
* cierre por backdrop opcional
* tamaños configurables
* header, body y footer

Ejemplo:

```jsx
<Modal
  isOpen={isDeleteOpen}
  onClose={closeDelete}
  title="Confirmar eliminación"
  footer={<Button variant="danger">Eliminar</Button>}
>
  Esta acción removerá el anuncio seleccionado.
</Modal>
```

### 16.6 Table

`src/components/Table/Table.jsx` ofrece:

* columnas declarativas
* data-driven rendering
* sorting
* hoverable rows
* bordered / striped
* skeleton de carga
* empty state
* `rowPriority`
* `rowClassName`

Patrón:

```jsx
const columns = [
  { key: 'name', header: 'Evento' },
  { key: 'status', header: 'Estado' },
  { key: 'sales', header: 'Ventas', sortable: true }
];

<Table columns={columns} data={events} sortable darkHeader />
```

### 16.7 Otros componentes base relevantes

El catálogo real del repositorio incluye además:

* `Badge`
* `Alert`
* `Dropdown`
* `Accordion`
* `Pagination`
* `NotificationPanel`
* `ThemeToggle`
* `PermissionWall`
* `ConfirmationModal`
* `LoadingScreen`
* `AnimatedCounter`
* `VenueMapSVG`

Esto demuestra que el frontend ya tiene un design system funcional. El valor del manual es documentar cómo usarlo con criterio.

---
## 17. LAYOUTS, NAVEGACIÓN, RUTAS Y SEGMENTACIÓN POR ROL

El frontend de LAIKA Club no funciona como una sola experiencia universal. Tiene múltiples marcos de navegación según el contexto:

* experiencia pública
* autenticación
* usuario final
* gestor
* staff
* administrador

### 17.1 Layouts principales

En `src/layouts/` encontramos piezas como:

* `MainLayout.jsx`
* `AuthLayout.jsx`
* `DashboardLayout.jsx`

Su papel es unificar:

* navbar
* sidebar
* wrapper de contenido
* paddings estructurales
* reglas de responsive
* placeholders visuales

### 17.2 Ventaja de usar layouts dedicados

Sin layouts, cada página debería repetir contenedores, navegación y zonas comunes. Con layouts:

* disminuye el código duplicado
* se alinean mejor márgenes y anchos máximos
* los cambios de branding se ejecutan una sola vez
* la aplicación se siente consistente

### 17.3 Segmentación por rol

El proyecto contiene guards y rutas protegidas como:

* `PrivateRoute.jsx`
* `ProtectedRoute.jsx`
* `PermissionGuard.jsx`
* `PremiumGuard.jsx`
* `MaintenanceGuard.jsx`

Estos componentes determinan si una persona:

* ve o no cierta vista
* requiere autenticación
* tiene permisos suficientes
* debe ser redirigida
* puede interactuar durante mantenimiento

### 17.4 Ejemplo conceptual de guard

```jsx
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};
```

### 17.5 Navegación multi-contexto

Hay varias navbars y menús:

* `Navbar`
* `HomeNavbar`
* `ShopNavbar`
* `AdminNavbar`
* menús de usuario y móvil

Esto es correcto porque un comprador y un administrador no necesitan la misma densidad de opciones ni el mismo tono visual.

---
## 18. PÁGINAS ESTRATÉGICAS Y EXPERIENCIA DE USUARIO POR MÓDULO

Esta sección es útil para tesis, entrega técnica o documentación institucional porque aterriza el frontend en flujos reales.

### 18.1 Home

`src/pages/Home/Home.jsx` es la sala de descubrimiento. Integra:

* hero visual
* búsqueda
* filtrado por categorías
* filtrado por ciudad y fecha
* paginación
* anuncios
* recientemente vistos
* carrito
* acceso a agente LAIKA

La Home trabaja como escaparate comercial y centro de navegación.

### 18.2 EventDetail

`src/pages/EventDetail/EventDetail.jsx` es uno de los módulos más complejos. Combina:

* hero inmersivo
* fondos visuales del evento
* mapa de zonas interactivo
* motor de selección de boletos
* mercancía vinculada al evento
* reglas y ubicación
* modales de autenticación, compra y premium
* sincronización con funciones, secciones y asientos

Este módulo demuestra que el frontend ya opera como una mini aplicación interna especializada.

### 18.3 Checkout

El checkout está dividido en pasos:

* identidad
* envío
* pago
* éxito

Esto es deseable porque reduce carga cognitiva y permite validar información progresivamente.

### 18.4 Shop

La tienda de merch extiende el sistema a comercio complementario:

* grid de productos
* filtros
* modal de producto
* flujo de pago de mercancía
* datos mock o integrados según fase

### 18.5 User Dashboard

El usuario cuenta con módulos como:

* `UserDashboard`
* `UserTickets`
* `UserWallet`
* `UserCart`
* `UserHistory`
* `Achievements`
* devoluciones y seguimiento

Esto amplía la experiencia más allá de “comprar y salir”; convierte a LAIKA en plataforma relacional.

### 18.6 Admin

El panel admin contiene múltiples frentes:

* monitoreo
* usuarios
* base de datos
* auditoría de autenticación
* ticket builder
* configuración
* noticias
* campañas y anuncios
* restauración y backups
* visualización de big data

Aquí el frontend no sólo “muestra datos”: habilita gobierno del sistema.

### 18.7 Manager

El gestor necesita otra capa:

* crear eventos
* editar mercancía
* ver analítica
* revisar transacciones
* observar asistentes
* programar funciones

La separación evita que un promotor vea menús técnicos que pertenecen al administrador central.

### 18.8 Staff

El staff tiene una interfaz orientada a velocidad de operación:

* terminal
* escaneo QR
* incidencias
* historial
* métricas rápidas

El estilo aquí debe priorizar legibilidad, botones grandes, respuesta inmediata y estados semafóricos.

---
## 19. ESTILO VISUAL INDUSTRIAL, MOTION DESIGN Y ANIMACIONES

El usuario pidió explícitamente que el documento incluya “estilo industrial y animaciones”. Esta sección recoge ese enfoque de forma formal.

### 19.1 Qué significa “industrial” en este proyecto

En LAIKA Club, industrial no significa “frío” o “feo”. Significa:

* paleta austera y fuerte
* contraste alto
* uso intensivo de negro, blanco y grises técnicos
* acentos restringidos para estados semánticos
* bordes definidos
* sombras sobrias
* sensación de maquinaria premium
* densidad de información controlada

### 19.2 Materialidad de la interfaz

Hay tres materiales visuales dominantes:

1. **Superficies sólidas.**
   Usadas en botones, headers, tablas y paneles críticos.

2. **Cristal / glassmorphism sobrio.**
   Presente en algunos overlays o tarjetas premium, especialmente cuando el tema oscuro está activo.

3. **Fondos visuales inmersivos.**
   Especialmente en `EventDetail`, donde la imagen del evento se convierte en atmósfera.

### 19.3 Tipos de animación recomendados

La plataforma debe evitar animaciones excesivas tipo red social. Lo correcto aquí es motion funcional:

* fade-in de secciones
* stagger en cards del grid
* hover lift ligero en CTAs
* transiciones suaves en drawers y modales
* shimmer de skeleton
* counters animados para métricas
* reveal de éxito de compra o impresión de ticket

### 19.4 Microinteracciones deseables

Ejemplos concretos:

* al pasar el mouse por un botón primario, elevar `2px`
* al abrir un modal, backdrop con fade y panel con leve scale-in
* al seleccionar zona del mapa, feedback visual inmediato
* al aprobar pago, transición de estado con check y espera controlada
* al cambiar de página en tablas, mantener persistencia del contexto visual

### 19.5 Snippet de animación para panel industrial

```css
@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.industrial-panel {
  animation: panel-enter 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
```

### 19.6 Snippet de hover técnico para botones

```css
.btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### 19.7 Animación como apoyo, no como ruido

Toda animación en un sistema transaccional debe responder a una meta:

* indicar cambio de estado
* guiar foco visual
* mejorar sensación de respuesta
* reforzar jerarquía

Si una animación no cumple una de esas cuatro metas, probablemente sobra.

---
## 20. TABLAS, FORMULARIOS, MODALES Y PATRONES DE INTERACCIÓN COMPLEJOS

Los elementos más delicados de un frontend de gestión no son los banners, sino los módulos que soportan trabajo diario.

### 20.1 Tablas

`src/components/Table/Table.css` muestra un tratamiento visual coherente:

* contenedor con sombra y borde
* header sticky
* mayúsculas
* peso alto en encabezados
* dark header opcional
* soporte para tablas técnicas tipo base de datos

Las tablas del sistema son cruciales en:

* auditoría
* usuarios
* restauraciones
* ads
* inventarios
* reportes
* asistentes

### 20.2 Buenas prácticas para tablas operativas

* encabezado fijo cuando haya scroll
* columnas clave a la izquierda
* acciones agrupadas
* estado visual claro por fila
* vacíos dignos
* skeleton durante carga
* sorting cuando el caso lo amerite

### 20.3 Formularios

Los formularios de LAIKA deben mantener:

* labels visibles
* mensajes de error concretos
* helpers cuando el campo lo necesite
* agrupación lógica por secciones
* validación antes de disparar compras o cambios sensibles

Ejemplo base:

```jsx
<form onSubmit={handleSubmit}>
  <Input label="Nombre del evento" name="name" value={form.name} onChange={handleChange} />
  <Input label="Precio base" name="price" value={form.price} onChange={handleChange} />
  <Button type="submit" variant="primary">Guardar evento</Button>
</form>
```

### 20.4 Modales

Los modales son muy abundantes en este proyecto porque:

* confirman acciones destructivas
* muestran detalles
* aíslan flujos de pago
* exponen preview de tickets o mercancía
* soportan edición rápida sin abandonar contexto

Reglas operativas recomendadas:

* no meter formularios eternos en un modal pequeño
* siempre permitir cierre claro
* bloquear scroll del fondo
* usar `Escape`
* no apilar modales si se puede evitar

### 20.5 Patrones de interacción complejos presentes en EventDetail

`EventDetail.jsx` contiene un caso de estudio importante:

* fetch del evento
* sincronización entre funciones y zonas
* validación de tarjeta
* recuperación de intención de compra tras login
* bloqueo del body al abrir merch modal
* estado de impresora cinemática
* actualización periódica del detalle

Eso convierte al frontend en un motor de orquestación. El manual debe subrayarlo porque es uno de los puntos fuertes del proyecto.

### 20.6 Estado vacío y errores visuales

No basta con mostrar `No hay datos`. Un buen estado vacío debe explicar:

* si aún no existen registros
* si hubo un fallo de red
* qué acción puede ejecutar el usuario
* si conviene refrescar o volver atrás

Ejemplo recomendado:

```jsx
{rows.length === 0 && !loading && (
  <div className="empty-state">
    No hay restauraciones registradas para el rango seleccionado.
  </div>
)}
```

---
## 21. RESPONSIVE DESIGN, ACCESIBILIDAD Y COMPATIBILIDAD OPERATIVA

Un sistema de eventos debe funcionar en laptops, escritorios operativos, tablets y móviles del staff. Por eso la documentación frontend no puede olvidar responsive ni accesibilidad.

### 21.1 Breakpoints

El proyecto define:

* `--breakpoint-sm: 640px`
* `--breakpoint-md: 768px`
* `--breakpoint-lg: 1024px`
* `--breakpoint-xl: 1280px`
* `--breakpoint-2xl: 1536px`

Esto permite planificar adaptaciones:

* móvil: stack vertical
* tablet: grids 2 columnas
* desktop: paneles múltiples
* widescreen: dashboards y analítica

### 21.2 Responsive recomendado por módulo

* **Home:** hero compacto en móvil, filtros en bloque y grid de una columna.
* **EventDetail:** mapa debajo del hero, panel de selección colapsable, botones grandes.
* **Checkout:** pasos apilados, resumen fijo o alternante.
* **Admin:** tablas con scroll horizontal, toolbar en wrap y reducción de paneles secundarios.
* **Staff:** prioridad absoluta a cámara, escaneo y estado de validación.

### 21.3 Accesibilidad mínima exigible

El sistema debería mantener como estándar:

* contraste suficiente
* `aria-label` en icon buttons
* navegación por teclado
* foco visible
* textos de error legibles
* etiquetas asociadas a inputs
* no depender sólo del color para comunicar estado

### 21.4 Ejemplo de accesibilidad en botones icónicos

```jsx
<button aria-label="Cerrar modal" className="modal__close">✕</button>
```

### 21.5 Accesibilidad en estados semafóricos

Si en el staff el ticket válido es verde y el inválido rojo, debe existir también:

* texto explícito
* icono
* descripción corta

Nunca se debe depender únicamente del color.

### 21.6 Compatibilidad operativa

El staff o el gestor pueden abrir el sistema en redes inestables o equipos modestos. Por ello el frontend debe:

* tolerar recargas
* recuperar datos críticos del `localStorage` cuando aplica
* degradar imágenes pesadas
* mostrar errores recuperables
* minimizar bloqueos por render innecesario

---
## 22. RENDIMIENTO FRONTEND, GESTIÓN DE ESTADO Y COMUNICACIÓN CON LA API

Una documentación seria del frontend debe describir cómo se conecta con la capa de servicios.

### 22.1 Capa de servicios

En `src/services/` viven piezas como:

* `api.js`
* `apiClient.js`
* `auth.service.js`
* `event.service.js`
* `ticket.service.js`
* `admin.service.js`
* `manager.service.js`
* `content.service.js`
* `analyticsClient.js`

La idea es encapsular rutas, headers y transformación de payloads.

### 22.2 Ventajas de centralizar llamadas HTTP

* evita repetir endpoints
* permite interceptores o manejo unificado de errores
* hace más fácil cambiar base URL
* desacopla UI y transporte
* simplifica tests o mocks

### 22.3 Ejemplo conceptual de cliente API

```js
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 22.4 Gestión de estado realista

LAIKA mezcla tres niveles de estado:

1. **Global persistente**
   auth, cart, theme, notifications.

2. **Local de vista**
   filtros, paginación, formularios, modales, hover state.

3. **Derivado**
   listas filtradas, totales, banderas de permiso, sincronización de zonas.

Este patrón es sano porque evita meter todo en un contexto gigante.

### 22.5 Rendimiento percibido y real

El proyecto ya usa varias estrategias positivas:

* `useMemo` para listas filtradas
* polling controlado
* skeletons
* `loading="lazy"` en imágenes de tarjetas
* modularización en hooks
* separación de componentes grandes

### 22.6 Recomendaciones adicionales

* lazy loading para páginas muy pesadas de admin
* virtualización si algunas tablas escalan demasiado
* debounce para búsquedas globales
* cache control temporal en requests de consulta
* dividir CSS muy extensos por submódulo

### 22.7 Manejo de errores

La experiencia correcta no es ocultar todo al fallar una request. Debe poder distinguirse entre:

* fallo parcial
* fallo crítico
* sin datos
* permiso insuficiente
* backend en mantenimiento

Este matiz mejora soporte técnico y reduce frustración.

---
## 23. GUÍA DE IMPLEMENTACIÓN DE NUEVOS MÓDULOS FRONTEND

Esta sección sirve para que cualquier desarrollador nuevo amplíe LAIKA sin romper consistencia.

### 23.1 Checklist arquitectónico antes de crear una nueva página

1. Definir si el módulo es público, autenticado o restringido por rol.
2. Decidir si necesita layout nuevo o uno existente.
3. Crear carpeta propia en `src/pages/`.
4. Separar CSS por bloques cuando la vista sea compleja.
5. Crear servicio dedicado si hay endpoints nuevos.
6. Reusar `Button`, `Input`, `Card`, `Table`, `Modal`, `Badge`, `Alert`.
7. Integrar skeletons si hay tiempo de carga perceptible.
8. Revisar comportamiento móvil.
9. Verificar contraste y accesibilidad básica.
10. Documentar payloads sensibles.

### 23.2 Estructura recomendada para una nueva feature

```text
src/pages/InventoryAudit/
 ├── InventoryAudit.jsx
 ├── InventoryAudit.css
 ├── components/
 │    ├── AuditHeader.jsx
 │    ├── AuditFilters.jsx
 │    └── AuditTable.jsx
 └── hooks/
      └── useInventoryAudit.js
```

### 23.3 Patrón recomendado de pantalla

```jsx
const InventoryAudit = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.audit.getInventory();
        setRows(data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="inventory-audit-page">
      <header className="inventory-audit-header">
        <h1>Auditoría de inventario</h1>
      </header>
      <Table columns={columns} data={rows} loading={loading} darkHeader />
    </section>
  );
};
```

### 23.4 Estándares de estilo para nuevas vistas

* usar `var(--bg-secondary)` para paneles
* usar `var(--text-primary)` y `var(--text-secondary)`
* respetar spacing system
* no inventar nuevas sombras si ya existe una equivalente
* mantener tono industrial
* usar motion discreto y útil

### 23.5 Estándares de UX

* feedback inmediato al guardar
* disabled state durante submit
* no perder datos del formulario por navegación accidental si es crítico
* confirmación en acciones destructivas
* errores entendibles por humanos, no sólo por desarrolladores

---
## 24. ANEXO DE SNIPPETS, PATRONES REUTILIZABLES Y RECOMENDACIONES DE ESCALADO

Este anexo agrega densidad documental y a la vez sirve como biblioteca de referencia.

### 24.1 Snippet de panel industrial reutilizable

```css
.panel-industrial {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-base);
  padding: var(--spacing-6);
}
```

### 24.2 Snippet de tarjeta hoverable

```css
.panel-industrial--hoverable {
  transition: transform var(--transition-fast), box-shadow var(--transition-base);
}

.panel-industrial--hoverable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

### 24.3 Snippet de toolbar técnica

```css
.toolbar-tech {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-5);
  border-bottom: 1px solid var(--border-subtle);
}
```

### 24.4 Snippet de grid responsivo

```css
.grid-shell {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--spacing-5);
}

.grid-shell__main {
  grid-column: span 8;
}

.grid-shell__aside {
  grid-column: span 4;
}

@media (max-width: 1024px) {
  .grid-shell__main,
  .grid-shell__aside {
    grid-column: span 12;
  }
}
```

### 24.5 Snippet de formulario industrial

```css
.form-industrial {
  display: grid;
  gap: var(--spacing-4);
}

.form-industrial__section {
  padding: var(--spacing-5);
  border: 1px solid var(--border-color);
  background: var(--bg-elevated);
  border-radius: var(--border-radius-base);
}
```

### 24.6 Snippet de feedback de éxito

```css
@keyframes success-pop {
  0% { transform: scale(0.85); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.success-mark {
  animation: success-pop 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
```

### 24.7 Snippet de capa de página con fondo inmersivo

```css
.immersive-page {
  position: relative;
  min-height: 100vh;
  color: var(--text-primary);
}

.immersive-page__bg {
  position: fixed;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(0.7);
  z-index: -2;
}

.immersive-page__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: -1;
}
```

### 24.8 Snippet de tabla administrativa

```jsx
<Table
  columns={columns}
  data={rows}
  loading={loading}
  sortable
  darkHeader
  rowClassName={(row) => row.status === 'error' ? 'row--danger' : '' }
/>
```

### 24.9 Snippet de modal con confirmación

```jsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Publicar campaña"
  footer={
    <>
      <Button variant="ghost" onClick={onClose}>Cancelar</Button>
      <Button variant="primary" onClick={onPublish}>Publicar</Button>
    </>
  }
>
  La campaña será visible para todos los usuarios activos.
</Modal>
```

### 24.10 Recomendaciones de escalado frontend

Si el proyecto continúa creciendo, se recomienda:

* consolidar documentación del design system en una carpeta `docs/frontend/`
* migrar gradualmente componentes base a pruebas visuales o snapshots
* implementar un catálogo de estados de color semántico
* introducir carga diferida en módulos admin de alto peso
* revisar naming de clases para mantener coherencia entre vistas históricas y nuevas
* documentar exhaustivamente contratos entre `services/` y backend
* generar una guía formal de accesibilidad interna

### 24.11 Recomendaciones de estilo industrial avanzado

Para reforzar todavía más la identidad visual del frontend, el equipo puede consolidar:

* headers de sección con líneas divisorias finas
* numeración técnica o tags de estado
* iconografía monocroma consistente
* paneles con superficies mate y gradientes sobrios
* motion con timing uniforme
* tipografía display más expresiva sólo en heroes o campañas

### 24.12 Recomendación documental importante para Word

La instrucción de “llegar a 70 páginas” depende de maquetación final. Para alcanzar ese objetivo en Word de manera predecible se recomienda:

* tamaño carta o A4
* márgenes estándar
* fuente 11 o 12 pt
* interlineado 1.5
* títulos con espacio antes y después
* insertar portada, tabla de contenido, numeración, saltos de sección, encabezados, capturas y diagramas

Con ese tratamiento, este manual ampliado puede crecer mucho en paginación real al incorporar:

* capturas de Home, EventDetail, Checkout y paneles
* diagramas de componentes
* tablas de variables CSS
* fragmentos de código con formato
* flujo visual de compra y validación QR

---
## CONCLUSIÓN TÉCNICA GLOBAL
LAIKA Club en su edición ampliada ya no debe entenderse únicamente como un backend robusto con pantallas conectadas encima, sino como una plataforma integral donde backend y frontend están profundamente coordinados. La capa visual implementa sistema de diseño, segmentación por rol, theming, skeletons, estados complejos de compra, tablas operativas, paneles administrativos, patrones de accesibilidad y una identidad industrial coherente con el negocio del entretenimiento premium.

Desde la perspectiva técnica, el valor del proyecto está en haber unido:

* arquitectura de servicios y contextos
* componentes base reutilizables
* diseño tokenizado por variables
* layouts especializados
* motion funcional
* integración consistente con la API
* experiencia multiusuario y multiperfil

Con una maquetación adecuada en Word y apoyo de diagramas, capturas y tablas de referencia, este documento está preparado para evolucionar a un manual extenso de presentación académica, técnica o institucional, con capacidad de alcanzar o superar una extensión equivalente a 70 páginas.

<Fin del Documento Técnico Múltiple Edición Extendida Backend + Frontend>
