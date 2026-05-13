/**
 * @file useSidebar.js
 * @description Hook que encapsula TODA la lógica del sidebar del dashboard.
 *
 * PRINCIPIO SRP: Extraído de DashboardLayout.jsx para separar completamente
 * la lógica de UI del renderizado del layout.
 *
 * Responsabilidades:
 *  - Cargar/guardar orden del sidebar en localStorage
 *  - Detectar versiones desactualizadas y resetear
 *  - Filtrar items por rol y permisos del usuario
 *  - Manejar drag & drop para reordenar items
 *  - Controlar secciones colapsables (admin supervision)
 *  - Filtrar por búsqueda en tiempo real
 *
 * @layer features/admin/hooks
 */

import { useState, useCallback, useMemo } from 'react'
import {
  DEFAULT_ADMIN_SECTIONS,
  GESTOR_SIDEBAR_ITEMS,
  OPERADOR_SIDEBAR_ITEMS,
  ADMIN_SUPERVISION_SECTIONS,
  SIDEBAR_STORAGE_KEY,
  SIDEBAR_VERSION_SENTINEL
} from '../constants/sidebarSections'

// ─── Utilidades de persistencia ───────────────────────────────────────────────

const loadSidebarFromStorage = () => {
  try {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (!saved) return null
    const parsed = JSON.parse(saved)

    // Verificar que la versión guardada contiene el item centinela
    const hasSentinel = parsed.some(section =>
      section.items?.some(item => item.id === SIDEBAR_VERSION_SENTINEL)
    )
    // Verificar estructura mínima
    const isValidStructure = parsed[0]?.id === 'control_central'

    if (!isValidStructure || !hasSentinel) {
      localStorage.removeItem(SIDEBAR_STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

const saveSidebarToStorage = (sections) => {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(sections))
  } catch {
    // localStorage no disponible
  }
}

// ─── Hook Principal ───────────────────────────────────────────────────────────

/**
 * Hook que gestiona el estado y la lógica del sidebar del dashboard.
 *
 * @param {Object} user - Usuario autenticado actual
 * @returns {Object} Estado y handlers del sidebar
 */
const useSidebar = (user) => {
  // ── Estado base: secciones del sidebar (con persistencia) ──────────────────
  const [sidebarSections, setSidebarSections] = useState(() => {
    return loadSidebarFromStorage() || DEFAULT_ADMIN_SECTIONS
  })

  // ── Estado de secciones colapsables (supervisión admin) ────────────────────
  const [expandedSections, setExpandedSections] = useState({
    gestor: false,
    operador: false,
    usuario: false
  })

  // ── Estado de búsqueda ─────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('')

  // ── Estado de drag & drop ──────────────────────────────────────────────────
  const [draggedItem, setDraggedItem] = useState(null)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const hasPermission = useCallback((permissionKey) => {
    if (!user) return false
    if (user.role === 'admin') return true
    if (!user.permissions) return true
    return !!user.permissions[permissionKey]
  }, [user])

  const toggleSection = useCallback((sectionKey) => {
    setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))
  }, [])

  // ── Items filtrados por rol del usuario ────────────────────────────────────

  const roleBasedItems = useMemo(() => {
    if (!user) return []

    if (user.role === 'gestor') return GESTOR_SIDEBAR_ITEMS
    if (user.role === 'operador') return OPERADOR_SIDEBAR_ITEMS

    if (user.role === 'usuario') {
      const userItems = [
        { id: 'u_tickets',      path: '/user/tickets',      icon: 'ticket',  label: 'Mis Boletos',    adnPermission: 'canViewMyTickets' },
        { id: 'u_history',      path: '/user/history',      icon: 'history', label: 'Historial',      adnPermission: 'canViewMyHistory' },
        { id: 'u_achievements', path: '/user/achievements', icon: 'star',    label: 'Mis Logros',     adnPermission: 'canViewAchievements' },
        { id: 'u_refunds',      path: '/user/refunds',      icon: 'refresh', label: 'Reembolsos',     adnPermission: 'canRequestRefunds' },
        { id: 'u_vip',          path: '/user/profile',      icon: 'shield',  label: 'Área VIP',       adnPermission: 'canUseVipServices' }
      ].filter(item => hasPermission(item.adnPermission))

      return [{ id: 'u_main', label: 'MI LAIKA', items: userItems }]
    }

    // Admin: base sections + supervision sections (con estado colapsable)
    const supervisionWithState = ADMIN_SUPERVISION_SECTIONS.map(section => ({
      ...section,
      isExpanded: expandedSections[section.id.replace('super_', '')],
      onToggle: () => toggleSection(section.id.replace('super_', ''))
    }))

    return [...sidebarSections, ...supervisionWithState]
  }, [user, sidebarSections, expandedSections, toggleSection, hasPermission])

  // ── Items filtrados por búsqueda ───────────────────────────────────────────

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return roleBasedItems

    return roleBasedItems
      .map(section => ({
        ...section,
        items: (section.items || []).filter(item =>
          item.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter(section => section.items.length > 0)
  }, [roleBasedItems, searchTerm])

  // ── Drag & Drop handlers ───────────────────────────────────────────────────

  const handleDragStart = useCallback((e, sectionId, itemId) => {
    setDraggedItem({ sectionId, itemId })
    e.dataTransfer.effectAllowed = 'move'
    e.target.style.opacity = '0.5'
  }, [])

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = '1'
    setDraggedItem(null)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e, targetSectionId, targetItemId) => {
    e.preventDefault()
    if (!draggedItem) return

    const newSections = JSON.parse(JSON.stringify(sidebarSections))
    const sourceSection = newSections.find(s => s.id === draggedItem.sectionId)
    const targetSection = newSections.find(s => s.id === targetSectionId)

    if (!sourceSection || !targetSection) return

    const sourceIdx = sourceSection.items.findIndex(i => i.id === draggedItem.itemId)
    const targetIdx = targetSection.items.findIndex(i => i.id === targetItemId)

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const [movedItem] = sourceSection.items.splice(sourceIdx, 1)
      targetSection.items.splice(targetIdx, 0, movedItem)
      setSidebarSections(newSections)
      saveSidebarToStorage(newSections)
    }
  }, [draggedItem, sidebarSections])

  // ── Reset del sidebar ──────────────────────────────────────────────────────

  const resetSidebar = useCallback(() => {
    localStorage.removeItem(SIDEBAR_STORAGE_KEY)
    setSidebarSections(DEFAULT_ADMIN_SECTIONS)
  }, [])

  // ── Draggable check ────────────────────────────────────────────────────────

  const isDraggable = useCallback((section) => {
    return user?.role === 'admin' && !section.isCollapsible
  }, [user])

  return {
    // Estado
    filteredItems,
    searchTerm,
    setSearchTerm,
    draggedItem,

    // Drag & Drop
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    isDraggable,

    // Sidebar control
    resetSidebar
  }
}

export default useSidebar
