import { useCallback, useRef, useState } from 'react'
import { Settings } from 'lucide-react'
import { BulletinAudio } from './components/BulletinAudio'
import { BulletinCard } from './components/BulletinCard'
import { CapsuleCatalog } from './components/CapsuleCatalog'
import { BottomNav } from './components/BottomNav'
import { InnerView } from './components/InnerView'
import { LanguageDraftNotice } from './components/LanguageDraftNotice'
import { MobileMenu } from './components/MobileMenu'
import { NoticeView } from './components/NoticeView'
import { QuickNav } from './components/QuickNav'
import { TopBar } from './components/TopBar'
import { WelcomeBlock } from './components/WelcomeBlock'
import { audioSources } from './data/bulletin'
import { findNavigationItem, homeItem } from './data/navigation'
import { useBulletinAudio } from './hooks/useBulletinAudio'
import { useNotices } from './hooks/useNotices'
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
  const capsuleAudioRef = useRef(null)
  const player = useBulletinAudio(bulletinAudioRef)
  const notices = useNotices()
  const [activeCapsuleId, setActiveCapsuleId] = useState(null)
  const [capsuleState, setCapsuleState] = useState('idle')

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

  const playCapsule = useCallback(async (capsule) => {
    const audio = capsuleAudioRef.current
    if (!audio) return
    if (activeCapsuleId === capsule.id && capsuleState === 'playing') {
      audio.pause()
      setCapsuleState('paused')
      return
    }
    if (activeCapsuleId !== capsule.id || audio.src !== new URL(capsule.src[0].src, window.location.href).href) {
      audio.pause()
      audio.src = capsule.src[0].src
      audio.load()
    }
    setActiveCapsuleId(capsule.id)
    setCapsuleState('loading')
    try {
      await audio.play()
      setCapsuleState('playing')
    } catch {
      setCapsuleState('error')
    }
  }, [activeCapsuleId, capsuleState])

  const pauseCapsule = useCallback(() => {
    capsuleAudioRef.current?.pause()
    setCapsuleState('paused')
  }, [])

  const stopCapsule = useCallback(() => {
    const audio = capsuleAudioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setCapsuleState('idle')
  }, [])

  const playNoticeAudio = useCallback((noticeId) => {
    const notice = notices.visibleNotices.find((item) => item.id === noticeId)
    if (notice?.audio) playCapsule({ id: notice.id, src: notice.audio })
  }, [notices.visibleNotices, playCapsule])

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
      <audio
        ref={capsuleAudioRef}
        data-testid="capsule-audio"
        preload="none"
        className="hidden"
        onPlaying={() => setCapsuleState('playing')}
        onPause={() => setCapsuleState((state) => state === 'idle' || capsuleAudioRef.current?.currentTime === 0 ? 'idle' : 'paused')}
        onEnded={() => setCapsuleState('idle')}
        onError={() => setCapsuleState('error')}
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
        ) : activeView === 'avisos' ? (
          <NoticeView copy={copy} notices={notices} onPlayAudio={playNoticeAudio} />
        ) : activeView === 'capsulas' ? (
          <CapsuleCatalog
            copy={copy}
            activeId={activeCapsuleId}
            playbackState={capsuleState}
            onPlay={playCapsule}
            onPause={pauseCapsule}
            onStop={stopCapsule}
          />
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
