import { tramites } from '../data/radioData'
import { useState } from 'react'

export function Trámites() {
  const [selected, setSelected] = useState(null)

  return (
    <section className="tramites-section" id="tramites">
      <div className="section-header">
        <div>
          <p className="kicker">GUÍA DE TRÁMITES</p>
          <h2>¿Qué trámite necesitas?</h2>
        </div>
      </div>
      <p className="tramites-intro">Selecciona un trámite para conocer los requisitos, pasos y contacto correspondiente.</p>
      <div className="tramites-grid">
        {tramites.map((t) => (
          <div
            className={`tramite-card ${selected?.title === t.title ? 'selected' : ''}`}
            key={t.title}
            onClick={() => setSelected(selected?.title === t.title ? null : t)}
          >
            <div className="tramite-icon">{t.icon}</div>
            <h3>{t.title}</h3>
            <p>{t.steps.length} pasos · {t.tiempo}</p>
          </div>
        ))}
      </div>
      {selected && (
        <div className="tramite-detail">
          <button className="modal-close" type="button" onClick={() => setSelected(null)} aria-label="Cerrar detalle">×</button>
          <div className="tramite-detail-header">
            <span className="tramite-detail-icon">{selected.icon}</span>
            <div>
              <h2>{selected.title}</h2>
              <p>{selected.tiempo}</p>
            </div>
          </div>
          <div className="tramite-detail-body">
            <div className="tramite-steps">
              <h3>📋 Pasos</h3>
              <ol>{selected.steps.map((step, i) => <li key={i}>{step}</li>)}</ol>
            </div>
            <div className="tramite-requisitos">
              <h3>📄 Requisitos</h3>
              <ul>{selected.requisitos.map((req, i) => <li key={i}>{req}</li>)}</ul>
            </div>
            <div className="tramite-contacto">
              <h3>📞 Contacto</h3>
              <p>{selected.contacto}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
