variable "location" {
  description = "Región de Azure donde se desplegarán los recursos (ej. eastus, eastus2)"
  type        = string
  default     = "eastus"
}

variable "resource_group_name" {
  description = "Nombre del Resource Group principal de Laika Club"
  type        = string
  default     = "rg-laikaclub-prod"
}

variable "vnet_address_space" {
  description = "Espacio de direcciones CIDR para la VNet"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "subnet_address_prefix" {
  description = "Prefijo CIDR para la subred de aplicaciones y servicios"
  type        = list(string)
  default     = ["10.0.1.0/24"]
}

variable "vm_size" {
  description = "Tamaño de la VM optimizado para presupuesto de estudiante ($24.82/mes)"
  type        = string
  default     = "Standard_B2ats_v2" # AMD EPYC 2 vCPU, 4 GB RAM
}

variable "os_disk_size_gb" {
  description = "Tamaño del disco del sistema operativo (32 GB Standard SSD = $2.40/mes)"
  type        = number
  default     = 32
}

variable "admin_username" {
  description = "Nombre de usuario administrador de Linux para la conexión SSH"
  type        = string
  default     = "azureuser"
}

variable "dns_prefix" {
  description = "Prefijo para la etiqueta DNS pública (laikaclub-<suffix>.eastus.cloudapp.azure.com)"
  type        = string
  default     = "laikaclub"
}

variable "allowed_ssh_ip" {
  description = "Dirección IP o rango CIDR autorizado para SSH (usar '*' para acceso abierto o tu IP pública para mayor seguridad)"
  type        = string
  default     = "*"
}

variable "notification_email" {
  description = "Correo electrónico para recibir alertas del presupuesto de $100 USD en Azure"
  type        = string
  default     = "al222310440@gmail.com"
}

variable "budget_amount" {
  description = "Límite máximo de presupuesto en USD para activar alertas antes de agotar los $100"
  type        = number
  default     = 85.0
}

variable "tags" {
  description = "Etiquetas comunes para trazabilidad de costos FinOps"
  type        = map(string)
  default = {
    Project     = "LaikaClub"
    Environment = "Production"
    ManagedBy   = "Terraform"
    CostCenter  = "StudentCredits100"
  }
}
