import { Elysia } from 'elysia'
import { getCloudinaryUrl } from '../cloudinary'
import { sql } from '../db'

export const catalogRoutes = new Elysia({ prefix: '/api' })
  .get('/procedures', async () => (await sql`
    SELECT id, name, description, requirements, steps, audio_url, audio_public_id, language, is_priority
    FROM procedures ORDER BY is_priority DESC, name
  `).map((procedure) => ({
    ...procedure,
    title: procedure.name,
    summary: procedure.description,
    priority: procedure.is_priority,
    requirements: procedure.requirements ? procedure.requirements.split('\n').filter(Boolean) : [],
    steps: procedure.steps ? procedure.steps.split('\n').filter(Boolean) : [],
    responsible: '',
    audio_url: procedure.audio_url,
  })))
  .get('/audios', () => sql`
    SELECT id, title, description, duration_seconds, id::text AS storage_name,
      audio_url, category, language, 0 AS file_size
    FROM capsules ORDER BY created_at DESC
  `)
  .get('/bulletins/latest', async () => (await sql`SELECT id, title, publish_date, audio_url, duration_seconds
    FROM bulletins WHERE is_active = true ORDER BY publish_date DESC LIMIT 1`)[0] ?? null)
  .get('/published-submissions', () => sql`SELECT id, title, media_type, file_size,
    id::text AS storage_name, category, language, description, created_at
    FROM citizen_submissions WHERE status = 'APROBADO' ORDER BY reviewed_at DESC`)
  .get('/media/:id', async ({ params, set }) => {
    const [capsule] = await sql`SELECT audio_url FROM capsules WHERE id = ${params.id}`
    if (capsule) return Response.redirect(capsule.audio_url, 302)
    const [submission] = await sql`SELECT public_id, mime_type FROM citizen_submissions
      WHERE id = ${params.id} AND status = 'APROBADO'`
    if (!submission) { set.status = 404; return { message: 'Medio no encontrado.' } }
    return Response.redirect(getCloudinaryUrl(submission.public_id, submission.mime_type), 302)
  })
