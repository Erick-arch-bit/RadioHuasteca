import { BellRing, BookOpen, Home, Info } from 'lucide-react'

// ---------------------------------------------------------------------------
// RadioHuasteca · Navegación del Sprint 1 (HU-02)
// Solo iconos + clave de texto. Las etiquetas viven en src/i18n/translations.js
// para no mezclar contenido con estructura.
// ---------------------------------------------------------------------------

export const homeItem = { id: 'inicio', labelKey: 'navHome', Icon: Home, primary: true }

export const navigationItems = [
  homeItem,
  { id: 'avisos', labelKey: 'navNotices', Icon: BellRing, primary: false },
  { id: 'tramites', labelKey: 'navProcedures', Icon: BookOpen, primary: false },
  { id: 'sobre', labelKey: 'navAbout', Icon: Info, primary: false },
]

/** Destinos secundarios: alimentan los accesos rápidos y el menú móvil. */
export const secondaryItems = navigationItems.filter((item) => !item.primary)

export function findNavigationItem(id) {
  return navigationItems.find((item) => item.id === id) ?? homeItem
}
