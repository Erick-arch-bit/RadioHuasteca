import { navItems } from '../data/radioData'

export function Sidebar({ activeSection, onSelect, mobileOpen, unreadCounts }) {
  return <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
    <button className="logo" type="button" onClick={() => onSelect('Inicio')} aria-label="Ir a inicio">
      <span>RU</span>
      <strong>Radio<br />Universitaria</strong>
    </button>
    <div className="station-status"><i /> <span>SEÑAL UNIVERSITARIA</span><b>Online</b></div>
    <nav>
      {navItems.map((item) => <button className={activeSection === item.id ? 'current' : ''} type="button" key={item.id} onClick={() => onSelect(item.id)}>
        <span className="nav-icon">{item.icon}</span>{item.label}
        {unreadCounts[item.id] ? <small>{unreadCounts[item.id]}</small> : ''}
      </button>)}
    </nav>
    <div className="sidebar-bottom">
      <button type="button" className="profile"><span>RU</span><div><strong>Estudiante</strong><small>Mi cuenta</small></div><b>⌄</b></button>
      <p>Radio hecha por<br />y para la comunidad <em>♥</em></p>
    </div>
  </aside>
}
