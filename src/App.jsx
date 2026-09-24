import { useState } from 'react'
import './App.css'
import { interfaceText, navigationItems } from './data/radioData'
import { Sidebar } from './components/Sidebar'
import { WorkspaceHeader } from './components/WorkspaceHeader'
import { PlayerHero } from './components/PlayerHero'
function App() {
 const [language,setLanguage]=useState('es');const [mobileMenuOpen,setMobileMenuOpen]=useState(false);const copy=interfaceText[language]
 const selectSection=(section)=>{setMobileMenuOpen(false);document.getElementById(section)?.scrollIntoView({behavior:'smooth'})}
 return <main className={'app-shell'}><Sidebar items={navigationItems} labels={copy} mobileOpen={mobileMenuOpen} onSelect={selectSection}/><section className={'workspace'}><WorkspaceHeader language={language} labels={copy} mobileMenuOpen={mobileMenuOpen} onLanguageChange={setLanguage} onToggleMenu={()=>setMobileMenuOpen(x=>!x)}/><PlayerHero labels={copy}/><section className={'community-intro'} id={'acerca-de'}><p className={'eyebrow'}>{copy.aboutKicker}</p><h2>{copy.communityTitle}</h2><p>{copy.communityText}</p><p className={'community-signature'}>{copy.communitySignature}</p></section></section></main>
}
export default App
