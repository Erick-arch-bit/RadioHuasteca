#!/usr/bin/env node
// ---------------------------------------------------------------------------
// RadioHuasteca · Verificación automática del Sprint 1
//
// Comprueba los criterios de aceptación de docs/sprint-1-spec.md §4 sin añadir
// dependencias al proyecto: usa Node estándar, ffprobe (si está) y Chromium
// headless mediante el protocolo CDP.
//
//   node scripts/verify-sprint-1.mjs              # todo (estático + build + UI)
//   node scripts/verify-sprint-1.mjs --static-only # sin build ni navegador
//   node scripts/verify-sprint-1.mjs --ui-only     # solo las pruebas de UI
//
// Salida: resumen en consola, capturas en docs/evidence/sprint-1/ y el informe
// docs/evidence/sprint-1/verification-report.md
// ---------------------------------------------------------------------------
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { audioSources, bulletin } from '../src/data/bulletin.js'
import { translations } from '../src/i18n/translations.js'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const evidenceDir = path.join(repoRoot, 'docs', 'evidence', 'sprint-1')
const flags = new Set(process.argv.slice(2))
const runStatic = !flags.has('--ui-only')
const runUi = !flags.has('--static-only')

const PREVIEW_PORT = 4319
const DEBUG_PORT = 9333
const VIEWPORTS = [
  { width: 320, height: 760, label: '320 px' },
  { width: 360, height: 800, label: '360 px' },
  { width: 390, height: 844, label: '390 px' },
]

const results = []
let failed = 0

class SkipCheck extends Error {}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function check(id, title, fn) {
  try {
    const detail = await fn()
    results.push({ id, title, status: 'PASS', detail: detail ?? '' })
    console.log(`  \u2714 ${id}  ${title}${detail ? ` — ${detail}` : ''}`)
  } catch (error) {
    if (error instanceof SkipCheck) {
      results.push({ id, title, status: 'SKIP', detail: error.message })
      console.log(`  \u26a0 ${id}  ${title} — OMITIDA: ${error.message}`)
      return
    }
    failed += 1
    results.push({ id, title, status: 'FAIL', detail: error.message })
    console.log(`  \u2716 ${id}  ${title} — FALLA: ${error.message}`)
  }
}

function readSourceFiles(dir = path.join(repoRoot, 'src'), collected = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) readSourceFiles(full, collected)
    else if (/\.(js|jsx)$/.test(entry)) collected.push(full)
  }
  return collected
}

function humanSize(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`
}

function commandExists(binary) {
  const probe = spawnSync('sh', ['-c', `command -v "${binary}"`], { encoding: 'utf8' })
  return probe.status === 0 && probe.stdout.trim().length > 0
}

/** Traduce una ruta servida (`/audio/...`) al archivo real dentro del repositorio. */
function resolvePublicFile(src) {
  return path.join(repoRoot, 'public', src.replace(/^\//, ''))
}

// ---------------------------------------------------------------------------
// 1. Comprobaciones estáticas
// ---------------------------------------------------------------------------
async function verifyStatic() {
  console.log('\n[1/3] Comprobaciones estáticas')

  await check('CA-03.1', 'Audio real versionado en el repositorio (< 1.5 MB por archivo)', () => {
    assert(audioSources.length >= 2, 'se esperaban al menos dos formatos (Opus + MP3)')
    return audioSources
      .map((source) => {
        const relative = source.src.replace(/^\//, '')
        const file = resolvePublicFile(source.src)
        assert(existsSync(file), `no existe public/${relative}`)
        const size = statSync(file).size
        assert(size < 1536 * 1024, `${relative} pesa ${humanSize(size)} y el límite es 1.5 MB`)
        return `${relative} (${humanSize(size)})`
      })
      .join(' · ')
      .concat(bulletin.isDemo ? ' · audio de demostración del Sprint 1' : ' · audio definitivo')
  })

  await check('CA-03.1b', 'Los archivos de audio se decodifican y duran más de 20 s', () => {
    if (!commandExists('ffprobe')) throw new SkipCheck('ffprobe no está instalado en este equipo')
    return audioSources
      .map((source) => {
        const file = resolvePublicFile(source.src)
        const probe = spawnSync(
          'ffprobe',
          ['-v', 'error', '-show_entries', 'format=duration,format_name', '-of', 'json', file],
          { encoding: 'utf8' },
        )
        assert(probe.status === 0, `ffprobe no pudo leer ${path.basename(file)}`)
        const info = JSON.parse(probe.stdout).format
        const duration = Number(info.duration)
        assert(duration > 20, `${path.basename(file)} dura solo ${info.duration} s`)
        return `${path.basename(file)}: ${duration.toFixed(1)} s (${info.format_name})`
      })
      .join(' · ')
  })

  await check('CA-03.1c', 'Sin audio sintético ni URLs externas en src/', () => {
    const files = readSourceFiles()
    const offenders = []
    for (const file of files) {
      const text = readFileSync(file, 'utf8')
      const relative = path.relative(repoRoot, file)
      if (/https?:\/\//.test(text)) offenders.push(`${relative} (URL externa)`)
      if (/createOscillator|AudioContext/.test(text)) offenders.push(`${relative} (Web Audio sintético)`)
    }
    assert(offenders.length === 0, `quedan restos: ${offenders.join(', ')}`)
    return `${files.length} archivos revisados`
  })

  await check('CA-13.2', 'Paridad de claves ES / Hñähñu y sin cadenas vacías', () => {
    const es = Object.keys(translations.es).sort()
    const hnh = Object.keys(translations.hnh).sort()
    const missing = es.filter((key) => !hnh.includes(key))
    const extra = hnh.filter((key) => !es.includes(key))
    assert(missing.length === 0, `faltan en hnh: ${missing.join(', ')}`)
    assert(extra.length === 0, `sobran en hnh: ${extra.join(', ')}`)
    const blanks = Object.entries(translations).flatMap(([locale, dict]) =>
      Object.entries(dict)
        .filter(([, value]) => typeof value !== 'string' || value.trim() === '')
        .map(([key]) => `${locale}.${key}`),
    )
    assert(blanks.length === 0, `cadenas vacías: ${blanks.join(', ')}`)
    const drafts = hnh.filter((key) => translations.hnh[key] === translations.es[key])
    return `${es.length} claves · ${hnh.length - drafts.length} con propuesta en Hñähñu · ${drafts.length} conservan español (declaradas como borrador)`
  })

  await check('CA-02.1', 'Tailwind CSS activo: dependencia, plugin de Vite y hoja base', () => {
    const pkg = JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))
    assert(pkg.devDependencies?.tailwindcss, 'tailwindcss no está en devDependencies')
    assert(pkg.devDependencies?.['@tailwindcss/vite'], '@tailwindcss/vite no está en devDependencies')
    const viteConfig = readFileSync(path.join(repoRoot, 'vite.config.js'), 'utf8')
    assert(viteConfig.includes('@tailwindcss/vite'), 'vite.config.js no registra el plugin de Tailwind')
    const indexCss = readFileSync(path.join(repoRoot, 'src/index.css'), 'utf8')
    assert(indexCss.includes('@import "tailwindcss"'), 'src/index.css no importa Tailwind')
    assert(indexCss.includes('@theme'), 'src/index.css no declara los tokens en @theme')
    return `tailwindcss ${pkg.devDependencies.tailwindcss}`
  })

  await check('CA-02.3', 'Sin CSS propio duplicado y sin código de sprints futuros', () => {
    assert(!existsSync(path.join(repoRoot, 'src/App.css')), 'src/App.css sigue existiendo')
    const removed = [
      'src/components/PlayerHero.jsx',
      'src/components/Sidebar.jsx',
      'src/components/WorkspaceHeader.jsx',
      'src/components/PostModal.jsx',
      'src/components/CommunityFeed.jsx',
      'src/components/Eventos.jsx',
      'src/components/LivePodcasts.jsx',
      'src/components/Participa.jsx',
      'src/components/RightRail.jsx',
      'src/components/Trámites.jsx',
      'src/data/radioData.js',
      'public/icons.svg',
      'src/assets/react.svg',
      'src/assets/vite.svg',
    ]
    const stillThere = removed.filter((file) => existsSync(path.join(repoRoot, file)))
    assert(stillThere.length === 0, `siguen presentes: ${stillThere.join(', ')}`)
    return `${removed.length} archivos muertos eliminados`
  })

  await check('CA-DOC.1–6', 'README alineado a RadioHuasteca con stack, Tailwind y evidencias', () => {
    const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8')
    const required = [
      'RadioHuasteca',
      'Santa Ana Hueytlalpan',
      'Tailwind',
      'npm install',
      'npm run dev',
      'npm run build',
      'npm run preview',
      'npm run lint',
      'npm run verify:sprint1',
      'audio/boletin-demo',
      'generate-bulletin-audio',
      'docs/sprint-1-spec.md',
      'docs/sprint-1-verification.md',
    ]
    const missing = required.filter((token) => !readme.includes(token))
    assert(missing.length === 0, `falta documentar: ${missing.join(', ')}`)
    return `${required.length} elementos presentes`
  })

  await check('CA-DOC.7', 'index.html en español, con el nombre del proyecto y descripción', () => {
    const html = readFileSync(path.join(repoRoot, 'index.html'), 'utf8')
    assert(html.includes('lang="es"'), 'falta lang="es"')
    assert(/<title>[^<]*RadioHuasteca[^<]*<\/title>/.test(html), 'el título no contiene RadioHuasteca')
    assert(html.includes('name="description"'), 'falta la meta descripción')
    return 'lang, título y descripción correctos'
  })
}

// ---------------------------------------------------------------------------
// 2. Build de producción
// ---------------------------------------------------------------------------
async function verifyBuild() {
  console.log('\n[2/3] Build de producción')

  await check('CA-02.2', 'npm run build compila Tailwind y publica el audio del boletín', () => {
    const build = spawnSync('npm', ['run', 'build'], { cwd: repoRoot, encoding: 'utf8' })
    assert(
      build.status === 0,
      `npm run build falló: ${(build.stderr || build.stdout || '').trim().split('\n').slice(-4).join(' ')}`,
    )
    const dist = path.join(repoRoot, 'dist')
    const indexHtml = readFileSync(path.join(dist, 'index.html'), 'utf8')
    const cssMatch = indexHtml.match(/assets\/[^"']+\.css/)
    assert(cssMatch, 'dist/index.html no referencia la hoja CSS compilada')
    const cssPath = path.join(dist, cssMatch[0])
    const css = readFileSync(cssPath, 'utf8')
    assert(css.includes('681px'), 'la hoja compilada no contiene el breakpoint desk (681px) de Tailwind')
    for (const source of audioSources) {
      const file = path.join(dist, source.src.replace(/^\//, ''))
      assert(existsSync(file), `el build no copió ${source.src}`)
    }
    const jsMatch = build.stdout.match(/dist\/assets\/index-[\w-]+\.js\s+([\d.]+) kB/)
    return `CSS ${humanSize(Buffer.byteLength(css))} · JS ${jsMatch ? `${jsMatch[1]} kB` : 'n/d'} · audio publicado`
  })
}

// ---------------------------------------------------------------------------
// 3. Pruebas de interfaz en Chromium headless (CDP)
// ---------------------------------------------------------------------------
class CdpClient {
  constructor(socket) {
    this.socket = socket
    this.nextId = 1
    this.pending = new Map()
    this.handlers = new Map()
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id)
        this.pending.delete(message.id)
        if (message.error) reject(new Error(`${message.error.message} (${message.error.code})`))
        else resolve(message.result)
        return
      }
      if (message.method) {
        for (const handler of this.handlers.get(message.method) ?? []) handler(message.params)
      }
    })
  }

  static async connect(url, timeoutMs = 15000) {
    const socket = new WebSocket(url)
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('tiempo agotado al conectar con Chromium')), timeoutMs)
      socket.addEventListener('open', () => {
        clearTimeout(timer)
        resolve()
      })
      socket.addEventListener('error', () => {
        clearTimeout(timer)
        reject(new Error('no se pudo abrir el WebSocket de CDP'))
      })
    })
    return new CdpClient(socket)
  }

  send(method, params = {}) {
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }

  on(method, handler) {
    const list = this.handlers.get(method) ?? []
    list.push(handler)
    this.handlers.set(method, list)
  }

  onEvent(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`no llegó el evento ${method}`)), timeoutMs)
      this.on(method, (params) => {
        clearTimeout(timer)
        resolve(params)
      })
    })
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? 'error al evaluar en la página')
    }
    return result.result.value
  }

  close() {
    try {
      this.socket.close()
    } catch {
      // el socket ya estaba cerrado
    }
  }
}

async function waitForHttp(url, timeoutMs = 30000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
    } catch {
      // el servicio todavía no responde
    }
    await sleep(250)
  }
  throw new Error(`no hubo respuesta de ${url}`)
}

function startPreviewServer() {
  return spawn(
    'npm',
    ['run', 'preview', '--', '--port', String(PREVIEW_PORT), '--strictPort', '--host', '127.0.0.1'],
    { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'], detached: true },
  )
}

function startChromium() {
  const binary = process.env.CHROMIUM_BIN ?? 'chromium'
  return spawn(
    binary,
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--mute-audio',
      '--hide-scrollbars',
      '--autoplay-policy=no-user-gesture-required',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'], detached: true },
  )
}

/** Termina el proceso y todo su grupo (npm → vite preview; Chromium y sus hijos). */
function killTree(child) {
  if (!child?.pid) return
  try {
    process.kill(-child.pid, 'SIGTERM')
  } catch {
    try {
      child.kill('SIGTERM')
    } catch {
      // el proceso ya había terminado
    }
  }
}

async function waitForPageTarget() {
  const started = Date.now()
  while (Date.now() - started < 20000) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json()
      const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl)
      if (page) return page
    } catch {
      // Chromium todavía no expone la lista de pestañas
    }
    await sleep(250)
  }
  throw new Error('Chromium no expuso ninguna pestaña para depurar')
}

async function waitForSelector(cdp, selector, timeoutMs = 12000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const found = await cdp.evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)
    if (found) return true
    await sleep(120)
  }
  throw new Error(`no apareció ${selector} en la página`)
}

async function isVisible(cdp, selector) {
  return cdp.evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)})
    if (!el) return false
    const rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  })()`)
}

async function openPage(cdp, url, viewport) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width < 681,
  })
  const loaded = cdp.onEvent('Page.loadEventFired')
  await cdp.send('Page.navigate', { url })
  await loaded
  await waitForSelector(cdp, '[data-testid="bulletin-player"]')
  await waitForSelector(cdp, '[data-testid="player-time"]')
  await sleep(500) // deja terminar la animación de entrada
}

async function clickTestId(cdp, testId) {
  const exists = await cdp.evaluate(`(() => {
    const el = document.querySelector('[data-testid="${testId}"]')
    if (!el) return false
    el.scrollIntoView({ block: 'center', inline: 'center' })
    return true
  })()`)
  assert(exists, `no existe [data-testid="${testId}"]`)
  await sleep(150)
  const box = await cdp.evaluate(`(() => {
    const el = document.querySelector('[data-testid="${testId}"]')
    const rect = el.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height }
  })()`)
  const point = { x: Math.round(box.x), y: Math.round(box.y), button: 'left', clickCount: 1 }
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point })
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point })
  await sleep(200)
  return box
}

async function pressEscape(cdp) {
  const key = { key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 }
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...key })
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...key })
  await sleep(250)
}

const PLAYER_SNAPSHOT = `(() => {
  const container = document.querySelector('[data-testid="bulletin-player"]')
  const audio = document.querySelector('[data-testid="bulletin-audio"]')
  const status = document.querySelector('[data-testid="player-status"]')
  const time = document.querySelector('[data-testid="player-time"]')
  const toggle = document.querySelector('[data-testid="player-toggle"]')
  return {
    state: container ? container.dataset.state : null,
    source: container ? container.dataset.audioSrc : null,
    status: status ? status.textContent.trim() : null,
    time: time ? time.textContent.trim() : null,
    toggleLabel: toggle ? toggle.getAttribute('aria-label') : null,
    currentTime: audio ? audio.currentTime : -1,
    duration: audio && Number.isFinite(audio.duration) ? audio.duration : 0,
    paused: audio ? audio.paused : null,
    readyState: audio ? audio.readyState : -1,
    currentSrc: audio ? audio.currentSrc : null,
  }
})()`

async function readPlayer(cdp) {
  return cdp.evaluate(PLAYER_SNAPSHOT)
}

async function waitForPlayerState(cdp, expected, timeoutMs = 12000) {
  const started = Date.now()
  let snapshot = await readPlayer(cdp)
  while (Date.now() - started < timeoutMs) {
    snapshot = await readPlayer(cdp)
    if (snapshot.state === expected) return snapshot
    await sleep(150)
  }
  return null
}

async function captureScreenshot(cdp, name) {
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  writeFileSync(path.join(evidenceDir, name), Buffer.from(shot.data, 'base64'))
}

async function verifyUi() {
  console.log('\n[3/3] Interfaz real en Chromium headless (CDP)')

  if (!commandExists(process.env.CHROMIUM_BIN ?? 'chromium')) {
    console.log('  \u26a0 Chromium no disponible: se omiten las pruebas de interfaz (usar §4.2 del manual)')
    return
  }

  mkdirSync(evidenceDir, { recursive: true })

  let preview
  let chromium
  let cdp
  const browserErrors = []
  const appUrl = `http://127.0.0.1:${PREVIEW_PORT}/`

  try {
    preview = startPreviewServer()
    await waitForHttp(appUrl)
    chromium = startChromium()
    const target = await waitForPageTarget()
    cdp = await CdpClient.connect(target.webSocketDebuggerUrl)
    await cdp.send('Runtime.enable')
    await cdp.send('Page.enable')
    await cdp.send('Log.enable')
    cdp.on('Runtime.exceptionThrown', (params) => {
      browserErrors.push(`excepción: ${params.exceptionDetails?.exception?.description ?? params.exceptionDetails?.text}`)
    })
    cdp.on('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error') {
        browserErrors.push(`console.error: ${params.args.map((arg) => arg.value ?? arg.description ?? '').join(' ')}`)
      }
    })
    cdp.on('Log.entryAdded', (params) => {
      if (params.entry.level === 'error') browserErrors.push(`log: ${params.entry.text}`)
    })

    // ---------------- HU-12: anchos móviles ----------------
    for (const viewport of VIEWPORTS) {
      await check(`CA-12.1 · ${viewport.label}`, 'Sin desplazamiento horizontal', async () => {
        await openPage(cdp, appUrl, viewport)
        const metrics = await cdp.evaluate(
          `({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth })`,
        )
        assert(
          metrics.scrollWidth <= metrics.innerWidth + 1,
          `el documento mide ${metrics.scrollWidth} px en una pantalla de ${metrics.innerWidth} px`,
        )
        await captureScreenshot(cdp, `inicio-${viewport.width}px.png`)
        return `documento ${metrics.scrollWidth} px / pantalla ${metrics.innerWidth} px`
      })
    }

    await check('CA-12.2', 'Ningún bloque de contenido desborda su contenedor', async () => {
      const offenders = []
      for (const viewport of VIEWPORTS) {
        await openPage(cdp, appUrl, viewport)
        const overflowing = await cdp.evaluate(`[...document.querySelectorAll('[data-check-overflow]')]
          .map((el) => ({ label: el.className.split(' ').slice(0, 2).join(' '), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }))
          .filter((node) => node.scrollWidth > node.clientWidth + 1)`)
        for (const node of overflowing) {
          offenders.push(`${viewport.label}: ${node.scrollWidth} > ${node.clientWidth} (${node.label})`)
        }
      }
      assert(offenders.length === 0, offenders.join(' · '))
      return `${VIEWPORTS.length} anchos revisados`
    })

    await check('CA-12.3', 'Controles de la navegación inferior de al menos 36 px de alto', async () => {
      await openPage(cdp, appUrl, VIEWPORTS[0])
      const heights = await cdp.evaluate(
        `[...document.querySelectorAll('[data-testid^="nav-"]')].map((el) => Math.round(el.getBoundingClientRect().height))`,
      )
      assert(heights.length === 4, `se esperaban 4 destinos y hay ${heights.length}`)
      const smallest = Math.min(...heights)
      assert(smallest >= 36, `el control más bajo mide ${smallest} px`)
      return `alturas ${heights.join(' / ')} px`
    })
    // ---------------- HU-03: reproducción real del boletín ----------------
    await check('CA-03.2 → CA-03.4', 'Reproducir, pausar, reanudar y detener el boletín real', async () => {
      await openPage(cdp, appUrl, VIEWPORTS[1])
      const idle = await readPlayer(cdp)
      assert(idle.state === 'idle', `estado inicial inesperado: ${idle.state}`)
      assert(idle.status === 'Listo para escuchar', `texto inicial inesperado: "${idle.status}"`)
      assert(idle.toggleLabel === 'Escuchar boletín', `etiqueta inicial del botón: "${idle.toggleLabel}"`)
      assert(idle.duration > 20, `duración leída de los metadatos: ${idle.duration} s`)
      assert(/\d\d:\d\d \/ \d\d:\d\d/.test(idle.time), `marcador de tiempo inesperado: "${idle.time}"`)

      await clickTestId(cdp, 'player-toggle')
      const playing = await waitForPlayerState(cdp, 'playing')
      assert(playing, 'no se alcanzó el estado "playing"')
      assert(playing.status === 'Reproduciendo boletín', `texto en reproducción: "${playing.status}"`)
      assert(playing.toggleLabel === 'Pausar boletín', `etiqueta del botón: "${playing.toggleLabel}"`)
      assert(
        /boletin-demo\.(opus|mp3)/.test(playing.currentSrc ?? ''),
        `fuente reproducida inesperada: ${playing.currentSrc}`,
      )
      await sleep(900)
      const advanced = await readPlayer(cdp)
      assert(advanced.currentTime > 0.3, `el tiempo no avanzó (currentTime ${advanced.currentTime})`)
      assert(advanced.paused === false, 'el elemento <audio> sigue en pausa')
      await captureScreenshot(cdp, 'reproduciendo-360px.png')

      await clickTestId(cdp, 'player-toggle')
      const paused = await waitForPlayerState(cdp, 'paused')
      assert(paused, 'no se alcanzó el estado "paused"')
      assert(paused.status === 'Boletín en pausa', `texto en pausa: "${paused.status}"`)
      assert(paused.currentTime > 0.2, `la pausa perdió la posición (${paused.currentTime})`)
      await captureScreenshot(cdp, 'pausado-360px.png')

      await clickTestId(cdp, 'player-toggle')
      const resumed = await waitForPlayerState(cdp, 'playing')
      assert(resumed, 'no reanudó después de la pausa')
      assert(resumed.currentTime >= paused.currentTime, 'la reanudación retrocedió el audio')

      await clickTestId(cdp, 'player-stop')
      const stopped = await waitForPlayerState(cdp, 'idle')
      assert(stopped, 'detener no devolvió el estado "idle"')
      assert(stopped.currentTime === 0, `detener no reinició el tiempo (${stopped.currentTime})`)
      assert(stopped.status === 'Listo para escuchar', `texto tras detener: "${stopped.status}"`)
      return `formato elegido por el navegador: ${playing.currentSrc.split('/').pop()} · duración real ${playing.duration.toFixed(1)} s`
    })

    await check('CA-03.6', 'Estado de error anunciado y recuperable con Reintentar', async () => {
      const simulated = await cdp.evaluate(`(() => {
        const audio = document.querySelector('[data-testid="bulletin-audio"]')
        if (!audio) return false
        audio.dispatchEvent(new Event('error'))
        return true
      })()`)
      assert(simulated, 'no se pudo simular el fallo del audio')
      const errorState = await waitForPlayerState(cdp, 'error')
      assert(errorState, 'la interfaz no mostró el estado "error"')
      assert(
        errorState.status === 'No fue posible reproducir el audio.',
        `texto de error inesperado: "${errorState.status}"`,
      )
      assert(await isVisible(cdp, '[data-testid="player-retry"]'), 'no apareció el botón de reintento')
      await captureScreenshot(cdp, 'error-360px.png')

      await clickTestId(cdp, 'player-retry')
      const recovered = await waitForPlayerState(cdp, 'playing')
      assert(recovered, 'el reintento no devolvió la reproducción')
      await clickTestId(cdp, 'player-stop')
      await waitForPlayerState(cdp, 'idle')
      return 'error anunciado → reintento → reproducción recuperada'
    })

    // ---------------- HU-02 y HU-13: navegación e idioma ----------------
    await check('CA-02n.2 → CA-02n.5', 'Menú móvil, destino activo y regreso sin perder el boletín', async () => {
      await openPage(cdp, appUrl, VIEWPORTS[1])

      await clickTestId(cdp, 'menu-toggle')
      assert(await isVisible(cdp, '[data-testid="mobile-menu"]'), 'el menú móvil no se abrió')
      const expanded = await cdp.evaluate(
        `document.querySelector('[data-testid="menu-toggle"]').getAttribute('aria-expanded')`,
      )
      assert(expanded === 'true', `aria-expanded = ${expanded} con el menú abierto`)
      await pressEscape(cdp)
      assert(!(await isVisible(cdp, '[data-testid="mobile-menu"]')), 'Escape no cerró el menú')

      await clickTestId(cdp, 'menu-toggle')
      await clickTestId(cdp, 'menu-backdrop')
      assert(!(await isVisible(cdp, '[data-testid="mobile-menu"]')), 'el fondo no cerró el menú')

      await clickTestId(cdp, 'menu-toggle')
      await clickTestId(cdp, 'menu-item-avisos')
      assert(await isVisible(cdp, '[data-testid="inner-view"]'), 'no se abrió la vista de Avisos')
      assert(!(await isVisible(cdp, '[data-testid="mobile-menu"]')), 'el menú no se cerró al elegir una opción')
      const current = await cdp.evaluate(
        `document.querySelector('[data-testid="nav-avisos"]').getAttribute('aria-current')`,
      )
      assert(current === 'page', `aria-current en Avisos = ${current}`)

      await clickTestId(cdp, 'nav-inicio')
      await clickTestId(cdp, 'player-toggle')
      assert(await waitForPlayerState(cdp, 'playing'), 'no arrancó la reproducción')
      await clickTestId(cdp, 'nav-sobre')
      const whileAway = await readPlayer(cdp)
      assert(whileAway.paused === false, 'el audio se pausó al cambiar de vista')

      await clickTestId(cdp, 'back-link')
      assert(await isVisible(cdp, '[data-testid="bulletin-player"]'), 'el regreso no volvió a Inicio')
      const backHome = await readPlayer(cdp)
      assert(backHome.paused === false, 'el audio se detuvo al volver a Inicio')
      assert(backHome.state === 'playing', `estado del reproductor al volver: ${backHome.state}`)
      await clickTestId(cdp, 'player-stop')
      await waitForPlayerState(cdp, 'idle')
      return 'apertura/cierre del menú, aria-current y continuidad del audio verificados'
    })

    await check('CA-13.3 / CA-13.4', 'Cambio ES/Hñähñu con aviso de traducción en borrador', async () => {
      await openPage(cdp, appUrl, VIEWPORTS[1])
      const spanish = await cdp.evaluate(`(() => {
        const shell = document.querySelector('[data-testid="app-shell"]')
        return {
          locale: shell.dataset.locale,
          draft: Boolean(document.querySelector('[data-testid="draft-notice"]')),
          pressedEs: document.querySelector('[data-testid="locale-es"]').getAttribute('aria-pressed'),
        }
      })()`)
      assert(spanish.locale === 'es', `locale inicial ${spanish.locale}`)
      assert(spanish.draft === false, 'el aviso de borrador aparece en español')
      assert(spanish.pressedEs === 'true', `aria-pressed de ES = ${spanish.pressedEs}`)

      await clickTestId(cdp, 'locale-hnh')
      const hnahnu = await cdp.evaluate(`(() => {
        const shell = document.querySelector('[data-testid="app-shell"]')
        return {
          locale: shell.dataset.locale,
          status: shell.dataset.translationStatus,
          draft: Boolean(document.querySelector('[data-testid="draft-notice"]')),
        }
      })()`)
      assert(
        hnahnu.locale === 'hnh' && hnahnu.status === 'draft',
        `locale/estado tras cambiar: ${hnahnu.locale}/${hnahnu.status}`,
      )
      assert(hnahnu.draft, 'no se mostró el aviso de traducción pendiente de validación')
      assert(await waitForPlayerState(cdp, 'idle'), 'el reproductor perdió su estado al cambiar de idioma')
      await captureScreenshot(cdp, 'hnahnu-360px.png')

      await clickTestId(cdp, 'locale-es')
      const noticeGone = await cdp.evaluate(`document.querySelector('[data-testid="draft-notice"]') === null`)
      assert(noticeGone, 'el aviso de borrador siguió visible al volver a español')
      return 'ES ↔ Hñähñu con aviso de borrador verificados'
    })

    await check('CA-12.4', 'Escritorio (≥ 681 px): tres accesos rápidos y menú móvil oculto', async () => {
      await openPage(cdp, appUrl, { width: 1280, height: 900 })
      const layout = await cdp.evaluate(`(() => {
        const quick = document.querySelector('[data-testid="quick-avisos"]')
        const grid = quick ? quick.parentElement : null
        return {
          columns: grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0,
          menuHeight: document.querySelector('[data-testid="menu-toggle"]').getBoundingClientRect().height,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }
      })()`)
      assert(layout.columns === 3, `la rejilla de accesos rápidos tiene ${layout.columns} columnas`)
      assert(layout.menuHeight === 0, 'el botón de menú móvil sigue visible en escritorio')
      assert(layout.scrollWidth <= layout.innerWidth + 1, 'hay desplazamiento horizontal en escritorio')
      await captureScreenshot(cdp, 'escritorio-1280px.png')
      return `${layout.columns} columnas · sin desplazamiento horizontal`
    })

    await check('CA-03.6b', 'Sin errores no controlados en la consola del navegador', () => {
      const relevant = browserErrors.filter((entry) => !/favicon/i.test(entry))
      assert(relevant.length === 0, relevant.slice(0, 4).join(' | '))
      return `${browserErrors.length} mensajes de error`
    })

  } finally {
    cdp?.close()
    killTree(chromium)
    killTree(preview)
    await sleep(400)
  }
}

// ---------------------------------------------------------------------------
// Informe y ejecución
// ---------------------------------------------------------------------------
function writeReport() {
  mkdirSync(evidenceDir, { recursive: true })
  const passed = results.filter((item) => item.status === 'PASS').length
  const skipped = results.filter((item) => item.status === 'SKIP').length
  const command = ['node scripts/verify-sprint-1.mjs', ...flags].join(' ')
  const lines = [
    '# Informe automático · Verificación del Sprint 1 · RadioHuasteca',
    '',
    '- **Fecha de la ejecución:** ' + new Date().toISOString(),
    '- **Comando:** `' + command + '`',
    '- **Resultado:** ' + `${passed} correctas · ${failed} fallas · ${skipped} omitidas`,
    '',
    '| Criterio | Comprobación | Estado | Detalle |',
    '| --- | --- | --- | --- |',
    ...results.map(
      (item) => `| ${item.id} | ${item.title} | ${item.status} | ${item.detail.replace(/\|/g, '\\|')} |`,
    ),
    '',
    '> Generado automáticamente. No editar a mano: vuelve a ejecutar `npm run verify:sprint1`.',
    '',
  ]
  writeFileSync(path.join(evidenceDir, 'verification-report.md'), lines.join('\n'))
}

async function main() {
  console.log('RadioHuasteca · verificación del Sprint 1')
  console.log(`Repositorio: ${repoRoot}`)
  mkdirSync(evidenceDir, { recursive: true })

  if (runStatic) await verifyStatic()
  if (runUi) {
    await verifyBuild()
    await verifyUi()
  }

  const passed = results.filter((item) => item.status === 'PASS').length
  const skipped = results.filter((item) => item.status === 'SKIP').length
  writeReport()

  console.log(`\nResumen: ${passed} correctas · ${failed} fallas · ${skipped} omitidas`)
  console.log(`Informe: ${path.relative(repoRoot, path.join(evidenceDir, 'verification-report.md'))}`)
  console.log(`Evidencias gráficas: ${path.relative(repoRoot, evidenceDir)}`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('La verificación se detuvo:', error.message)
  process.exit(1)
})





