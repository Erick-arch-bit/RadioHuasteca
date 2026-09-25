import { useRef, useState } from 'react'
import {
  BellRing, BookOpen, ChevronLeft, CircleHelp, Home, Info, Languages,
  Menu, Pause, Play, Radio, Settings, Square, Volume2,
} from 'lucide-react'
import './App.css'

const translations = {
  es: {
    menuItems: [
      { id: 'inicio', label: 'Inicio', icon: Home },
      { id: 'avisos', label: 'Avisos', icon: BellRing },
      { id: 'tramites', label: 'Trámites', icon: BookOpen },
      { id: 'sobre', label: 'Sobre la radio', icon: Info },
    ],
    brandSubtitle: 'La voz de aquí',
    openMenu: 'Abrir menú',
    home: 'Volver a inicio',
    live: 'Al aire desde la Huasteca',
    title: <>Lo que pasa aquí,<br /><em>se escucha aquí.</em></>,
    intro: 'Información cercana, historias de la comunidad y la música que nos reúne.',
    latest: 'Último boletín',
    date: '23 SEP 2026',
    bulletinKicker: 'Boletín comunitario · 04:20 min',
    bulletinTitle: 'La palabra de nuestra gente',
    languageNotice: 'Audio en español',
    play: 'Reproducir boletín',
    pause: 'Pausar boletín',
    stop: 'Detener boletín',
    loading: 'Cargando audio...',
    error: 'Audio no disponible',
    playing: 'Reproduciendo ahora',
    paused: 'En pausa',
    ready: 'Listo para escuchar',
    retry: 'Intenta de nuevo',
    listen: 'Pulsa para escuchar',
    explore: 'Explora la radio',
    needs: '¿Qué necesitas hoy?',
    choose: 'Elige una ruta',
    navigation: 'Navegación principal',
    back: 'Volver al inicio',
    route: 'Ruta comunitaria',
    viewIntro: 'Esta vista ya está preparada para el siguiente incremento. La navegación y el regreso conservan el contexto del boletín.',
    preparing: 'Contenido en preparación',
    sprint: 'Sprint 1 · interfaz inicial / versión de prueba',
  },
  hnh: {
    menuItems: [
      { id: 'inicio', label: 'Tének: Tsabál', icon: Home },
      { id: 'avisos', label: 'Aylal', icon: BellRing },
      { id: 'tramites', label: 'Ajan', icon: BookOpen },
      { id: 'sobre', label: 'In tin radio', icon: Info },
    ],
    brandSubtitle: "Inik t'ojlal",
    openMenu: 'Ajan menú',
    home: 'Tsal an Tsabál',
    live: 'Tsal an Huasteca',
    title: <>Axi inik,<br /><em>tsabál an inik.</em></>,
    intro: 'Tsal, aylal ani tsabál an comunidad.',
    latest: "Ne'ets",
    date: '23 / 09 / 2026',
    bulletinKicker: 'Tsabál Tének · 04:20',
    bulletinTitle: 'Tsabál an inik',
    languageNotice: 'Tsabál Tének',
    play: 'Tsabál',
    pause: 'Kubat',
    stop: 'Kubat tsabál',
    loading: 'Kawil tsabál...',
    error: 'Axi tsabál',
    playing: 'Tsabál anik',
    paused: 'Kubat',
    ready: 'Kawil tsabál',
    retry: 'Tsabál juni',
    listen: 'Tsabál',
    explore: 'Ajan radio',
    needs: '¿Axi?',
    choose: 'Ajan',
    navigation: 'Ajan principal',
    back: 'Tsal an Tsabál',
    route: 'Ajan an comunidad',
    viewIntro: 'Axi tsabál an incremento. Ajan ani regreso.',
    preparing: 'Tsabál an kawil',
    sprint: 'Tsabál 1 · tsabál inicial',
  },
}

const bulletinAudio = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3'

function App() {
  const [activeView, setActiveView] = useState('inicio')
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioState, setAudioState] = useState('idle')
  const [language, setLanguage] = useState('es')
  const audioRef = useRef(null)
  const copy = translations[language]
  const menuItems = copy.menuItems
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
        <button className="icon-button menu-button" type="button" aria-label={copy.openMenu}><Menu size={21} /></button>
        <button className="brand" type="button" onClick={() => goTo('inicio')} aria-label={copy.home}>
          <span className="brand-mark"><Radio size={19} /></span>
          <span><strong>RadioHuasteca</strong><small>{copy.brandSubtitle}</small></span>
        </button>
        <button className="language-toggle" type="button" onClick={() => setLanguage(language === 'es' ? 'hnh' : 'es')}>
          <Languages size={16} /><span>{language === 'es' ? 'ES' : 'HN'}</span>
        </button>
      </header>

      <main className="page-content">
        {activeView === 'inicio' ? <>
          <section className="welcome-block reveal">
            <div className="eyebrow"><span className="live-dot" /> {copy.live}</div>
            <h1>{copy.title}</h1>
            <p className="intro">{copy.intro}</p>
          </section>

          <section className="bulletin-card reveal delay-one" aria-labelledby="bulletin-title">
            <div className="card-topline"><span className="section-label">{copy.latest}</span><span className="date-pill">{copy.date}</span></div>
            <div className="bulletin-art" aria-hidden="true"><div className="sun" /><div className="mountain mountain-one" /><div className="mountain mountain-two" /><div className="river-line" /><span className="art-caption">Tének Tsabál</span></div>
            <div className="bulletin-copy">
              <div><p className="kicker">{copy.bulletinKicker}</p><h2 id="bulletin-title">{copy.bulletinTitle}</h2><p className="native-line">{copy.languageNotice}</p></div>
              <div className="player-controls">
                <button className="play-button" type="button" onClick={togglePlayback} aria-label={isPlaying ? copy.pause : copy.play}>{isPlaying ? <Pause size={23} fill="currentColor" /> : <Play size={23} fill="currentColor" />}</button>
                <div className="player-status"><strong>{audioState === 'loading' ? copy.loading : audioState === 'error' ? copy.error : isPlaying ? copy.playing : audioState === 'paused' ? copy.paused : copy.ready}</strong><span><Volume2 size={14} /> {audioState === 'error' ? copy.retry : copy.listen}</span></div>
                <button className="stop-button" type="button" onClick={stopPlayback} aria-label={copy.stop}><Square size={16} fill="currentColor" /></button>
              </div>
            </div>
          </section>

          <section className="quick-section reveal delay-two"><div className="section-heading"><div><span className="section-label">{copy.explore}</span><h2>{copy.needs}</h2></div><span className="hand-note">{copy.choose} →</span></div>
            <nav className="quick-grid" aria-label={copy.navigation}>{menuItems.slice(1).map(({ id, label, icon: Icon }) => <button className="quick-link" type="button" key={id} onClick={() => goTo(id)}><span className="quick-icon"><Icon size={21} /></span><span><strong>{label}</strong></span></button>)}</nav>
          </section>
        </> : <section className="inner-view reveal">
          <button className="back-link" type="button" onClick={() => goTo('inicio')}><ChevronLeft size={18} /> {copy.back}</button>
          <div className="view-icon"><currentItem.icon size={25} /></div><span className="section-label">{copy.route}</span><h1>{currentItem.label}</h1>
          <p className="intro">{copy.viewIntro}</p>
          <div className="coming-note"><CircleHelp size={20} /><span><strong>{copy.preparing}</strong><small>{copy.sprint}</small></span></div>
        </section>}
      </main>

      <nav className="bottom-nav" aria-label={copy.navigation}>{menuItems.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={activeView === id ? 'nav-item active' : 'nav-item'} onClick={() => goTo(id)}><Icon size={19} strokeWidth={activeView === id ? 2.5 : 1.8} /><span>{label}</span></button>)}</nav>
      <footer className="footer-note"><Settings size={13} /> {copy.sprint}</footer>
    </div>
  )
}

export default App
