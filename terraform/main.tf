# ==============================================================================
# INFRAESTRUCTURA COMO CÓDIGO (TERRAFORM) - LAIKA CLUB EN AZURE
# Optimizado para presupuesto de $100 USD / 3 meses sin degradación de rendimiento
# ==============================================================================

# Sufijo aleatorio para garantizar nombre DNS único a nivel global
resource "random_string" "dns_suffix" {
  length  = 6
  special = false
  upper   = false
}

# 1. Resource Group
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

# 2. Virtual Network (10.0.0.0/16)
resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-laikaclub"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = var.vnet_address_space
  tags                = var.tags
}

# 3. Subnet de Producción (10.0.1.0/24)
resource "azurerm_subnet" "subnet" {
  name                 = "snet-app-prod"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = var.subnet_address_prefix
}

# 4. Network Security Group (Firewall)
resource "azurerm_network_security_group" "nsg" {
  name                = "nsg-laikaclub"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = var.tags

  # Regla 1: Tráfico Web HTTP
  security_rule {
    name                       = "Allow-HTTP-80"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Regla 2: Tráfico Web Seguro HTTPS
  security_rule {
    name                       = "Allow-HTTPS-443"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Regla 3: Acceso Administrativo SSH
  security_rule {
    name                       = "Allow-SSH-22"
    priority                   = 120
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = var.allowed_ssh_ip
    destination_address_prefix = "*"
  }
}

# 5. Asociación de NSG a la Subred
resource "azurerm_subnet_network_security_group_association" "nsg_assoc" {
  subnet_id                 = azurerm_subnet.subnet.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

# 6. Dirección IP Pública Estática con Subdominio Gratuito (*.cloudapp.azure.com)
resource "azurerm_public_ip" "pip" {
  name                = "pip-laikaclub"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
  domain_name_label   = "${var.dns_prefix}-${random_string.dns_suffix.result}"
  tags                = var.tags
}

# 7. Interfaz de Red (NIC)
resource "azurerm_network_interface" "nic" {
  name                = "nic-laikaclub"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = var.tags

  ip_configuration {
    name                          = "ipconfig-laikaclub"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.pip.id
  }
}

# 8. Generación Automatizada de Par de Llaves SSH (RSA 4096)
resource "tls_private_key" "ssh" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Guarda la llave privada localmente en formato .pem para conexión inmediata
resource "local_file" "private_key" {
  content         = tls_private_key.ssh.private_key_pem
  filename        = "${path.module}/laikaclub_ssh_key.pem"
  file_permission = "0600"
}

# 9. Máquina Virtual Linux Principal (All-in-One Host)
resource "azurerm_linux_virtual_machine" "vm" {
  name                  = "vm-laikaclub-prod"
  location              = azurerm_resource_group.rg.location
  resource_group_name   = azurerm_resource_group.rg.name
  network_interface_ids = [azurerm_network_interface.nic.id]
  size                  = var.vm_size
  admin_username        = var.admin_username
  tags                  = var.tags

  # Autenticación SSH segura
  admin_ssh_key {
    username   = var.admin_username
    public_key = tls_private_key.ssh.public_key_openssh
  }

  # Disco del Sistema Operativo optimizado (32 GB Standard SSD = $2.40/mes)
  os_disk {
    name                 = "osdisk-laikaclub"
    caching              = "ReadWrite"
    storage_account_type = "StandardSSD_LRS"
    disk_size_gb         = var.os_disk_size_gb
  }

  # Imagen Base Ubuntu Server 22.04 LTS Gen2
  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  # Aprovisionamiento inicial con script de arranque (Swap 8GB, Docker, Nginx, Node)
  custom_data = filebase64("${path.module}/scripts/cloud-init.sh")
}

# 10. Alerta de Presupuesto en Azure (FinOps Protection)
resource "azurerm_consumption_budget_resource_group" "budget" {
  name              = "budget-laikaclub-protection"
  resource_group_id = azurerm_resource_group.rg.id
  amount            = var.budget_amount
  time_grain        = "Monthly"

  time_period {
    start_date = formatdate("YYYY-MM-01'T'00:00:00Z", timestamp())
  }

  # Alerta 1: Notificar al llegar al 80% del presupuesto
  notification {
    enabled        = true
    threshold      = 80.0
    operator       = "GreaterThan"
    threshold_type = "Actual"
    contact_emails = [var.notification_email]
  }

  # Alerta 2: Notificar de urgencia al llegar al 95%
  notification {
    enabled        = true
    threshold      = 95.0
    operator       = "GreaterThan"
    threshold_type = "Actual"
    contact_emails = [var.notification_email]
  }
}
