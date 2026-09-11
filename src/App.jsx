import { useState } from 'react'
import './App.css'
import { postData } from './data/radioData'
import { Sidebar } from './components/Sidebar'
import { WorkspaceHeader } from './components/WorkspaceHeader'
import { PlayerHero } from './components/PlayerHero'
import { CommunityFeed } from './components/CommunityFeed'
import { RightRail } from './components/RightRail'
import { PostModal } from './components/PostModal'
import { LivePodcasts } from './components/LivePodcasts'
import { Trámites } from './components/Trámites'
import { Eventos } from './components/Eventos'
import { Participa } from './components/Participa'

function App() {
  const [playing, setPlaying] = useState(false)
  const [activeSection, setActiveSection] = useState('Inicio')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('radio-universitaria-theme') === 'dark')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('Todo')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [subscriptions, setSubscriptions] = useState(() => JSON.parse(localStorage.getItem('radio-universitaria-subscriptions') || '[]'))
  const [subscriptionNotifications, setSubscriptionNotifications] = useState([])
  const visiblePosts = activeFilter === 'Todo' ? postData : postData.filter((post) => post.category === activeFilter)
  const [unreadCounts, setUnreadCounts] = useState({ Inicio: 3, 'En vivo': 0, Trámites: 2, Programas: 0, Noticias: 5, Eventos: 4, Participa: 0 })

  const submitMessage = (event) => {
    event.preventDefault()
    if (!message.trim()) return
    setMessage('')
    setSent(true)
  }

  const toggleTheme = () => {
    setDarkMode((current) => {
      const nextMode = !current
      localStorage.setItem('radio-universitaria-theme', nextMode ? 'dark' : 'light')
      return nextMode
    })
  }

  const toggleSubscription = (author) => {
    const isSubscribed = subscriptions.includes(author)
    const nextSubscriptions = isSubscribed ? subscriptions.filter((item) => item !== author) : [...subscriptions, author]
    setSubscriptions(nextSubscriptions)
    localStorage.setItem('radio-universitaria-subscriptions', JSON.stringify(nextSubscriptions))
    if (!isSubscribed) setSubscriptionNotifications((currentNotifications) => [`${author} publicó una nueva publicación.`, ...currentNotifications])
  }

  const selectSection = (section) => {
    setActiveSection(section)
    setMobileMenuOpen(false)
    setUnreadCounts((current) => ({ ...current, [section]: 0 }))
    if (section === 'Inicio') {
      setActiveFilter('Todo')
      setPlaying(false)
    }
    if (section === 'En vivo') setPlaying(true)
    if (section === 'Noticias' || section === 'Eventos') setActiveFilter(section)
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'Trámites': return <Trámites />
      case 'Programas': return <div className="programas-placeholder"><h2>Programas de Radio</h2><p>Catálogo de programas disponibles.</p></div>
      case 'Eventos': return <Eventos />
      case 'Participa': return <Participa />
      case 'Inicio': return <><PlayerHero playing={playing} onToggle={() => setPlaying(!playing)} /><div className="dashboard-grid"><CommunityFeed activeFilter={activeFilter} onFilterChange={setActiveFilter} posts={visiblePosts} onOpenPost={setSelectedPost} subscriptions={subscriptions} onToggleSubscription={toggleSubscription} /><RightRail message={message} onMessageChange={(value) => { setMessage(value); setSent(false) }} onSubmit={submitMessage} sent={sent} /></div></>
      case 'En vivo': return <LivePodcasts playing={playing} onToggle={() => setPlaying(!playing)} />
      case 'Noticias': return <><div className="section-header"><div><p className="kicker">NOTICIAS</p><h2>Noticias universitarias</h2></div></div><div className="post-list">{visiblePosts.map((post, index) => <article className={`post ${index === 0 ? 'featured' : ''}`} key={post.title} role="button" tabIndex="0" onClick={() => setSelectedPost(post)}><div className={`post-picture ${post.color}`} style={{ backgroundImage: `url(${post.image})` }}><span>{post.category}</span></div><div className="post-content"><div className="post-meta"><span className="mini-avatar">{post.author.charAt(0)}</span><span><strong>{post.author}</strong><small>{post.time} · Universidad</small></span></div><h3>{post.title}</h3><p>{post.text}</p><div className="post-footer"><span>♡ 24</span><span>◌ 8</span><button type="button" aria-label="Compartir" onClick={(event) => event.stopPropagation()}>↗</button></div></div></article>)}</div></>
      default: return <><PlayerHero playing={playing} onToggle={() => setPlaying(!playing)}><div className="dashboard-grid"><CommunityFeed activeFilter={activeFilter} onFilterChange={setActiveFilter} posts={visiblePosts} onOpenPost={setSelectedPost} subscriptions={subscriptions} onToggleSubscription={toggleSubscription} /><RightRail message={message} onMessageChange={(value) => { setMessage(value); setSent(false) }} onSubmit={submitMessage} sent={sent} /></div></PlayerHero></>
    }
  }

  return <main className={`app-shell ${darkMode ? 'dark-mode' : ''}`}>
    <Sidebar activeSection={activeSection} onSelect={selectSection} mobileOpen={mobileMenuOpen} unreadCounts={unreadCounts} />
    <section className="workspace" id="inicio">
      <WorkspaceHeader darkMode={darkMode} onToggleTheme={toggleTheme} mobileMenuOpen={mobileMenuOpen} onToggleMenu={() => setMobileMenuOpen((current) => !current)} notificationsOpen={notificationsOpen} onToggleNotifications={() => setNotificationsOpen((current) => !current)} notifications={[...subscriptionNotifications, 'Hay 3 nuevos avisos importantes.']} />
      {renderSection()}
    </section>
    {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} isSubscribed={subscriptions.includes(selectedPost.author)} onToggleSubscription={toggleSubscription} />}
  </main>
}

export default App
