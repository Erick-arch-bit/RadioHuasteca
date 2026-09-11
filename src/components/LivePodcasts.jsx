import { useState } from 'react'

const liveStations = [
  { name: 'Radio Universitaria', frequency: 'SEÑAL UNIVERSITARIA', detail: 'La voz de nuestra comunidad', color: 'coral' },
  { name: 'Voces del Campus', frequency: 'Canal Alternativo', detail: 'Voces estudiantiles', color: 'green' },
  { name: 'Cultura Universitaria', frequency: 'Difusión', detail: 'Arte, tradiciones y cultura', color: 'yellow' },
]

const livePodcasts = [
  { title: 'Buenos días, Universidad', author: 'Equipo de Comunicación', topic: 'Los avisos del día', listeners: '142 oyentes', image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=80', color: 'coral', likes: 52, comments: 21 },
  { title: 'Voces de la Universidad', author: 'Estudiantes diversos', topic: 'Historias de la comunidad', listeners: '89 oyentes', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=700&q=80', color: 'yellow', likes: 37, comments: 14 },
]

export function LivePodcasts({ onToggle }) {
  const [playingStation, setPlayingStation] = useState(0)
  const [_, setSelectedRoom] = useState(null)

  const toggleStation = (index) => {
    setPlayingStation((current) => current === index ? null : index)
    onToggle()
  }

  return (
    <section className="live-hub" id="en-vivo">
      <div className="live-hub-heading">
        <div>
          <p className="kicker">SEÑALES DISPONIBLES AHORA</p>
          <h2>Todo lo que está <em>en vivo.</em></h2>
        </div>
        <span className="live-note"><i /> Interacción en tiempo real próximamente</span>
      </div>
      <section className="live-stations">
        <div className="live-section-label">
          <p className="kicker">ESTACIONES DE RADIO</p>
          <span>Escucha una señal o entra a su sala</span>
        </div>
        <div className="live-station-grid">
          {liveStations.map((station, index) => (
            <article
              className={`live-station ${station.color} ${playingStation === index ? 'active-station' : ''}`}
              key={station.name}
              onClick={() => setSelectedRoom(station)}
            >
              <div>
                <span className="live-badge">● EN VIVO</span>
                <h3>{station.name}</h3>
                <p>{station.detail}</p>
              </div>
              <strong>{station.frequency}</strong>
              <button type="button" onClick={(event) => { event.stopPropagation(); toggleStation(index) }} aria-label={`${playingStation === index ? 'Pausar' : 'Escuchar'} ${station.name}`}>
                {playingStation === index ? 'Ⅱ' : '▶'}
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="live-podcasts">
        <div className="live-section-label">
          <p className="kicker">PROGRAMAS DE RADIO</p>
          <span>Entra a la conversación del episodio</span>
        </div>
        <div className="live-podcast-grid">
          {livePodcasts.map((podcast) => (
            <article className="live-podcast-card" key={podcast.title} onClick={() => setSelectedRoom(podcast)}>
              <div className={`live-podcast-cover ${podcast.color}`} style={{ backgroundImage: `url(${podcast.image})` }}>
                <span className="live-badge">● EN VIVO</span>
                <span className="listeners">◉ {podcast.listeners}</span>
                <button type="button" className="live-play" onClick={(event) => { event.stopPropagation(); setSelectedRoom(podcast) }} aria-label={`Entrar a ${podcast.title}`}>▶</button>
              </div>
              <div className="live-podcast-body">
                <div className="live-podcast-author">
                  <span className="mini-avatar">{podcast.title.charAt(0)}</span>
                  <span>
                    <strong>{podcast.title}</strong>
                    <small>{podcast.author}</small>
                  </span>
                </div>
                <h3>{podcast.title}</h3>
                <p>{podcast.topic}</p>
                <div className="live-podcast-actions">
                  <span>♡ {podcast.likes}</span>
                  <span>◌ {podcast.comments}</span>
                  <button type="button">↗ Compartir</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
