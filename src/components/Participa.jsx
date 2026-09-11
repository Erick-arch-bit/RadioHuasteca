import { useState } from 'react'
import { participationOptions } from '../data/radioData'

export function Participa() {
  const [selectedType, setSelectedType] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!formData.message.trim()) return
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); setFormData({ name: '', email: '', message: '' }); setSelectedType(null) }, 3000)
  }

  if (submitted) {
    return <section className="participa-section" id="participa"><div className="section-header"><div><p className="kicker">PARTICIPA</p><h2>¡Gracias por tu participación!</h2></div></div><div className="success-message"><div className="success-icon">✓</div><p>Tu mensaje ha sido enviado. Lo revisaremos pronto.</p></div></section>
  }

  return <section className="participa-section" id="participa"><div className="section-header"><div><p className="kicker">PARTICIPA</p><h2>Sé parte de la señal</h2></div></div><p className="participa-intro">Tu voz importa. Elige cómo quieres participar en la radio comunitaria universitaria.</p><div className="participa-options">{participationOptions.map((option) => <div className={`participa-option ${selectedType === option.id ? 'selected' : ''}`} key={option.id} onClick={() => { setSelectedType(option.id); setFormData({ name: '', email: '', message: '' }) }}><span className="participa-option-icon">{option.icon}</span><h3>{option.title}</h3><p>{option.description}</p></div>)}</div>{selectedType && <form className="participa-form" onSubmit={handleSubmit}><h3>Enviar {selectedType}</h3><input type="text" placeholder="Tu nombre" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required aria-label="Tu nombre" /><input type="email" placeholder="Tu correo" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required aria-label="Tu correo" /><textarea placeholder="Escribe tu mensaje..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required aria-label="Tu mensaje" rows="5" /><button type="submit" className="participa-submit">Enviar</button></form>}
</section>
}
