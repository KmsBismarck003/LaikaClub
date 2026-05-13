/**
 * @file UXContext.jsx
 * @description Contexto global de configuración de experiencia de usuario (UX).
 *
 * Proporciona control centralizado sobre:
 *  - Animaciones (activar/desactivar)
 *  - Motion reducido (respeta prefers-reduced-motion del SO)
 *  - Densidad de la interfaz
 *  - Estado del sidebar
 *  - Configuraciones visuales personalizables
 *
 * PRINCIPIO: Este contexto es el único lugar donde se gestiona la configuración
 * visual global. Ningún componente debe manejar estas preferencias localmente.
 *
 * @layer context
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { UX_CONFIG } from '../core/config/app.config'

// ─── Context Creation ─────────────────────────────────────────────────────────

const UXContext = createContext(null)

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  animations: 'ux_animations',
  density: 'ux_density',
  sidebarCollapsed: 'ux_sidebar_collapsed',
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const getStoredValue = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key)
    if (stored === null) return fallback
    if (stored === 'true') return true
    if (stored === 'false') return false
    return stored
  } catch {
    return fallback
  }
}

const storeValue = (key, value) => {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // localStorage no disponible (modo privado, etc.)
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const UXProvider = ({ children }) => {
  // Detecta preferencia del sistema operativo para reducir movimiento
  const systemPrefersReducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const [animationsEnabled, setAnimationsEnabled] = useState(() =>
    systemPrefersReducedMotion
      ? false
      : getStoredValue(STORAGE_KEYS.animations, UX_CONFIG.animationsDefault)
  )

  const [density, setDensityState] = useState(() =>
    getStoredValue(STORAGE_KEYS.density, UX_CONFIG.densityDefault)
  )

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    getStoredValue(STORAGE_KEYS.sidebarCollapsed, false)
  )

  // ─── Aplicar variables CSS globales ─────────────────────────────────────

  useEffect(() => {
    const root = document.documentElement

    // Control de animaciones vía CSS custom property
    root.style.setProperty(
      '--animation-duration-factor',
      animationsEnabled ? '1' : '0'
    )
    root.style.setProperty(
      '--transition-duration-factor',
      animationsEnabled ? '1' : '0'
    )
    root.setAttribute('data-animations', animationsEnabled ? 'on' : 'off')
  }, [animationsEnabled])

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density)
  }, [density])

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-sidebar',
      sidebarCollapsed ? 'collapsed' : 'expanded'
    )
  }, [sidebarCollapsed])

  // ─── Acciones ────────────────────────────────────────────────────────────

  const toggleAnimations = useCallback(() => {
    setAnimationsEnabled(prev => {
      const next = !prev
      storeValue(STORAGE_KEYS.animations, next)
      return next
    })
  }, [])

  const setDensity = useCallback((newDensity) => {
    const valid = ['compact', 'comfortable', 'spacious']
    if (!valid.includes(newDensity)) {
      console.warn(`[UXContext] Densidad inválida: "${newDensity}". Usar: ${valid.join(' | ')}`)
      return
    }
    setDensityState(newDensity)
    storeValue(STORAGE_KEYS.density, newDensity)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev
      storeValue(STORAGE_KEYS.sidebarCollapsed, next)
      return next
    })
  }, [])

  const resetUXSettings = useCallback(() => {
    setAnimationsEnabled(UX_CONFIG.animationsDefault)
    setDensityState(UX_CONFIG.densityDefault)
    setSidebarCollapsed(false)
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
  }, [])

  // ─── Valor del Contexto ──────────────────────────────────────────────────

  const value = useMemo(
    () => ({
      // Estado
      animationsEnabled,
      reducedMotion: systemPrefersReducedMotion,
      density,
      sidebarCollapsed,

      // Acciones
      toggleAnimations,
      setDensity,
      toggleSidebar,
      resetUXSettings,

      // Helpers para uso condicional en estilos
      getTransition: (duration = '0.3s', easing = 'ease') =>
        animationsEnabled ? `${duration} ${easing}` : 'none',
    }),
    [
      animationsEnabled,
      systemPrefersReducedMotion,
      density,
      sidebarCollapsed,
      toggleAnimations,
      setDensity,
      toggleSidebar,
      resetUXSettings,
    ]
  )

  return <UXContext.Provider value={value}>{children}</UXContext.Provider>
}

// ─── Hook de Consumo ─────────────────────────────────────────────────────────

export const useUX = () => {
  const context = useContext(UXContext)
  if (!context) {
    throw new Error('[useUX] Debe usarse dentro de <UXProvider>. Verifica el árbol de providers en App.jsx.')
  }
  return context
}

export default UXContext
