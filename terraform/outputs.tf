output "resource_group_name" {
  description = "Nombre del Resource Group creado"
  value       = azurerm_resource_group.rg.name
}

output "public_ip_address" {
  description = "Dirección IP pública estática asignada a la VM"
  value       = azurerm_public_ip.pip.ip_address
}

output "public_fqdn" {
  description = "Dominio DNS público gratuito proporcionado por Azure"
  value       = azurerm_public_ip.pip.fqdn
}

output "ssh_connection_command" {
  description = "Comando listo para conectarse por SSH usando la llave privada generada"
  value       = "ssh -i laikaclub_ssh_key.pem ${var.admin_username}@${azurerm_public_ip.pip.fqdn}"
}

output "url_portal_web" {
  description = "URL de acceso a la Web Principal de Clientes"
  value       = "http://${azurerm_public_ip.pip.fqdn}/"
}

output "url_portal_admin" {
  description = "URL de acceso al Portal Administrador (laika-admin)"
  value       = "http://${azurerm_public_ip.pip.fqdn}/admin/"
}

output "url_portal_gestor" {
  description = "URL de acceso al Portal Gestor (laika-gestor)"
  value       = "http://${azurerm_public_ip.pip.fqdn}/gestor/"
}

output "url_portal_operador" {
  description = "URL de acceso a la Terminal del Operador (laika-operador)"
  value       = "http://${azurerm_public_ip.pip.fqdn}/operador/"
}

output "url_api_gateway" {
  description = "URL de estado de salud del API Gateway Pilgrim"
  value       = "http://${azurerm_public_ip.pip.fqdn}/api/health"
}

output "estimado_costo_mensual" {
  description = "Costo estimado mensual en Azure con la configuración FinOps"
  value       = "~$30.14 USD/mes (Duración calculada: 3.3 meses con $100 USD)"
}
