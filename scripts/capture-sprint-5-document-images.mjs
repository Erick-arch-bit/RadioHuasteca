#!/usr/bin/env node
// Captura vistas reales de RadioHuasteca para insertar en la retrospectiva.
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, 'docs/evidence/sprint-5')
const browserPath = process.env.BROWSER_BIN ?? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const port = 9475
mkdirSync(output, { recursive: true })
const browser = spawn(browserPath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(os.tmpdir(), `radiohuasteca-s5-${process.pid}`)}`,
  'about:blank',
], { stdio: 'ignore', windowsHide: true })

let cdp
let id = 0
const pending = new Map()
function send(method, params = {}) {
  const requestId = ++id
  return new Promise((resolve, reject) => {
    pending.set(requestId, { resolve, reject })
    cdp.send(JSON.stringify({ id: requestId, method, params }))
  })
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? 'Error de navegador')
  return result.result.value
}
async function waitFor(expression) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await evaluate(expression)) return
    await delay(100)
  }
  throw new Error(`No se encontró la vista esperada: ${expression}`)
}
async function capture(filename) {
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, fromSurface: true })
  writeFileSync(path.join(output, filename), Buffer.from(data, 'base64'))
}
async function selectView(view) {
  await evaluate(`document.querySelector('[data-testid="nav-${view}"]').click()`)
  await delay(650)
}

try {
  let target
  const deadline = Date.now() + 15000
  while (!target && Date.now() < deadline) {
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((item) => item.type === 'page') }
    catch { await delay(150) }
  }
  if (!target) throw new Error('El navegador no inició CDP.')
  cdp = new WebSocket(target.webSocketDebuggerUrl)
  cdp.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data)
    if (!message.id) return
    const waiter = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) waiter?.reject(new Error(message.error.message))
    else waiter?.resolve(message.result)
  })
  await new Promise((resolve) => cdp.addEventListener('open', resolve, { once: true }))
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: process.env.APP_URL ?? 'http://127.0.0.1:5173/' })
  await waitFor(`Boolean(document.querySelector('[data-testid="app-shell"]'))`)
  await delay(700)
  await capture('01-inicio-escritorio.png')

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await delay(300)
  await capture('02-inicio-movil-390px.png')
  for (const [view, file, selector] of [
    ['avisos', '03-avisos-movil.png', '[data-testid="notices-view"]'],
    ['tramites', '04-tramites-movil.png', '[data-testid="procedure-view"]'],
    ['fonoteca', '05-fonoteca-movil.png', 'h1'],
    ['buzon', '06-buzon-ciudadano-movil.png', 'input[type="file"]'],
    ['admin', '07-acceso-administrativo-movil.png', '[data-testid="admin-view"] form'],
  ]) {
    await selectView(view)
    await waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)
    await capture(file)
  }
  console.log(`Capturas reales guardadas en ${output}`)
} finally {
  cdp?.close()
  browser.kill()
}
