import { shows } from '../data/radioData'

export function RightRail({ message, onMessageChange, onSubmit, sent }) {
  return (
    <aside className="right-column">
      <section className="schedule-card" id="agenda">
        <div className="section-header">
          <div>
            <p className="kicker">LA PROGRAMACIÓN</p>
            <h2>Esta semana</h2>
          </div>
          <button className="round-button" type="button" aria-label="Ver calendario">＋</button>
        </div>
        <div className="show-list">
          {shows.map((show) => (
            <div className={show.live ? 'show live' : 'show'} key={show.time}>
              <time>{show.time}</time>
              <div><strong>{show.name}</strong><small>{show.host}</small></div>
              {show.live && <b>AL AIRE</b>}
            </div>
          ))}
        </div>
        <button className="full-width-button" type="button">Ver programación completa <span>→</span></button>
      </section>
      <section className="join-card">
        <div className="join-mark">✦</div>
        <p className="kicker">PARTICIPA EN LA SEÑAL</p>
        <h2>Tu voz<br /><em>también suena.</em></h2>
        <p>Comparte una noticia, propón un programa o envía tu opinión.</p>
        <form onSubmit={onSubmit}>
          <input value={message} onChange={(event) => onMessageChange(event.target.value)} placeholder={sent ? '¡Mensaje enviado!' : 'Escribe un mensaje...'} aria-label="Mensaje para la comunidad" />
          <button type="submit" aria-label="Enviar mensaje">↗</button>
        </form>
      </section>
    </aside>
  )
}
