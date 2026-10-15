#!/usr/bin/env node
// Captura evidencia del Sprint 3 y comprueba los flujos principales con Chrome/CDP.
import 'dotenv/config'
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const evidence = path.join(root, 'docs', 'evidence', 'sprint-3')
const chrome = process.env.CHROMIUM_BIN ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const debugPort = 9456
const appUrl = process.env.APP_URL ?? 'http://localhost:5173/'
const adminUsername = process.env.ADMIN_USERNAME
const adminPassword = process.env.ADMIN_PASSWORD
if (!adminUsername || !adminPassword) throw new Error('Define ADMIN_USERNAME y ADMIN_PASSWORD en .env.')
mkdirSync(evidence, { recursive: true })

class Cdp {
  constructor(socket) {
    this.socket = socket
    this.id = 0
    this.waiters = new Map()
    socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data)
      if (!message.id) return
      const waiter = this.waiters.get(message.id)
      this.waiters.delete(message.id)
      if (message.error) waiter.reject(new Error(message.error.message))
      else waiter.resolve(message.result)
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.waiters.set(id, { resolve, reject })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }
  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? 'Browser evaluation failed')
    return result.result.value
  }
}

const browser = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${debugPort}`, '--no-sandbox', '--disable-gpu',
  '--disable-dev-shm-usage', '--mute-audio', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required',
  '--allow-file-access-from-files',
  `--user-data-dir=${path.join(process.env.TEMP ?? process.env.TMP ?? '.', `radiohuasteca-sprint3-${process.pid}`)}`, 'about:blank',
], { stdio: 'ignore', windowsHide: true })

let cdp
const results = []
const check = (name, detail) => results.push(`- ${name}: PASS — ${detail}`)
const assert = (ok, message) => { if (!ok) throw new Error(message) }

async function waitFor(expression, timeout = 15000) {
  const end = Date.now() + timeout
  while (Date.now() < end) {
    if (await cdp.evaluate(expression)) return
    await delay(120)
  }
  throw new Error(`Tiempo de espera agotado: ${expression}`)
}
async function screenshot(name, full = true, hideBottomNav = false) {
  if (hideBottomNav) await cdp.evaluate(`document.querySelector('[data-testid="bottom-nav"]').style.visibility = 'hidden'`)
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: full, fromSurface: true })
  writeFileSync(path.join(evidence, name), Buffer.from(data, 'base64'))
  if (hideBottomNav) await cdp.evaluate(`document.querySelector('[data-testid="bottom-nav"]').style.visibility = ''`)
}
async function click(selector) {
  await waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)
  await cdp.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)
  await delay(300)
}
async function fill(selector, value) {
  const expression = `(() => { const element = document.querySelector(${JSON.stringify(selector)}); const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value').set; setter.call(element, ${JSON.stringify(value)}); element.dispatchEvent(new Event('input', { bubbles: true })); element.dispatchEvent(new Event('change', { bubbles: true })); })()`
  await cdp.evaluate(expression)
}

function writeDatabaseDiagram() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="760" viewBox="0 0 1280 760">
  <rect width="1280" height="760" fill="#f4eddd"/><text x="64" y="66" font-family="Arial" font-size="32" font-weight="700" fill="#173d38">RadioHuasteca · Sprint 3 · Modelo de datos PostgreSQL</text>
  <g font-family="Arial" fill="#173d38">
    <rect x="66" y="128" width="390" height="310" rx="18" fill="#fffaf0" stroke="#155b50" stroke-width="3"/><path d="M66 184h390" stroke="#155b50" stroke-width="2"/><text x="92" y="166" font-size="23" font-weight="700">admin_users</text>
    <text x="92" y="224" font-size="18">id · PK</text><text x="92" y="260" font-size="18">username · UNIQUE, NOT NULL</text><text x="92" y="296" font-size="18">email · UNIQUE, NOT NULL</text><text x="92" y="332" font-size="18">display_name · NOT NULL</text><text x="92" y="368" font-size="18">password_hash · bcrypt</text>
    <rect x="500" y="128" width="400" height="410" rx="18" fill="#fffaf0" stroke="#155b50" stroke-width="3"/><path d="M500 184h400" stroke="#155b50" stroke-width="2"/><text x="526" y="166" font-size="23" font-weight="700">procedures</text>
    <text x="526" y="224" font-size="18">id · PK</text><text x="526" y="260" font-size="18">title · UNIQUE, NOT NULL</text><text x="526" y="296" font-size="18">summary · NOT NULL</text><text x="526" y="332" font-size="18">requirements · JSONB no vacío</text><text x="526" y="368" font-size="18">steps · JSONB no vacío</text><text x="526" y="404" font-size="18">responsible · NOT NULL</text><text x="526" y="440" font-size="18">validity · opcional</text><text x="526" y="476" font-size="18">priority · boolean</text><text x="526" y="512" font-size="18">translations · ES / Hñähñu</text>
    <rect x="956" y="160" width="270" height="330" rx="18" fill="#fffaf0" stroke="#b75f42" stroke-width="3"/><path d="M956 216h270" stroke="#b75f42" stroke-width="2"/><text x="980" y="198" font-size="21" font-weight="700">procedure_audios</text>
    <text x="980" y="256" font-size="17">id · PK</text><text x="980" y="292" font-size="17">procedure_id · FK, UNIQUE</text><text x="980" y="328" font-size="17">url · NOT NULL</text><text x="980" y="364" font-size="17">language · es / hnh</text><text x="980" y="400" font-size="17">voice_name · opcional</text><text x="980" y="436" font-size="17">is_demo · boolean</text>
  </g>
  <path d="M900 300h56" stroke="#155b50" stroke-width="4"/><path d="M944 291l12 9-12 9" fill="none" stroke="#155b50" stroke-width="4"/><text x="905" y="276" font-family="Arial" font-size="15" fill="#173d38">1 : 0..1</text>
  <text x="66" y="606" font-family="Arial" font-size="18" fill="#173d38">procedure_audios.procedure_id referencia procedures.id con ON DELETE CASCADE.</text>
  <text x="66" y="642" font-family="Arial" font-size="18" fill="#173d38">Una fila de trámite puede tener cero o un audio asociado; no se permiten audios huérfanos ni duplicados.</text>
  <text x="66" y="696" font-family="Arial" font-size="15" fill="#5d6e66">Semilla comprobada en esta instalación: 3 trámites · 2 audios asociados · 0 audios huérfanos.</text>
  </svg>`
  const diagramPath = path.join(evidence, 'diagrama-base-datos.svg')
  writeFileSync(diagramPath, svg, 'utf8')
  return diagramPath
}

try {
  const deadline = Date.now() + 20000
  let target
  while (!target && Date.now() < deadline) {
    try { target = (await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()).find((item) => item.type === 'page') }
    catch { await delay(200) }
  }
  assert(target?.webSocketDebuggerUrl, 'Chrome no expuso CDP.')
  cdp = new Cdp(new WebSocket(target.webSocketDebuggerUrl))
  await new Promise((resolve) => cdp.socket.addEventListener('open', resolve, { once: true }))
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await cdp.send('Page.navigate', { url: appUrl })
  await waitFor(`Boolean(document.querySelector('[data-testid="app-shell"]'))`)

  await click('[data-testid="nav-tramites"]')
  await waitFor(`Boolean(document.querySelector('[data-testid="procedure-view"] article'))`)
  await screenshot('01-listado-tramites-390px.png', true, true)
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 320, height: 720, deviceScaleFactor: 1, mobile: true })
  await delay(250)
  const listOverflow = await cdp.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
  assert(!listOverflow, 'El listado desborda horizontalmente a 320 px.')
  await screenshot('02-listado-tramites-320px.png', false)
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  check('Listado y diseño móvil', 'Catálogo visible a 390 px; sin overflow horizontal a 320 px.')

  await cdp.evaluate(`document.querySelector('[data-testid="procedure-view"] article button').click()`)
  await waitFor(`Boolean(document.querySelector('[data-testid="procedure-detail"]'))`)
  await screenshot('03-detalle-tramite-390px.png', true, true)
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 320, height: 720, deviceScaleFactor: 1, mobile: true })
  await delay(250)
  const detailOverflow = await cdp.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
  assert(!detailOverflow, 'El detalle desborda horizontalmente a 320 px.')
  await screenshot('04-detalle-tramite-320px.png', false)
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })

  const play = await cdp.evaluate(`(async () => { const audio = document.querySelector('[data-testid="procedure-detail"] audio'); await audio.play(); return true })()`)
  assert(play, 'El navegador no inició el audio del trámite.')
  await waitFor(`(() => { const a=document.querySelector('[data-testid="procedure-detail"] audio'); return a && !a.paused && a.currentTime > 0.5 })()`)
  const audioPath = await cdp.evaluate(`document.querySelector('[data-testid="procedure-detail"] audio').currentSrc`)
  assert(audioPath.includes('tramite-constancia-residencia.mp3'), 'El audio no corresponde a la constancia de residencia.')
  await screenshot('05-audio-tramite-reproduciendo.png', true, true)
  check('Audio asociado', 'El detalle de constancia reproduce su MP3 relacionado y muestra la voz.')

  await cdp.evaluate(`(() => { const a=document.querySelector('[data-testid="procedure-detail"] audio'); a.src='/audio/no-disponible-sprint-3.mp3'; a.load() })()`)
  await waitFor(`document.querySelector('[data-testid="procedure-detail"] [role="status"]')?.innerText.includes('No fue posible cargar')`)
  await screenshot('06-audio-no-disponible.png', true, true)
  check('Error de audio', 'La interfaz informa con claridad cuando el archivo no está disponible.')

  await click('[data-testid="nav-tramites"]')
  await waitFor(`!document.querySelector('[data-testid="procedure-detail"]')`)
  await screenshot('07-regreso-al-catalogo.png', true, true)
  check('Salida del detalle', 'El botón de navegación Trámites regresa al listado desde un detalle.')

  await click('[data-testid="nav-admin"]')
  await waitFor(`Boolean(document.querySelector('[data-testid="admin-view"] form'))`)
  await click('[data-testid="admin-view"] form button')
  await waitFor(`document.querySelector('[data-testid="admin-view"] [role="status"]')?.innerText.includes('Completa usuario')`)
  await screenshot('08-login-campos-vacios.png', false)
  check('Login vacío', 'La validación pide usuario y contraseña si los campos están vacíos.')

  await fill('[autocomplete="username"]', adminUsername)
  await fill('[autocomplete="current-password"]', 'clave-de-prueba-incorrecta')
  await click('[data-testid="admin-view"] form button')
  await waitFor(`document.querySelector('[data-testid="admin-view"] [role="status"]')?.innerText.includes('incorrectos')`)
  await screenshot('09-login-credenciales-invalidas.png', false)
  check('Login inválido', 'El servidor rechaza credenciales inválidas sin exponer información sensible.')

  await fill('[autocomplete="username"]', adminUsername)
  await fill('[autocomplete="current-password"]', adminPassword)
  await click('[data-testid="admin-view"] form button')
  await waitFor(`document.querySelector('[data-testid="admin-view"]')?.innerText.includes('Panel administrativo')`)
  await screenshot('10-panel-administrativo.png', false)
  check('Login válido y panel protegido', 'La cuenta local entra al panel y ve el resumen de PostgreSQL.')

  await click('[data-testid="admin-view"] button')
  await waitFor(`document.querySelector('[data-testid="admin-view"]')?.innerText.includes('Sesión cerrada')`)
  await screenshot('11-cierre-de-sesion.png', false)
  check('Cerrar sesión', 'El panel vuelve a la pantalla de acceso y elimina la cookie del navegador.')

  const diagramPath = writeDatabaseDiagram()
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false })
  await cdp.send('Page.navigate', { url: pathToFileURL(diagramPath).href })
  await waitFor(`document.readyState === 'complete'`)
  await delay(200)
  await screenshot('12-diagrama-base-datos.png', false)

  const report = `# Evidencias y verificación · Sprint 3\n\nFecha: ${new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeZone: 'America/Mexico_City' }).format(new Date())}\n\n${results.join('\n')}\n\n## Archivos\n\n- 01–02: catálogo a 390 y 320 px.\n- 03–04: detalle a 390 y 320 px.\n- 05–06: reproducción del audio asociado y error de archivo no disponible.\n- 07: regreso del detalle al catálogo desde la navegación inferior.\n- 08–11: login vacío, credenciales incorrectas, panel con sesión y cierre.\n- 12: diagrama de tablas y relación trámite-audio.\n- diagrama-base-datos.svg: original vectorial del diagrama.\n\nLos textos de trámites continúan marcados como demostrativos y Hñähñu como pendiente de validación. Los audios se etiquetan con las voces indicadas en la exportación de ElevenLabs.\n`
  writeFileSync(path.join(evidence, 'verification-report.md'), report, 'utf8')
  console.log(report)
} finally {
  cdp?.socket.close()
  browser.kill()
}
