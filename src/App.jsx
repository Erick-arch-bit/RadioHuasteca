import { useState } from 'react'
import './App.css'
import { interfaceText, navigationItems } from './data/radioData'
import { Sidebar } from './components/Sidebar'
import { WorkspaceHeader } from './components/WorkspaceHeader'
import { PlayerHero } from './components/PlayerHero'
function App() {
 const [language,setLanguage]=useState('es');const [mobileMenuOpen,setMobileMenuOpen]=useState(false);const copy=interfaceText[language]
 const selectSection=(section)=>{setMobileMenuOpen(false);document.getElementById(section)?.scrollIntoView({behavior:'smooth'})}
 return <main className={'app-shell'}><Sidebar items={navigationItems} labels={copy} mobileOpen={mobileMenuOpen} onSelect={selectSection}/><section className={'workspace'}><WorkspaceHeader language={language} labels={copy} mobileMenuOpen={mobileMenuOpen} onLanguageChange={setLanguage} onToggleMenu={()=>setMobileMenuOpen(x=>!x)}/><PlayerHero labels={copy}/><section className={'sprint-note'} id={'acerca-de'}><p className={'eyebrow'}>SPRINT 1 - INTERFAZ INICIAL</p><h2>{copy.communityTitle}</h2><p>{copy.communityText}</p><div className={'feature-list'}><span>{copy.featureMobile}</span><span>{copy.featureIcons}</span><span>{copy.featureAudio}</span></div></section></section></main>
}
export default App
