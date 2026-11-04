# PLAN MAESTRO DE DESPLIEGUE A PRODUCCIÓN - LAIKA CLUB

**Proyecto:** Ecosistema LAIKA Club (Microservicios Spring Boot, Pilgrim API Gateway, PySpark ML, React & Frontends Desacoplados)  
**Versión:** 2.0.0 (Producción)  
**Fecha:** Noviembre 2026  
**Rama Activa de Git:** `development`  
**Entorno Cloud:** Microsoft Azure (Máquina Virtual All-in-One: `Standard_B2ps_v2` ARM64 en `southcentralus`) + Vercel Edge Network  
**Presupuesto Asignado:** $100.00 USD (Créditos de Estudiante - 3.5 Meses Continuos a ~$28.03 USD/mes)  
**Host Público:** `40.124.6.253` (`laikaclub-nzhwq8.southcentralus.cloudapp.azure.com`)  
**Resource Group:** `rg-laikaclub` (Región: `southcentralus`)  
**Alerta FinOps:** Activa a los $85.00 USD vía Azure Consumption Budgets  

---

## 1. REPOSITORIOS DEL ECOSISTEMA (CATÁLOGO OFICIAL)

| Componente | Tipo | Repositorio GitHub | Rol en el Sistema |
| :--- | :--- | :--- | :--- |
| **LaikaClub (Core)** | Monorepo Backend / Web | `https://github.com/KmsBismarck003/LaikaClub.git` | 8 Microservicios Java Spring Boot, PySpark ML, Web Principal React, MySQL y Terraform. |
| **Pilgrim API Gateway** | Gateway FastAPI | `https://github.com/KmsBismarck003/PilgrimAPI.git` | Fachada única, proxy inverso, validación JWT y enrutador de tráfico por roles. |
| **laika-admin** | Portal Vite / React | `https://github.com/KmsBismarck003/laika-admin.git` | Panel maestro: monitoreo, auditoría, base de datos y anuncios publicitarios. |
| **laika-gestor** | Portal Vite / React | `https://github.com/KmsBismarck003/laika-gestor.git` | Panel de organizador: eventos, aforos, recaudación y analíticas en tiempo real. |
| **laika-operador** | Portal Vite / React | `https://github.com/KmsBismarck003/laika-operador.git` | Terminal de taquilla y acceso en puerta (`StaffTerminal`), escaneo QR y validación. |

---

## 2. ARQUITECTURA DE PRODUCCIÓN (AZURE + VERCEL)

```
                            [ USUARIOS & DISPOSITIVOS ]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼ (Frontends / UI)                              ▼ (Tráfico API / Base de Datos)
       [ VERCEL EDGE CDN ($0) ]                    [ HOST AZURE: Standard_B2ps_v2 (8GB RAM, ~$28/mes) ]
        * Web Principal (/)                         * NGINX Reverse Proxy (Puertos 80 / 443 SSL)
        * Admin (/admin)                            * Let's Encrypt Certbot (HTTPS Universal)
        * Gestor (/gestor)                          * Archivos Persistentes (/uploads)
        * Operador (/operador)                                          │
                                                                        ▼
                                                        [ PILGRIM API GATEWAY :8000 ]
                                                                        │
                                            ┌───────────────────────────┴───────────────────────────┐
                                            ▼                                                       ▼
                                [ 8 MICROSERVICIOS JAVA ]                               [ PYSPARK ML & BIG DATA ]
                                 * auth :8101        * admin :8102                       * analytics_bigdata :8303
                                 * stats :8103       * events :8201                                 │
                                 * tickets :8202     * merchandise :8203                            ▼
                                 * achieve :8301     * analytics :8302                  [ PERSISTENCIA RELACIONAL ]
                                            │                                            * MySQL 8.0 (:3306)
                                            └──────────────────────────────────────────> * laika_db.sql (8 Esquemas)
```

---

## 3. CHECKLIST PREVIO AL DESPLIEGUE (PASO A PASO)

### PASO 1: Subir los cambios del Core a GitHub (Desde tu PC)
Asegúrate de confirmar los archivos de infraestructura y la base de datos en tu rama `development`:

```powershell
# En la raíz de LaikaClub:
git status
git add .
git commit -m "chore(prod): preparar infraestructura terraform, docker prod y script de despliegue"
git push origin development
```

*(Nota: Los repositorios `PilgrimAPI`, `laika-admin`, `laika-gestor` y `laika-operador` ya se encuentran actualizados en sus respectivas ramas `development`).*

---

### PASO 2: Aprovisionar Infraestructura en Azure con Terraform
Desde tu computadora local o Azure Cloud Shell:

```powershell
cd terraform

# 1. Iniciar sesión en Azure
az login

# 2. Configurar variables
cp terraform.tfvars.example terraform.tfvars
# (Edita terraform.tfvars si deseas cambiar el email de alertas FinOps)

# 3. Inicializar y aplicar
terraform init
terraform plan
terraform apply -auto-approve
```

**Resultados obtenidos al finalizar:**
* **FQDN / Dominio DNS:** `laikaclub-xxxxxx.eastus.cloudapp.azure.com`
* **IP Pública:** Dirección IPv4 estática asignada.
* **Llave SSH:** Se genera automáticamente el archivo `laikaclub_ssh_key.pem` con permisos `0600`.

---

### PASO 3: Conexión SSH y Despliegue Automatizado en Azure
Conéctate a la máquina virtual recién creada y ejecuta el despliegue con un solo comando:

```bash
# Conexión SSH desde tu terminal local (donde se ubica laikaclub_ssh_key.pem)
ssh -i laikaclub_ssh_key.pem azureuser@tu-dominio.eastus.cloudapp.azure.com

# Clonar el proyecto principal
sudo git clone -b development https://github.com/KmsBismarck003/LaikaClub.git /app/laika
cd /app/laika

# Ejecutar el script maestro de despliegue automático
sudo bash deploy_remote.sh
```

**¿Qué hace automáticamente `deploy_remote.sh`?**
1. Clona y sincroniza `PilgrimAPI.git` en `/app/laika/pilgrim`.
2. Genera `.env.production` con las variables optimizadas.
3. Configura NGINX con las rutas de API, uploads y roles.
4. Levanta MySQL 8.0 (importando automáticamente `laika_db.sql`).
5. Compila y levanta los 8 microservicios Java y el worker de Machine Learning.
6. Realiza un chequeo de salud contra Pilgrim (`/api/health`).

---

### PASO 4: Activar Certificado SSL / HTTPS Gratuito
En la misma consola SSH del servidor:

```bash
sudo certbot --nginx -d tu-dominio.eastus.cloudapp.azure.com --non-interactive --agree-tos -m tu-correo@gmail.com --redirect
```

---

### PASO 5: Vincular los Frontends en Vercel
En la consola de [Vercel](https://vercel.com):

1. **Importar los 4 proyectos de GitHub:**
   * **laika-web:** Repositorio `KmsBismarck003/LaikaClub`, Root `./`, build `npm run build`, salida `build`.
   * **laika-admin:** Repositorio `KmsBismarck003/laika-admin`, Root `./`, build `npm run build`, salida `dist`.
   * **laika-gestor:** Repositorio `KmsBismarck003/laika-gestor`, Root `./`, build `npm run build`, salida `dist`.
   * **laika-operador:** Repositorio `KmsBismarck003/laika-operador`, Root `./`, build `npm run build`, salida `dist`.

2. **Configurar la Variable de Entorno en los 4 Proyectos:**
   * **Variable:** `REACT_APP_API_URL` (para `laika-web`) o `VITE_API_URL` (para Vite: admin, gestor, operador).
   * **Valor:** `https://tu-dominio.eastus.cloudapp.azure.com/api`

---

## 4. MATRIZ DE PRECIOS Y PROTECCIÓN FINOPS ($100 USD)

| Recurso en Azure | Tarifa Horaria / Mensual | Gasto Mensual (730 hrs) | Gasto Total (3 Meses) |
| :--- | :---: | :---: | :---: |
| **VM `Standard_B2ats_v2` (2 vCPU, 4 GB RAM)** | $0.034 USD/hr | **$24.82 USD** | **$74.46 USD** |
| **Disco SSD 32 GB (`StandardSSD_LRS`)** | Tarifa fija mensual | **$2.40 USD** | **$7.20 USD** |
| **IP Pública IPv4 Estática** | $0.004 USD/hr | **$2.92 USD** | **$8.76 USD** |
| **Red VNet, Subred y NSG** | Gratuito | **$0.00 USD** | **$0.00 USD** |
| **Dominio DNS `*.cloudapp.azure.com`** | Incluido | **$0.00 USD** | **$0.00 USD** |
| **Vercel Edge Network (Frontends)** | Free Tier | **$0.00 USD** | **$0.00 USD** |
| **TOTAL OPERATIVO MENSUAL** | | **$30.14 USD** | |
| **TOTAL FACTURABLE (3 MESES)** | | | **$90.42 USD** |
| **MARGEN DE CRÉDITO RESTANTE** | | | **+$9.58 USD** |

*Alerta Automática de Presupuesto configurada en Terraform a los **$85.00 USD** para garantizar cero cobros no deseados.*

---

## 5. COMANDOS RÁPIDOS DE MANTENIMIENTO EN EL SERVIDOR

```bash
# Ver consumo de RAM y CPU de todos los microservicios en vivo:
docker stats --no-stream

# Actualizar el backend tras un 'git push' en desarrollo:
cd /app/laika && git pull origin development && sudo bash deploy_remote.sh

# Ver logs en tiempo real del API Gateway:
docker logs -f laika_gateway

# Ver logs de un microservicio específico (ej. tickets):
docker logs -f laika_tickets
```

