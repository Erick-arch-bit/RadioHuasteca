import { Elysia } from 'elysia'
import { sql } from '../db'

export const catalogRoutes = new Elysia({ prefix: '/api' })
  .get('/procedures', async () => (await sql`
    SELECT id, name, description, requirements, audio_url, is_priority
    FROM procedures ORDER BY is_priority DESC, name
  `).map((procedure) => ({
    ...procedure,
    title: procedure.name,
    summary: procedure.description,
    priority: procedure.is_priority,
    requirements: procedure.requirements ? [procedure.requirements] : [],
    steps: [],
    responsible: '',
    audio_url: procedure.audio_url,
  })))
  .get('/audios', () => sql`
    SELECT id, title, description, duration_seconds, id::text AS storage_name,
      audio_url, 'Comunidad' AS category, 'Español' AS language, 0 AS file_size
    FROM capsules ORDER BY created_at DESC
  `)
  .get('/published-submissions', () => [])
  .get('/media/:id', async ({ params, set }) => {
    const [capsule] = await sql`SELECT audio_url FROM capsules WHERE id = ${params.id}`
    if (!capsule) { set.status = 404; return { message: 'Medio no encontrado.' } }
    return Response.redirect(capsule.audio_url, 302)
  })
