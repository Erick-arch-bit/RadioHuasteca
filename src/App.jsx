import { useCallback, useRef, useState } from 'react'
import { Settings } from 'lucide-react'
import { BulletinAudio } from './components/BulletinAudio'
import { BulletinCard } from './components/BulletinCard'
import { BottomNav } from './components/BottomNav'
import { InnerView } from './components/InnerView'
import { LanguageDraftNotice } from './components/LanguageDraftNotice'
import { MobileMenu } from './components/MobileMenu'
import { QuickNav } from './components/QuickNav'
import { TopBar } from './components/TopBar'
import { WelcomeBlock } from './components/WelcomeBlock'
import { audioSources } from './data/bulletin'
import { findNavigationItem, homeItem } from './data/navigation'
import { useBulletinAudio } from './hooks/useBulletinAudio'
import { defaultLocale, getCopy, isDraftLocale } from './i18n/translations'

// ---------------------------------------------------------------------------
// RadioHuasteca · Estructura inicial del Sprint 1
// HU-02 navegación · HU-03 último boletín · HU-12 mobile-first · HU-13 bilingüe
// Especificación y criterios de aceptación: docs/sprint-1-spec.md
//
// El elemento <audio> se monta aquí, en la raíz, para que navegar entre vistas
// no interrumpa el boletín (CA-02n.4).
// ---------------------------------------------------------------------------

function App() {
  const [locale, setLocale] = useState(defaultLocale)
  const [activeView, setActiveView] = useState(homeItem.id)
  const [menuOpen, setMenuOpen] = useState(false)
  const bulletinAudioRef = useRef(null)
  const player = useBulletinAudio(bulletinAudioRef)

  const copy = getCopy(locale)
  const currentItem = findNavigationItem(activeView)
  const isHome = activeView === homeItem.id
  const isDraft = isDraftLocale(locale)

  const goTo = useCallback((view) => {
    setActiveView(view)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goHome = useCallback(() => goTo(homeItem.id), [goTo])
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), [])

  return (
    <div
      data-testid="app-shell"
      data-locale={locale}
      data-translation-status={isDraft ? 'draft' : 'reviewed'}
      className="min-h-svh min-w-80 overflow-x-hidden bg-cream bg-[radial-gradient(circle_at_90%_8%,rgba(242,184,75,.22),transparent_22rem)]"
    >
      <BulletinAudio
        audioRef={bulletinAudioRef}
        onError={player.reportSourceError}
        sources={audioSources}
      />

      {menuOpen ? (
        <button
          type="button"
          data-testid="menu-backdrop"
          aria-label={copy.closeMenu}
          onClick={closeMenu}
          className="fixed inset-0 z-30 cursor-default border-0 bg-ink/25 desk:hidden"
        />
      ) : null}

      <TopBar
        copy={copy}
        locale={locale}
        menuOpen={menuOpen}
        onGoHome={goHome}
        onSelectLocale={setLocale}
        onToggleMenu={toggleMenu}
      >
        {menuOpen ? <MobileMenu copy={copy} onClose={closeMenu} onSelect={goTo} /> : null}
      </TopBar>

      {isDraft ? <LanguageDraftNotice copy={copy} /> : null}

      <main className="mx-auto w-[min(100%-26px,980px)] pt-[42px] pb-[126px] desk:w-[min(100%-36px,980px)] desk:pt-[62px]">
        {isHome ? (
          <>
            <WelcomeBlock copy={copy} />
            <BulletinCard copy={copy} player={player} sources={audioSources} />
            <QuickNav copy={copy} onSelect={goTo} />
          </>
        ) : (
          <InnerView copy={copy} item={currentItem} onGoHome={goHome} />
        )}
      </main>

      <footer className="flex items-center justify-center gap-1.5 p-2.5 text-[10px] text-ink/50">
        <Settings size={13} aria-hidden="true" /> {copy.sprintNote}
      </footer>

      <BottomNav copy={copy} activeView={activeView} onSelect={goTo} />
    </div>
  )
}

export default App
