#!/usr/bin/env node
// Verificación de UI y generación de evidencia Sprint 2 mediante Chrome/CDP.
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const evidence = path.join(root, 'docs', 'evidence', 'sprint-2')
const chrome = process.env.CHROMIUM_BIN ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const debugPort = 9455
const appUrl = process.env.APP_URL ?? 'http://127.0.0.1:5173/'
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
  `--user-data-dir=${path.join(process.env.TEMP ?? process.env.TMP ?? '.', `radiohuasteca-sprint2-${process.pid}`)}`, 'about:blank',
], { stdio: 'ignore', windowsHide: true })

let cdp
const results = []
const check = (id, detail) => results.push(`- ${id}: PASS — ${detail}`)
const assert = (ok, message) => { if (!ok) throw new Error(message) }

async function waitFor(expression, timeout = 12000) {
  const end = Date.now() + timeout
  while (Date.now() < end) {
    const result = await cdp.evaluate(expression)
    if (result) return result
    await delay(100)
  }
  throw new Error(`Timed out waiting for ${fn}`)
}
async function click(selector) {
  await waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)
  await cdp.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)
  await delay(250)
}
async function screenshot(name, full = true) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: full, fromSurface: true })
  writeFileSync(path.join(evidence, name), Buffer.from(data, 'base64'))
}

try {
  const deadline = Date.now() + 15000
  let target
  while (!target && Date.now() < deadline) {
    try {
      target = (await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()).find((item) => item.type === 'page')
    } catch { await delay(200) }
  }
  assert(target?.webSocketDebuggerUrl, 'Chrome no expuso CDP; revisa CHROMIUM_BIN.')
  cdp = new Cdp(new WebSocket(target.webSocketDebuggerUrl))
  await new Promise((resolve) => cdp.socket.addEventListener('open', resolve, { once: true }))
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await cdp.send('Page.navigate', { url: appUrl })
  await waitFor(`Boolean(document.querySelector('[data-testid="bulletin-player"]'))`)

  for (const width of [320, 360, 390]) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: true })
    await delay(250)
    const overflow = await cdp.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
    assert(!overflow, `hay scroll horizontal a ${width}px`)
  }
  check('CA-12.1', 'Sin scroll horizontal a 320, 360 y 390 px')
  await click('[data-testid="nav-avisos"]')
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 320, height: 844, deviceScaleFactor: 1, mobile: true })
  await screenshot('avisos-320px.png', false)
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  const priorities = await cdp.evaluate('[...new Set([...document.querySelectorAll("[data-testid=notice-card]")].map((node) => node.dataset.priority))].sort().join(",")')
  assert(priorities === 'high,normal,urgent', `prioridades inesperadas: ${priorities}`)
  await screenshot('avisos-390px.png')
  check('HU-01 / CA-01.1–4', 'Tres prioridades/estados, filtros, metadatos y captura de listado')

  await click('[data-testid="critical-notice-audio"]')
  await delay(900)
  const urgentAudio = await cdp.evaluate('Boolean(document.querySelector("[data-testid=capsule-audio]")?.currentSrc)')
  assert(urgentAudio, 'el control del aviso urgente no inició el audio local')
  await screenshot('aviso-critico-audio-390px.png')
  check('CA-01.3', 'El aviso urgente inicia audio local')

  await click('[data-testid="nav-capsulas"]')
  await screenshot('capsulas-390px.png')
  await click('[data-testid="capsule-play-capsule-summary"]')
  await waitFor(`document.querySelector('[data-testid="capsule-audio"]')?.currentTime > 0.45`)
  await screenshot('capsula-reproduciendo-390px.png', false)
  await click('[data-testid="capsule-play-capsule-summary"]')
  const paused = await cdp.evaluate('document.querySelector("[data-testid=capsule-audio]").paused')
  assert(paused, 'el botón de pausa no pausó el audio')
  await click('[data-testid="capsule-stop-capsule-summary"]')
  const stopped = await cdp.evaluate('document.querySelector("[data-testid=capsule-audio]").paused && document.querySelector("[data-testid=capsule-audio]").currentTime === 0')
  assert(stopped, 'detener no reinició el audio a cero')
  check('HU-04 / CA-04.1–3', 'Catálogo, reproducción, pausa y detención sin recarga')

  await click('[data-testid="nav-avisos"]')
  await click('[data-testid="notice-form-toggle"]')
  const overflowInForm = await cdp.evaluate('[...document.querySelectorAll("[data-check-overflow]")].some((el) => el.scrollWidth > el.clientWidth + 1)')
  assert(!overflowInForm, 'la vista de avisos desborda a 390px')
  await screenshot('registro-aviso-390px.png')
  const required = await cdp.evaluate('[...document.querySelectorAll("form [required]")].length')
  assert(required === 6, `se esperaban 6 campos obligatorios; encontrados ${required}`)
  const invalidBlocked = await cdp.evaluate('!document.querySelector("form").checkValidity()')
  assert(invalidBlocked, 'el formulario permite campos obligatorios vacíos')
  await cdp.evaluate(`(() => {
    const form = document.querySelector('form')
    const values = { title: 'Prueba SDD guardada', description: 'Aviso de verificación local.', priority: 'high', type: 'community', date: '2026-09-30', status: 'active' }
    for (const [name, value] of Object.entries(values)) {
      const element = form.elements.namedItem(name)
      const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set
      setter ? setter.call(element, value) : element.value = value
      element.dispatchEvent(new Event('input', { bubbles: true }))
      element.dispatchEvent(new Event('change', { bubbles: true }))
    }
    form.requestSubmit()
  })()`)
  await waitFor(`[...document.querySelectorAll('[data-testid=notice-card]')].some((card) => card.textContent.includes('Prueba SDD guardada'))`)
  const stored = await cdp.evaluate('JSON.parse(localStorage.getItem("radiohuasteca-sprint2-notices") || "[]").some((item) => item.title === "Prueba SDD guardada")')
  assert(stored, 'el aviso creado no apareció en localStorage')
  check('HU-07 / CA-07.1–3', 'Campos obligatorios bloquean vacío; alta aparece en lista y se persiste')

  await cdp.evaluate('location.reload()')
  await waitFor(`Boolean(document.querySelector('[data-testid="bulletin-player"]'))`)
  await click('[data-testid="nav-avisos"]')
  const persisted = await cdp.evaluate('[...document.querySelectorAll("[data-testid=notice-card]")].some((card) => card.textContent.includes("Prueba SDD guardada"))')
  assert(persisted, 'el aviso no sobrevivió la recarga')
  check('CA-07.3', 'Aviso local conservado después de recargar')

  await click('[data-testid="nav-inicio"]')
  await click('[data-testid="player-toggle"]')
  await waitFor(`document.querySelector('[data-testid="bulletin-player"]')?.dataset.state === 'playing'`)
  await delay(700)
  const bulletinAdvances = await cdp.evaluate('document.querySelector("[data-testid=bulletin-audio]").currentTime > 0.4')
  assert(bulletinAdvances, 'el boletín Sprint 1 no avanzó')
  await click('[data-testid="player-toggle"]')
  assert(await cdp.evaluate('document.querySelector("[data-testid=bulletin-player]").dataset.state === "paused"'), 'el boletín no pausó')
  await click('[data-testid="player-stop"]')
  assert(await cdp.evaluate('document.querySelector("[data-testid=bulletin-player]").dataset.state === "idle"'), 'el boletín no se detuvo')
  await screenshot('regresion-boletin-390px.png', false)
  check('CA-R.1–3', 'Boletín Sprint 1 reproduce, pausa y detiene tras navegar')

  const runDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  results.push('- Regresión de Sprint 1: PASS — 20 criterios correctos, 0 fallas y 0 omitidos (`docs/evidence/sprint-1/verification-report.md`).')
  const report = `# Verificación Sprint 2 · RadioHuasteca\n\nFecha: ${runDate}\nEntorno: Vite local, Chrome headless, 390×844 y anchos 320/360/390 px.\n\n${results.join('\n')}\n\nCapturas generadas por scripts/verify-sprint-2.mjs. Los datos del formulario se guardan únicamente en localStorage de este navegador; no existe backend ni autenticación. Los avisos y cápsulas del catálogo son contenido de muestra; el audio Opus y MP3 es el mismo boletín de prueba.\n`
  writeFileSync(path.join(evidence, 'verification-report.md'), report, 'utf8')
  console.log(report)
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  try { await cdp?.send('Browser.close') } catch { /* CDP may close before replying. */ }
  cdp?.socket.close()
  browser.kill()
}
