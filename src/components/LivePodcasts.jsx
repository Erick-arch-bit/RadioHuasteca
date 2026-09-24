import { useState } from 'react'

const liveStations = [
  { name: 'La Esquina', frequency: '92.7 FM', detail: 'Radio Patio · Barrio Centro', color: 'coral' },
  { name: 'Voces del Río', frequency: '88.4 FM', detail: 'Señal comunitaria · San Miguel', color: 'green' },
  { name: 'Onda Sur', frequency: '101.3 FM', detail: 'Música local · Las Palmas', color: 'yellow' },
]

const livePodcasts = [
  { title: 'La plaza abierta', author: 'Con Mariela Cruz', topic: 'Lo que necesita nuestro barrio hoy', listeners: '128 oyentes', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=700&q=80', color: 'coral', likes: 46, comments: 18 },
  { title: 'Voces jóvenes', author: 'Jóvenes del Sur', topic: 'Ideas para una ciudad más nuestra', listeners: '76 oyentes', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=700&q=80', color: 'yellow', likes: 31, comments: 9 },
]

function LiveRoom({ room, onClose }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(['¡Saludos desde la colonia!', '¿Podrían hablar de la feria del domingo?'])

  const sendMessage = (event) => {
    event.preventDefault()
    if (!message.trim()) return
    setMessages((current) => [...current, message.trim()])
    setMessage('')
  }

  return <div className="live-room-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><article className="live-room" role="dialog" aria-modal="true" aria-labelledby="live-room-title"><button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar sala en vivo">×</button><div className={`live-room-cover ${room.color}`} style={room.image ? { backgroundImage: `url(${room.image})` } : undefined}><span className="live-badge">● EN VIVO</span><div className="live-room-mark">{room.image ? '▶' : '◉'}</div></div><div className="live-room-body"><div className="live-room-heading"><div><p className="kicker">SALA EN DIRECTO</p><h2 id="live-room-title">{room.name}</h2><p>{room.detail || room.author}</p></div><strong>{room.listeners || room.frequency}</strong></div><div className="live-room-stats"><span>♡ {room.likes || 128}</span><span>◌ {room.comments || 18} comentarios</span><span>◉ En vivo ahora</span></div><div className="live-chat"><p className="kicker">CONVERSACIÓN EN TIEMPO REAL</p>{messages.map((item, index) => <p className="live-chat-message" key={`${item}-${index}`}><span>{index % 2 ? 'CR' : 'LM'}</span>{item}</p>)}</div><form className="live-chat-form" onSubmit={sendMessage}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escribe a la estación..." aria-label="Mensaje para la estación" /><button type="submit" aria-label="Enviar mensaje">↗</button></form></div></article></div>
}

export function LivePodcasts({ onToggle }) {
  const [playingStation, setPlayingStation] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState(null)

  const toggleStation = (index) => {
    setPlayingStation((current) => current === index ? null : index)
    onToggle()
  }

  return <section className="live-hub" id="en-vivo"><div className="live-hub-heading"><div><p className="kicker">SEÑALES DISPONIBLES AHORA</p><h2>Todo lo que está <em>en vivo.</em></h2></div><span className="live-note"><i /> Interacción en tiempo real próximamente</span></div><section className="live-stations"><div className="live-section-label"><p className="kicker">ESTACIONES DE RADIO</p><span>Escucha una señal o entra a su sala</span></div><div className="live-station-grid">{liveStations.map((station, index) => <article className={`live-station ${station.color} ${playingStation === index ? 'active-station' : ''}`} key={station.name} onClick={() => setSelectedRoom(station)}><div><span className="live-badge">● EN VIVO</span><h3>{station.name}</h3><p>{station.detail}</p></div><strong>{station.frequency}</strong><button type="button" onClick={(event) => { event.stopPropagation(); toggleStation(index) }} aria-label={`${playingStation === index ? 'Pausar' : 'Escuchar'} ${station.name}`}>{playingStation === index ? 'Ⅱ' : '▶'}</button></article>)}</div></section><section className="live-podcasts"><div className="live-section-label"><p className="kicker">PODCASTS EN VIVO</p><span>Entra a la conversación del episodio</span></div><div className="live-podcast-grid">{livePodcasts.map((podcast) => <article className="live-podcast-card" key={podcast.title} onClick={() => setSelectedRoom(podcast)}><div className={`live-podcast-cover ${podcast.color}`} style={{ backgroundImage: `url(${podcast.image})` }}><span className="live-badge">● EN VIVO</span><span className="listeners">◉ {podcast.listeners}</span><button type="button" className="live-play" onClick={(event) => { event.stopPropagation(); setSelectedRoom(podcast) }} aria-label={`Entrar a ${podcast.title}`}>▶</button></div><div className="live-podcast-body"><div className="live-podcast-author"><span className="mini-avatar">{podcast.title.charAt(0)}</span><span><strong>{podcast.title}</strong><small>{podcast.author}</small></span></div><h3>{podcast.topic}</h3><div className="live-podcast-actions"><span>♡ {podcast.likes}</span><span>◌ {podcast.comments}</span><span className="waiting">Entrar ↗</span></div></div></article>)}</div></section>{selectedRoom && <LiveRoom room={selectedRoom} onClose={() => setSelectedRoom(null)} />}</section>
}
