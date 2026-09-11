import { eventos } from '../data/radioData'

export function Eventos() {
  return <section className="eventos-section" id="eventos"><div className="section-header"><div><p className="kicker">CALENDARIO UNIVERSITARIO</p><h2>Eventos próximos</h2></div></div><p className="eventos-intro">Conoce los eventos académicos, culturales y deportivos de la comunidad universitaria.</p><div className="eventos-list">{eventos.map((evento) => <div className={`evento-card ${evento.color}`} key={evento.title}><div className="evento-info"><span className="evento-date">{evento.date}</span><h3>{evento.title}</h3><p className="evento-location">📍 {evento.location}</p></div><div className="evento-description"><p>{evento.description}</p><button type="button" className="evento-btn">Más información</button></div></div>)}</div></section>
}
