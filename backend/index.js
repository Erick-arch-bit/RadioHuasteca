import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pg from 'pg'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import { v2 as cloudinary } from 'cloudinary'

const app = express()
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const secret = process.env.SESSION_SECRET
if (!process.env.DATABASE_URL || !secret || secret.length < 32) throw new Error('Define DATABASE_URL y SESSION_SECRET (mínimo 32 caracteres) en el entorno.')
const cloudinaryReady = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
if (cloudinaryReady) cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true })
const frontendOrigin = process.env.FRONTEND_ORIGIN ? new URL(process.env.FRONTEND_ORIGIN).origin : null
if (frontendOrigin) app.use(cors({ origin: frontendOrigin, credentials: true }))
app.use(express.json({ limit: '32kb' }))
const mediaDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../private-media')
await mkdir(mediaDir, { recursive: true })
const allowedMime = new Set(['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/opus', 'audio/wav', 'audio/webm', 'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'image/jpeg', 'image/png', 'image/webp'])
function matchesMediaSignature(mime, data) { const ascii=(start,end)=>data.subarray(start,end).toString('ascii'); if(mime==='image/jpeg')return data[0]===0xff&&data[1]===0xd8&&data[2]===0xff;if(mime==='image/png')return data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));if(mime==='image/webp')return ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP';if(mime==='audio/mpeg')return ascii(0,3)==='ID3'||(data[0]===0xff&&(data[1]&0xe0)===0xe0);if(mime==='audio/wav')return ascii(0,4)==='RIFF'&&ascii(8,12)==='WAVE';if(mime==='audio/ogg'||mime==='audio/opus'||mime==='video/ogg')return ascii(0,4)==='OggS';if(mime==='audio/webm'||mime==='video/webm')return data.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]));if(mime==='audio/mp4'||mime==='video/mp4'||mime==='video/quicktime')return ascii(4,8)==='ftyp';return false }

function uploadToCloudinary(file, { authenticated = false } = {}) {
  if (!cloudinaryReady) throw new Error('Cloudinary no está configurado. Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.')
  const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'video'
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({ resource_type: resourceType, type: authenticated ? 'authenticated' : 'upload', folder: 'radiohuasteca', public_id: randomUUID(), overwrite: false }, (error, result) => error ? reject(error) : resolve(result))
    Readable.from(file.buffer).pipe(upload)
  })
}

function getCloudinaryUrl(publicId, mime, { authenticated = false, imageWidth = 1280 } = {}) {
  if (!cloudinaryReady) throw new Error('Cloudinary no está configurado.')
  const resourceType = mime.startsWith('image/') ? 'image' : 'video'
  const formatByMime = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'audio/mpeg': 'mp3', 'audio/mp4': 'mp4', 'audio/ogg': 'ogg', 'audio/opus': 'ogg', 'audio/wav': 'wav', 'audio/webm': 'webm', 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov', 'video/ogg': 'ogg' }
  const format = formatByMime[mime]
  if (authenticated) return cloudinary.utils.private_download_url(publicId, format, { resource_type: resourceType, type: 'authenticated', expires_at: Math.floor(Date.now() / 1000) + 300, attachment: false })
  const transform = resourceType === 'image' ? `/f_auto,q_auto,w_${imageWidth},c_limit` : ''
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload${transform}/${publicId}.${format}`
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url')
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`
}
function getSession(req) {
  const token = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('rh_admin='))?.slice(9)
  if (!token) return null
  const [body, signature] = token.split('.')
  if (!body || !signature) return null
  const expected = createHmac('sha256', secret).update(body).digest()
  const actual = Buffer.from(signature, 'base64url')
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
  try { const data = JSON.parse(Buffer.from(body, 'base64url').toString()); return data.exp > Date.now() ? data : null } catch { return null }
}
function requireAdmin(req, res, next) { if(frontendOrigin&&req.headers.origin&&req.headers.origin!==frontendOrigin)return res.status(403).json({message:'Origen no autorizado.'});req.admin = getSession(req); if (!req.admin) return res.status(401).json({ message: 'Inicia sesión para continuar.' }); next() }
function requireModerator(req, res, next) { requireAdmin(req, res, async (error) => { if (error) return next(error); try { const { rows } = await pool.query('SELECT role FROM admin_users WHERE id = $1', [req.admin.id]); if (!rows[0] || !['operator', 'moderator'].includes(rows[0].role)) return res.status(403).json({ message: 'No tienes permiso para moderar.' }); next() } catch (e) { next(e) } }) }

async function receiveUpload(req, res, next) {
  try {
    const boundary = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(req.headers['content-type'] || '')
    if (!boundary) return res.status(400).json({ message: 'Solicitud multipart inválida.' })
    const marker = Buffer.from(`--${boundary[1] || boundary[2].trim()}`); const chunks=[]; let total=0
    for await (const chunk of req) { total+=chunk.length; if(total>50*1024*1024+128*1024) return res.status(413).json({message:'El archivo supera el límite de 50 MB.'}); chunks.push(chunk) }
    const body=Buffer.concat(chunks); let cursor=0
    while((cursor=body.indexOf(marker,cursor))>=0){cursor+=marker.length;if(body.subarray(cursor,cursor+2).equals(Buffer.from('--')))break;if(body.subarray(cursor,cursor+2).equals(Buffer.from('\r\n')))cursor+=2;const headEnd=body.indexOf(Buffer.from('\r\n\r\n'),cursor);if(headEnd<0)break;const headers=body.subarray(cursor,headEnd).toString('utf8');const start=headEnd+4;let end=body.indexOf(marker,start);if(end<0)break;if(body.subarray(end-2,end).toString()==='\r\n')end-=2;cursor=end
      const disposition=/name="([^"]+)"(?:;\s*filename="([^"]*)")?/i.exec(headers);if(!disposition)continue;const value=body.subarray(start,end)
      if(disposition[1]==='file'&&disposition[2]){const mime=/content-type:\s*([^\r\n]+)/i.exec(headers)?.[1]?.trim().toLowerCase();if(!mime||!allowedMime.has(mime)||!matchesMediaSignature(mime,value))return res.status(400).json({message:'Archivo inválido: contenido o formato no permitido.'});if(value.length===0)return res.status(400).json({message:'El archivo está vacío.'});if(value.length>50*1024*1024)return res.status(413).json({message:'El archivo supera el límite de 50 MB.'});req.file={buffer:value,mimetype:mime,size:value.length};req.body??={};req.body._fields={...(req.body._fields||{})}}
      else if(!disposition[2]){req.body??={};req.body._fields??={};req.body._fields[disposition[1]]=value.toString('utf8').slice(0,2000)}
    }
    if(!req.file)return res.status(400).json({message:'Selecciona un archivo de audio o video compatible.'});req.body={...req.body?._fields};next()
  }catch(error){next(error)}
}
function servePrivate(req, res, next) { const name = req.params.name; if (!/^[a-f0-9-]+$/i.test(name)) return res.sendStatus(404); const filePath = path.join(mediaDir, name); if (!existsSync(filePath)) return res.sendStatus(404); res.type(req.mediaMime || 'application/octet-stream'); res.sendFile(filePath, (error) => { if(error&&!res.headersSent)next(error) }) }

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.get('/api/procedures', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT p.*, a.url AS audio_url, a.language AS audio_language, a.voice_name AS audio_voice, a.is_demo AS audio_is_demo FROM procedures p LEFT JOIN procedure_audios a ON a.procedure_id = p.id ORDER BY p.priority DESC, p.title`)
    res.json(rows)
  } catch (error) { next(error) }
})
const noticeSelect = `SELECT n.id,n.audio_id,n.title,n.description,n.priority,n.type,to_char(n.notice_date,'YYYY-MM-DD') AS date,n.status,a.storage_name AS audio_name,a.mime_type AS audio_mime FROM community_notices n LEFT JOIN media_audios a ON a.id=n.audio_id`
function presentNotice(row) { return { ...row, id: `community-${row.id}`, audio: row.audio_name ? [{ src: `/api/media/${row.audio_name}`, type: row.audio_mime }] : undefined } }
app.get('/api/notices', async (_req,res,next)=>{try{const {rows}=await pool.query(`${noticeSelect} ORDER BY n.notice_date DESC,n.created_at DESC`);res.json(rows.map(presentNotice))}catch(e){next(e)}})
app.get('/api/admin/notices', requireAdmin, async (_req,res,next)=>{try{const {rows}=await pool.query(`${noticeSelect} ORDER BY n.notice_date DESC,n.created_at DESC`);res.json(rows.map(presentNotice))}catch(e){next(e)}})
function validateNotice(body={}) { const {title,description,priority,type,date,status,audioId}=body; return [typeof title==='string'&&title.trim().length>0&&title.trim().length<=90,typeof description==='string'&&description.trim().length>0&&description.trim().length<=2000,['urgent','high','normal'].includes(priority),['weather','water','health','community'].includes(type),/^\d{4}-\d{2}-\d{2}$/.test(date||'')&&!Number.isNaN(Date.parse(`${date}T12:00:00Z`)),['active','scheduled','resolved'].includes(status),audioId===null||audioId===''||/^\d+$/.test(String(audioId))].every(Boolean) }
app.post('/api/admin/notices', requireAdmin, async (req,res,next)=>{const n=req.body||{};if(!validateNotice(n))return res.status(400).json({message:'Revisa título, descripción, prioridad, tipo, fecha y estado.'});try{const {rows}=await pool.query('INSERT INTO community_notices(title,description,priority,type,notice_date,status,audio_id,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',[n.title.trim(),n.description.trim(),n.priority,n.type,n.date,n.status,n.audioId||null,req.admin.id]);res.status(201).json({id:rows[0].id,message:'Aviso guardado.'})}catch(e){next(e)}})
app.patch('/api/admin/notices/:id', requireAdmin, async (req,res,next)=>{const n=req.body||{};if(!validateNotice(n))return res.status(400).json({message:'Revisa título, descripción, prioridad, tipo, fecha y estado.'});try{const {rowCount}=await pool.query('UPDATE community_notices SET title=$1,description=$2,priority=$3,type=$4,notice_date=$5,status=$6,audio_id=$7,updated_at=now() WHERE id=$8',[n.title.trim(),n.description.trim(),n.priority,n.type,n.date,n.status,n.audioId||null,req.params.id]);if(!rowCount)return res.sendStatus(404);res.json({message:'Aviso actualizado.'})}catch(e){next(e)}})
app.post('/api/auth/login', async (req, res, next) => {
  const { username, password } = req.body ?? {}
  if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) return res.status(400).json({ message: 'Completa usuario/correo y contraseña.' })
  try {
    const { rows } = await pool.query(`SELECT id, username, display_name, role FROM admin_users WHERE (lower(username) = lower($1) OR lower(email) = lower($1)) AND password_hash = crypt($2, password_hash)`, [username.trim(), password])
    if (!rows[0]) return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' })
    const admin = rows[0]
    res.setHeader('Set-Cookie', `rh_admin=${sign({ id: admin.id, username: admin.username, displayName: admin.display_name })}; HttpOnly; SameSite=${frontendOrigin ? 'None' : 'Strict'}; Path=/; Max-Age=28800${process.env.NODE_ENV === 'production' || frontendOrigin ? '; Secure' : ''}`)
    res.json({ user: { id: admin.id, displayName: admin.display_name, role: admin.role } })
  } catch (error) { next(error) }
})
app.get('/api/auth/me', requireAdmin, async (req, res, next) => { try { const { rows } = await pool.query('SELECT role FROM admin_users WHERE id=$1', [req.admin.id]); res.json({ user: { id: req.admin.id, displayName: req.admin.displayName, role: rows[0]?.role } }) } catch (e) { next(e) } })
app.post('/api/auth/logout', (_req, res) => { res.setHeader('Set-Cookie', 'rh_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'); res.json({ ok: true }) })
app.get('/api/admin/summary', requireAdmin, async (_req, res, next) => {
  try { const { rows } = await pool.query('SELECT count(*)::int AS procedures, count(*) FILTER (WHERE priority)::int AS priority_procedures FROM procedures'); res.json(rows[0]) } catch (error) { next(error) }
})
app.get('/api/audios', async (_req, res, next) => { try { const { rows } = await pool.query('SELECT id,title,category,language,duration_seconds,description,storage_name,mime_type,file_size FROM media_audios ORDER BY created_at DESC'); res.json(rows) } catch (e) { next(e) } })
app.get('/api/published-submissions', async (_req,res,next)=>{try{const {rows}=await pool.query("SELECT id,storage_name,media_type,public_title AS title,mime_type,created_at FROM citizen_submissions WHERE status='APROBADO' ORDER BY reviewed_at DESC");res.json(rows)}catch(e){next(e)}})
app.get('/api/media/:name', async (req, res, next) => { try { let q = await pool.query('SELECT storage_name,mime_type FROM media_audios WHERE storage_name=$1', [req.params.name]); let authenticated = false; if (!q.rows[0]) q = await pool.query("SELECT storage_name,mime_type FROM citizen_submissions WHERE storage_name=$1 AND status='APROBADO'", [req.params.name]); if (!q.rows[0]) return res.sendStatus(404); if (existsSync(path.join(mediaDir, q.rows[0].storage_name))) return servePrivate({ ...req, params: { ...req.params, name: q.rows[0].storage_name }, mediaMime: q.rows[0].mime_type }, res, next); return res.redirect(302, getCloudinaryUrl(q.rows[0].storage_name, q.rows[0].mime_type, { authenticated })) } catch (e) { next(e) } })
app.post('/api/audios', requireAdmin, receiveUpload, async (req, res, next) => {
  const { title, category, language, duration, description = '' } = req.body
  if (![title, category, language].every((v) => typeof v === 'string' && v.trim()) || !/^\d+(\.\d+)?$/.test(duration || '')) return res.status(400).json({ message: 'Completa título, categoría, idioma y duración válida.' })
  if (!req.file.mimetype.startsWith('audio/')) return res.status(400).json({ message: 'Fonoteca solo acepta archivos de audio.' })
  let asset
  try {
    asset = await uploadToCloudinary(req.file)
    const { rows } = await pool.query('INSERT INTO media_audios(title,category,language,duration_seconds,description,storage_name,mime_type,file_size,uploaded_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id', [title.trim().slice(0,160),category.trim().slice(0,80),language.trim().slice(0,40),Math.round(Number(duration)),String(description).slice(0,2000),asset.public_id,req.file.mimetype,req.file.size,req.admin.id])
    res.status(201).json({ id: rows[0].id, message: 'Audio cargado correctamente.' })
  } catch(e) {
    if(asset) await cloudinary.uploader.destroy(asset.public_id,{resource_type:'video',type:'upload',invalidate:true}).catch(()=>{})
    next(e)
  }
})
app.post('/api/citizen-submissions', receiveUpload, async (req, res, next) => {
  const mime = req.file.mimetype
  const type = mime.startsWith('audio/') ? 'audio' : mime.startsWith('video/') ? 'video' : mime.startsWith('image/') ? 'image' : null
  if (!type) return res.status(400).json({ message: 'Formato de foto, audio o video no permitido.' })
  let asset
  const resourceType = type === 'image' ? 'image' : 'video'
  const client = await pool.connect()
  try {
    asset = await uploadToCloudinary(req.file, { authenticated: true })
    await client.query('BEGIN')
    const { rows } = await client.query("INSERT INTO citizen_submissions(media_type,storage_name,mime_type,file_size,private_contact,status) VALUES($1,$2,$3,$4,$5,'PENDIENTE') RETURNING id", [type,asset.public_id,mime,req.file.size,typeof req.body.contact==='string'?req.body.contact.trim().slice(0,160)||null:null])
    await client.query("INSERT INTO moderation_history(submission_id,new_status,note,changed_by) VALUES($1,'PENDIENTE','Recepción inicial',NULL)", [rows[0].id])
    await client.query('COMMIT')
    res.status(201).json({ message: 'Contenido recibido. Quedó pendiente de revisión.' })
  } catch(e) {
    await client.query('ROLLBACK').catch(()=>{})
    if(asset) await cloudinary.uploader.destroy(asset.public_id,{resource_type:resourceType,type:'authenticated',invalidate:true}).catch(()=>{})
    next(e)
  } finally { client.release() }
})
app.get('/api/admin/submissions', requireModerator, async (_req,res,next) => { try { const { rows }=await pool.query('SELECT id,media_type,mime_type,file_size,status,public_title,created_at,reviewed_at FROM citizen_submissions ORDER BY created_at DESC'); res.json(rows) } catch(e){next(e)} })
app.get('/api/admin/submissions/:id/media', requireModerator, async (req,res,next)=>{ try { const {rows}=await pool.query('SELECT storage_name,mime_type FROM citizen_submissions WHERE id=$1',[req.params.id]); if(!rows[0]) return res.sendStatus(404); if(existsSync(path.join(mediaDir,rows[0].storage_name))){req.mediaMime=rows[0].mime_type;req.params.name=rows[0].storage_name;return servePrivate(req,res,next)}res.redirect(302,getCloudinaryUrl(rows[0].storage_name,rows[0].mime_type,{authenticated:true})) }catch(e){next(e)} })
app.patch('/api/admin/submissions/:id', requireModerator, async (req,res,next)=>{
  const {status,title='',note=''}=req.body||{}
  if(!['APROBADO','RECHAZADO'].includes(status)) return res.status(400).json({message:'Estado inválido.'})
  const client=await pool.connect(); let promoted=null
  try {
    await client.query('BEGIN')
    const old=await client.query('SELECT status,storage_name,mime_type FROM citizen_submissions WHERE id=$1 FOR UPDATE',[req.params.id])
    if(!old.rows[0]) {await client.query('ROLLBACK');return res.sendStatus(404)}
    const asset=old.rows[0]
    if(status==='APROBADO'&&asset.status!=='APROBADO'&&!existsSync(path.join(mediaDir,asset.storage_name))) {
      const resourceType=asset.mime_type.startsWith('image/')?'image':'video'
      await cloudinary.uploader.rename(asset.storage_name,asset.storage_name,{resource_type:resourceType,type:'authenticated',to_type:'upload',overwrite:true,invalidate:true})
      promoted={publicId:asset.storage_name,resourceType}
    }
    await client.query('UPDATE citizen_submissions SET status=$1, public_title=$2, reviewed_at=now(), reviewed_by=$3 WHERE id=$4',[status,status==='APROBADO'?String(title).trim().slice(0,160)||'Contenido ciudadano':null,req.admin.id,req.params.id])
    await client.query('INSERT INTO moderation_history(submission_id,previous_status,new_status,changed_by,note) VALUES($1,$2,$3,$4,$5)',[req.params.id,asset.status,status,req.admin.id,String(note).slice(0,500)])
    await client.query('COMMIT')
    res.json({message:'Estado actualizado.'})
  }catch(e){
    await client.query('ROLLBACK').catch(()=>{})
    if(promoted) await cloudinary.uploader.rename(promoted.publicId,promoted.publicId,{resource_type:promoted.resourceType,type:'upload',to_type:'authenticated',overwrite:true,invalidate:true}).catch((rollbackError)=>console.error('No se pudo volver a restringir un medio después de un error de moderación.',rollbackError))
    next(e)
  }finally{client.release()}
})
app.get('/api/admin/submissions/:id/history',requireModerator,async(req,res,next)=>{try{const {rows}=await pool.query("SELECT h.previous_status,h.new_status,h.note,h.changed_at,COALESCE(u.display_name,'Sistema') AS changed_by FROM moderation_history h LEFT JOIN admin_users u ON u.id=h.changed_by WHERE h.submission_id=$1 ORDER BY h.changed_at,h.id",[req.params.id]);res.json(rows)}catch(e){next(e)}})
app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ message: 'Ocurrió un error del servidor.' }) })
app.listen(Number(process.env.PORT || 3001), () => console.log(`RadioHuasteca API listening on ${process.env.PORT || 3001}`))
