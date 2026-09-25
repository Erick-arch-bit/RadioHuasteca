import { useRef, useState } from 'react'
import {
  BellRing, BookOpen, ChevronLeft, CircleHelp, Home, Info, Languages,
  Menu, Pause, Play, Radio, Settings, Square, Volume2,
} from 'lucide-react'
import './App.css'

const menuItems = [
  { id: 'inicio', label: 'Inicio', native: 'Tének: Tsabál', icon: Home },
  { id: 'avisos', label: 'Avisos', native: 'Aylal', icon: BellRing },
  { id: 'tramites', label: 'Trámites', native: 'Ajan', icon: BookOpen },
  { id: 'sobre', label: 'Sobre la radio', native: 'In tin radio', icon: Info },
]

const bulletinAudio = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3'

function App() {
  const [activeView, setActiveView] = useState('inicio')
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioState, setAudioState] = useState('idle')
  const [language, setLanguage] = useState('es')
  const audioRef = useRef(null)
  const currentItem = menuItems.find((item) => item.id === activeView) ?? menuItems[0]

  const togglePlayback = async () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      setAudioState('paused')
      return
    }
    setAudioState('loading')
    try {
      await audioRef.current.play()
      setIsPlaying(true)
      setAudioState('playing')
    } catch {
      setAudioState('error')
    }
  }

  const stopPlayback = () => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsPlaying(false)
    setAudioState('idle')
  }

  const goTo = (view) => {
    setActiveView(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <audio ref={audioRef} src={bulletinAudio} preload="metadata"
        onEnded={() => { setIsPlaying(false); setAudioState('idle') }}
        onError={() => setAudioState('error')} />

      <header className="topbar">
        <button className="icon-button menu-button" type="button" aria-label="Abrir menú"><Menu size={21} /></button>
        <button className="brand" type="button" onClick={() => goTo('inicio')} aria-label="Volver a inicio">
          <span className="brand-mark"><Radio size={19} /></span>
          <span><strong>RadioHuasteca</strong><small>La voz de aquí / Inik t'ojlal</small></span>
        </button>
        <button className="language-toggle" type="button" onClick={() => setLanguage(language === 'es' ? 'hn' : 'es')}>
          <Languages size={16} /><span>{language === 'es' ? 'ES' : 'HN'}</span>
        </button>
      </header>

      <main className="page-content">
        {activeView === 'inicio' ? <>
          <section className="welcome-block reveal">
            <div className="eyebrow"><span className="live-dot" /> Al aire desde la Huasteca</div>
            <h1>Lo que pasa aquí,<br /><em>se escucha aquí.</em></h1>
            <p className="intro">Información cercana, historias de la comunidad y la música que nos reúne.</p>
          </section>

          <section className="bulletin-card reveal delay-one" aria-labelledby="bulletin-title">
            <div className="card-topline"><span className="section-label">Último boletín / <span>Ne'ets in boletín</span></span><span className="date-pill">23 SEP 2026</span></div>
            <div className="bulletin-art" aria-hidden="true"><div className="sun" /><div className="mountain mountain-one" /><div className="mountain mountain-two" /><div className="river-line" /><span className="art-caption">Tének Tsabál</span></div>
            <div className="bulletin-copy">
              <div><p className="kicker">Boletín comunitario · 04:20 min</p><h2 id="bulletin-title">La palabra de nuestra gente</h2><p className="native-line">{language === 'es' ? 'Español · traducción Hñähñu disponible' : 'Hñähñu · español disponible'}</p></div>
              <div className="player-controls">
                <button className="play-button" type="button" onClick={togglePlayback} aria-label={isPlaying ? 'Pausar boletín' : 'Reproducir boletín'}>{isPlaying ? <Pause size={23} fill="currentColor" /> : <Play size={23} fill="currentColor" />}</button>
                <div className="player-status"><strong>{audioState === 'loading' ? 'Cargando audio...' : audioState === 'error' ? 'Audio no disponible' : isPlaying ? 'Reproduciendo ahora' : audioState === 'paused' ? 'En pausa' : 'Listo para escuchar'}</strong><span><Volume2 size={14} /> {audioState === 'error' ? 'Intenta de nuevo' : 'Pulsa para escuchar'}</span></div>
                <button className="stop-button" type="button" onClick={stopPlayback} aria-label="Detener boletín"><Square size={16} fill="currentColor" /></button>
              </div>
            </div>
          </section>

          <section className="quick-section reveal delay-two"><div className="section-heading"><div><span className="section-label">Explora la radio</span><h2>¿Qué necesitas hoy?</h2></div><span className="hand-note">elige una ruta →</span></div>
            <nav className="quick-grid" aria-label="Navegación principal">{menuItems.slice(1).map(({ id, label, native, icon: Icon }) => <button className="quick-link" type="button" key={id} onClick={() => goTo(id)}><span className="quick-icon"><Icon size={21} /></span><span><strong>{label}</strong><small>{native}</small></span></button>)}</nav>
          </section>
        </> : <section className="inner-view reveal">
          <button className="back-link" type="button" onClick={() => goTo('inicio')}><ChevronLeft size={18} /> Volver al inicio</button>
          <div className="view-icon"><currentItem.icon size={25} /></div><span className="section-label">Ruta comunitaria / {currentItem.native}</span><h1>{currentItem.label}</h1>
          <p className="intro">Esta vista ya está preparada para el siguiente incremento. La navegación y el regreso conservan el contexto del boletín.</p>
          <div className="coming-note"><CircleHelp size={20} /><span><strong>Contenido en preparación</strong><small>Disponible en el Sprint correspondiente.</small></span></div>
        </section>}
      </main>

      <nav className="bottom-nav" aria-label="Navegación inferior">{menuItems.map(({ id, label, native, icon: Icon }) => <button type="button" key={id} className={activeView === id ? 'nav-item active' : 'nav-item'} onClick={() => goTo(id)}><Icon size={19} strokeWidth={activeView === id ? 2.5 : 1.8} /><span>{label}</span><small>{native}</small></button>)}</nav>
      <footer className="footer-note"><Settings size={13} /> Sprint 1 · interfaz inicial / versión de prueba</footer>
    </div>
  )
}

export default App
