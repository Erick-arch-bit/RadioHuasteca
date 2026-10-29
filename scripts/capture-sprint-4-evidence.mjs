#!/usr/bin/env node
// Genera evidencias reales de HU-08 a HU-11 con los servicios locales activos.
import 'dotenv/config'
import { spawn, spawnSync } from 'node:child_process'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import pg from 'pg'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const evidence=path.join(root,'docs','evidence','sprint-4')
const chrome=process.env.CHROMIUM_BIN??'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const port=9464, app=process.env.APP_URL??'http://localhost:5173/'
const api=new URL(process.env.VITE_API_URL??'http://localhost:5173')
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL})
const tag=`evidencia-${Date.now()}`
const made={audioIds:[],submissionIds:[],files:[]}
const tempFiles=[]
let browser,cdp

class Cdp {
  constructor(socket){this.socket=socket;this.id=0;this.waiters=new Map();socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(!m.id)return;const w=this.waiters.get(m.id);this.waiters.delete(m.id);if(m.error)w.reject(Error(m.error.message));else w.resolve(m.result)})}
  send(method,params={}){const id=++this.id;return new Promise((resolve,reject)=>{this.waiters.set(id,{resolve,reject});this.socket.send(JSON.stringify({id,params,method}))})}
  async evaluate(expression){const r=await this.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??'Browser evaluation failed');return r.result.value}
}
const assert=(condition,message)=>{if(!condition)throw Error(message)}
async function waitFor(expression,timeout=15000){const end=Date.now()+timeout;while(Date.now()<end){if(await cdp.evaluate(expression))return;await delay(120)}throw Error(`Tiempo de espera agotado: ${expression}`)}
async function click(selector){await waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`);await cdp.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(350)}
async function fill(selector,value){await cdp.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});const s=Object.getOwnPropertyDescriptor(e.constructor.prototype,'value').set;s.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))})()`)}
async function screenshot(name){await cdp.evaluate("(()=>{const n=document.querySelector('[data-testid=bottom-nav]');if(n)n.style.visibility='hidden'})()");const {data}=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,fromSurface:true});await writeFile(path.join(evidence,name),Buffer.from(data,'base64'));await cdp.evaluate("(()=>{const n=document.querySelector('[data-testid=bottom-nav]');if(n)n.style.visibility=''})()")}
async function selectFile(selector,filePath){const {root:doc}=await cdp.send('DOM.getDocument');const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.nodeId,selector});assert(nodeId,`No se encontró ${selector}`);await cdp.send('DOM.setFileInputFiles',{nodeId,files:[filePath]});await cdp.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))})()`)}
async function uploadCitizen(filePath,mime){const file=await readFile(filePath);const form=new FormData();form.append('file',new Blob([file],{type:mime}),path.basename(filePath));form.append('contact',`${tag}@example.test`);const r=await fetch(new URL('/api/citizen-submissions',api),{method:'POST',body:form});const body=await r.json();assert(r.status===201,body.message??'Falló el envío de prueba');const {rows}=await pool.query('SELECT id,storage_name FROM citizen_submissions ORDER BY id DESC LIMIT 1');made.submissionIds.push(rows[0].id);made.files.push(rows[0].storage_name);return body}

try{
  assert(process.env.ADMIN_USERNAME&&process.env.ADMIN_PASSWORD,'Define ADMIN_USERNAME y ADMIN_PASSWORD en .env.')
  await mkdir(evidence,{recursive:true})
  const health=await fetch(new URL('/api/health',api));assert(health.ok,'Inicia npm run server.')
  const page=await fetch(app);assert(page.ok,'Inicia npm run dev antes de capturar.')
  const login=await fetch(new URL('/api/auth/login',api),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD})});assert(login.ok,'Las credenciales ADMIN_USERNAME/ADMIN_PASSWORD no permiten iniciar sesión.')

  // HU-08: cargar un audio de muestra real y usarlo en la Fonoteca.
  const audioPath=path.join(root,'public','audio','tramite-constancia-residencia.mp3')
  const audio=await readFile(audioPath),audioForm=new FormData()
  audioForm.append('file',new Blob([audio],{type:'audio/mpeg'}),'muestra-constancia.mp3')
  for(const [k,v] of Object.entries({title:`Muestra Sprint 4 ${tag}`,category:'Comunidad',language:'Español',duration:'38',description:'Audio de muestra capturado para evidencias de Sprint 4.'}))audioForm.append(k,v)
  const setCookie=login.headers.get('set-cookie');assert(setCookie,'El login de la cuenta no devolvió cookie de sesión.')
  const cookie=setCookie.split(';')[0]
  const audioResponse=await fetch(new URL('/api/audios',api),{method:'POST',headers:{Cookie:cookie},body:audioForm});const audioResult=await audioResponse.json();assert(audioResponse.status===201,audioResult.message??'Falló carga HU-08')
  const audioRow=await pool.query('SELECT id,storage_name FROM media_audios ORDER BY id DESC LIMIT 1');made.audioIds.push(audioRow.rows[0].id);made.files.push(audioRow.rows[0].storage_name);const publicAudio=await fetch(new URL('/api/audios',api)).then(r=>r.json());assert(publicAudio.find(x=>String(x.id)===String(made.audioIds[0]))?.storage_name===audioRow.rows[0].storage_name,'El catálogo no incluye el identificador multimedia del audio.')

  // Video corto local para revisar preview y flujo de aprobación sin publicar datos ciudadanos.
  const videoPath=path.join(os.tmpdir(),`radiohuasteca-${tag}.mp4`);tempFiles.push(videoPath)
  const video=spawnSync(process.env.FFMPEG_BIN??'ffmpeg',['-y','-f','lavfi','-i','color=c=teal:s=320x240:d=3','-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-shortest','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac',videoPath],{stdio:'ignore'});assert(video.status===0,'No se pudo generar el video local de prueba (ffmpeg).')
  await uploadCitizen(videoPath,'video/mp4')

  browser=spawn(chrome,['--headless=new',`--remote-debugging-port=${port}`,'--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--hide-scrollbars','--autoplay-policy=no-user-gesture-required',`--user-data-dir=${path.join(os.tmpdir(),`rh-s4-${randomUUID()}`)}`,'about:blank'],{stdio:'ignore',windowsHide:true})
  let target;const deadline=Date.now()+20000;while(!target&&Date.now()<deadline){try{target=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(x=>x.type==='page')}catch{await delay(200)}}
  assert(target?.webSocketDebuggerUrl,'Chrome no expuso CDP.');cdp=new Cdp(new WebSocket(target.webSocketDebuggerUrl));await new Promise(resolve=>cdp.socket.addEventListener('open',resolve,{once:true}));await cdp.send('Page.enable');await cdp.send('Runtime.enable');await cdp.send('DOM.enable');await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await cdp.send('Page.navigate',{url:app});await waitFor("Boolean(document.querySelector('[data-testid=\"app-shell\"]'))")

  await click('[data-testid="nav-fonoteca"]');await waitFor(`document.body.innerText.includes(${JSON.stringify(`Muestra Sprint 4 ${tag}`)})`);await click('select');await cdp.evaluate(`(()=>{const e=document.querySelector('select');e.value='Comunidad';e.dispatchEvent(new Event('change',{bubbles:true}))})()`);await click('article button');await waitFor('Boolean(document.querySelector("article audio"))');await delay(1000);const audioState=await cdp.evaluate("(()=>{const a=document.querySelector('article audio');return{src:a?.currentSrc,error:a?.error?.code,ready:a?.readyState,duration:a?.duration,timing:performance.getEntriesByType('resource').filter(x=>x.name.includes('/api/media/')).map(x=>({name:x.name,status:x.responseStatus}))}})()");assert(Number.isFinite(audioState.duration)&&audioState.duration>0,`Fonoteca no cargó los metadatos del audio: ${JSON.stringify(audioState)}`);await screenshot('01-fonoteca-audio-seleccionado.png');await cdp.evaluate("document.querySelector('article audio').play()");await waitFor("!document.querySelector('article audio').paused&&document.querySelector('article audio').currentTime>.5");await screenshot('08-fonoteca-audio-reproduciendo.png');await cdp.evaluate("document.querySelector('article audio').pause()")

  await click('[data-testid="nav-buzon"]');await waitFor("Boolean(document.querySelector('input[type=file]'))");await cdp.evaluate("(()=>{const original=window.fetch.bind(window);window._s4Fetch=[];window.fetch=async(...args)=>{try{const r=await original(...args);window._s4Fetch.push({url:String(args[0]),status:r.status,body:(await r.clone().text()).slice(0,300)});return r}catch(e){window._s4Fetch.push({url:String(args[0]),error:String(e)});throw e}}})()");await screenshot('02-buzon-ciudadano-movil.png')
  const badPath=path.join(os.tmpdir(),`radiohuasteca-invalid-${tag}.txt`);tempFiles.push(badPath);await writeFile(badPath,'archivo de texto, no es audio');await selectFile('input[type=file]',badPath);await click('form button');await waitFor("document.body.innerText.includes('formato de audio o video compatible')||document.body.innerText.includes('formato de audio o video no permitido')");await screenshot('03-buzon-archivo-invalido.png');await unlink(badPath)
  await fill('input[name="contact"]',`${tag}@example.test`);await selectFile('input[type=file]',audioPath);await click('form button');try{await waitFor("document.querySelector('[role=status]')?.innerText.includes('Contenido recibido')",30000)}catch{const state=await cdp.evaluate("({status:document.querySelector('[role=status]')?.innerText,files:document.querySelector('input[type=file]')?.files.length,contact:document.querySelector('input[name=contact]')?.value,fetch:window._s4Fetch})");throw Error(`El envío de evidencia no confirmó: ${JSON.stringify(state)}`)}await screenshot('04-buzon-confirmacion-envio.png')
  const sent=await pool.query('SELECT id,storage_name FROM citizen_submissions WHERE private_contact=$1 ORDER BY id DESC LIMIT 1',[`${tag}@example.test`]);assert(sent.rows[0],'El buzón confirmó el envío pero no se encontró el registro de prueba.');made.submissionIds.push(sent.rows[0].id);made.files.push(sent.rows[0].storage_name)

  // Abrir moderación con sesión administrativa: captura pendientes y reproductores.
  await click('[data-testid="nav-admin"]');await fill('[autocomplete="username"]',process.env.ADMIN_USERNAME);await fill('[autocomplete="current-password"]',process.env.ADMIN_PASSWORD);await click('[data-testid="admin-view"] form button');await waitFor("document.body.innerText.includes('Panel administrativo')");
  const panelTitle=`Carga desde panel ${tag}`;await selectFile('[data-testid="audio-upload-form"] input[type=file]',audioPath);for(const [name,value] of Object.entries({title:panelTitle,category:'Comunidad',language:'Español',duration:'38',description:'Audio real de muestra cargado desde el formulario del operador.'}))await fill(`[data-testid="audio-upload-form"] [name="${name}"]`,value);await click('[data-testid="audio-upload-form"] button');await waitFor("document.querySelector('[data-testid=audio-upload-form] [role=status]')?.innerText.includes('Audio cargado correctamente')");await screenshot('09-admin-carga-audio-confirmacion.png');const panelAudio=await pool.query('SELECT id,storage_name FROM media_audios WHERE title=$1',[panelTitle]);assert(panelAudio.rows[0],'No se guardó el audio enviado desde el panel.');made.audioIds.push(panelAudio.rows[0].id);made.files.push(panelAudio.rows[0].storage_name)
  await click('[data-testid="admin-view"] button:nth-of-type(2)');await waitFor("document.body.innerText.includes('PENDIENTE')&&Boolean(document.querySelector('video'))");await cdp.evaluate("(()=>{const v=document.querySelector('video');return v.play().then(()=>new Promise(resolve=>{const f=()=>v.currentTime>.5?(v.pause(),resolve()):requestAnimationFrame(f);f()}))})()");await screenshot('05-moderacion-pendientes-audio-video.png')
  const ids=made.submissionIds;assert(ids.length===2,'No se recuperaron los dos envíos de evidencia.')
  const videoId=ids[0],audioSubmissionId=ids[1]
  const approve=await fetch(new URL(`/api/admin/submissions/${videoId}`,api),{method:'PATCH',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({status:'APROBADO',title:`Video aprobado ${tag}`,note:'Aprobación de evidencia local.'})});assert(approve.ok,'No se pudo aprobar el video de evidencia.')
  const reject=await fetch(new URL(`/api/admin/submissions/${audioSubmissionId}`,api),{method:'PATCH',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({status:'RECHAZADO',note:'Rechazo de evidencia local.'})});assert(reject.ok,'No se pudo rechazar el audio de evidencia.')
  await click('[data-testid="admin-view"] button');await click('[data-testid="admin-view"] button:nth-of-type(2)');await waitFor("document.body.innerText.includes('APROBADO')&&document.body.innerText.includes('RECHAZADO')");await screenshot('06-moderacion-aprobado-rechazado.png')
  await click('[data-testid="nav-fonoteca"]');await waitFor(`document.body.innerText.includes(${JSON.stringify(`Video aprobado ${tag}`)})`);await cdp.evaluate("(()=>{const v=document.querySelector('video');return v.play().then(()=>new Promise(resolve=>{const f=()=>v.currentTime>.5?(v.pause(),resolve()):requestAnimationFrame(f);f()}))})()");await screenshot('07-fonoteca-contenido-ciudadano-aprobado.png')
  console.log('Capturas creadas: 01–09 · carga operadora, Fonoteca, reproducción, buzón móvil, archivo inválido, confirmación, moderación pendiente y decisiones, publicación aprobada.')
}finally{
  cdp?.socket.close();browser?.kill()
  try{const leftovers=await pool.query('SELECT id,storage_name FROM citizen_submissions WHERE private_contact=$1',[`${tag}@example.test`]);for(const row of leftovers.rows){if(!made.submissionIds.includes(row.id))made.submissionIds.push(row.id);if(!made.files.includes(row.storage_name))made.files.push(row.storage_name)}const audios=await pool.query('SELECT id,storage_name FROM media_audios WHERE title=$1 OR title=$2',[`Muestra Sprint 4 ${tag}`,`Carga desde panel ${tag}`]);for(const row of audios.rows){if(!made.audioIds.includes(row.id))made.audioIds.push(row.id);if(!made.files.includes(row.storage_name))made.files.push(row.storage_name)}if(made.submissionIds.length)await pool.query('DELETE FROM citizen_submissions WHERE id=ANY($1::bigint[])',[made.submissionIds]);if(made.audioIds.length)await pool.query('DELETE FROM media_audios WHERE id=ANY($1::bigint[])',[made.audioIds])}catch(error){console.error('No se pudieron limpiar filas de evidencia:',error.message)}
  for(const name of made.files)try{await unlink(path.join(root,'private-media',name))}catch{}
  for(const file of tempFiles)try{await unlink(file)}catch{}
  await pool.end()
}
