import { Elysia } from 'elysia'
import { getCloudinaryUrl } from '../cloudinary'
import { sql } from '../db'

export const catalogRoutes = new Elysia({ prefix: '/api' })
  .get('/procedures', () => sql`
    SELECT p.*, a.url AS audio_url, a.language AS audio_language,
      a.voice_name AS audio_voice, a.is_demo AS audio_is_demo
    FROM procedures p
    LEFT JOIN procedure_audios a ON a.procedure_id = p.id
    ORDER BY p.priority DESC, p.title
  `)
  .get('/audios', () => sql`
    SELECT id, title, category, language, duration_seconds, description,
      storage_name, mime_type, file_size
    FROM media_audios ORDER BY created_at DESC
  `)
  .get('/published-submissions', () => sql`
    SELECT id, storage_name, media_type, public_title AS title, mime_type, created_at
    FROM citizen_submissions WHERE status = 'APROBADO'
    ORDER BY reviewed_at DESC
  `)
  .get('/media/:name', async ({ params, set }) => {
    const [audio] = await sql`SELECT storage_name, mime_type FROM media_audios WHERE storage_name = ${params.name}`
    const [submission] = audio ? [] : await sql`
      SELECT storage_name, mime_type FROM citizen_submissions
      WHERE storage_name = ${params.name} AND status = 'APROBADO'
    `
    const asset = audio ?? submission
    if (!asset) {
      set.status = 404
      return { message: 'Medio no encontrado.' }
    }
    return Response.redirect(getCloudinaryUrl(asset.storage_name, asset.mime_type), 302)
  })
