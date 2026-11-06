import { Elysia, t } from 'elysia'
import { getAdmin } from '../auth'
import { destroyCloudinaryAsset, getCloudinaryUrl, renameCloudinaryAsset, uploadToCloudinary } from '../cloudinary'
import { sql } from '../db'

const uploadFile = t.File({ maxSize: '50m', type: ['image/jpeg', 'image/png', 'image/webp', 'audio/*', 'video/*'] })
const reviewBody = t.Object({
  status: t.Union([t.Literal('APROBADO'), t.Literal('RECHAZADO')]),
  title: t.Optional(t.String({ maxLength: 150 })),
  category: t.Optional(t.String({ maxLength: 100 })),
  language: t.Optional(t.String({ maxLength: 100 })),
  description: t.Optional(t.String({ maxLength: 5000 })),
  note: t.Optional(t.String({ maxLength: 2000 })),
})

async function adminOr401(headers: Record<string, string | undefined>, set: { status?: number | string }) {
  const admin = await getAdmin(headers)
  if (!admin) set.status = 401
  return admin
}

export const submissionRoutes = new Elysia({ prefix: '/api' })
  .post('/citizen-submissions', async ({ body, set }) => {
    const file = body.file
    if (!file || file.size === 0) { set.status = 400; return { message: 'Selecciona un archivo válido.' } }
    const mediaType = file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('image/') ? 'image' : 'video'
    try {
      const asset = await uploadToCloudinary(await file.arrayBuffer(), mediaType === 'image' ? 'image' : 'video', 'authenticated')
      try {
        const [submission] = await sql`
          INSERT INTO citizen_submissions (media_type, mime_type, public_id, file_size, contact)
          VALUES (${mediaType}, ${file.type}, ${asset.publicId}, ${file.size}, ${body.contact?.trim() || null})
          RETURNING id
        `
        await sql`INSERT INTO submission_review_history (submission_id, status, note)
          VALUES (${submission.id}, 'PENDIENTE', 'Envío recibido')`
        set.status = 201
        return { id: submission.id, message: 'Tu archivo se envió para revisión. Se publicará si el administrador lo aprueba.' }
      } catch (error) {
        await destroyCloudinaryAsset(asset.publicId, asset.resourceType, 'authenticated').catch(() => {})
        throw error
      }
    } catch {
      set.status = 502
      return { message: 'No se pudo guardar el envío. Inténtalo de nuevo más tarde.' }
    }
  }, { body: t.Object({ file: uploadFile, contact: t.Optional(t.String({ maxLength: 160 })) }) })
  .get('/admin/submissions', async ({ headers, set }) => {
    if (!await adminOr401(headers, set)) return { message: 'Inicia sesión para continuar.' }
    return sql`SELECT id, media_type, mime_type, file_size, contact, status, title, created_at,
      reviewed_at, review_note FROM citizen_submissions ORDER BY created_at DESC`
  })
  .get('/admin/submissions/:id/media', async ({ params, headers, set }) => {
    if (!await adminOr401(headers, set)) return { message: 'Inicia sesión para continuar.' }
    const [submission] = await sql`SELECT public_id, mime_type FROM citizen_submissions WHERE id = ${params.id}`
    if (!submission) { set.status = 404; return { message: 'Envío no encontrado.' } }
    return Response.redirect(getCloudinaryUrl(submission.public_id, submission.mime_type, { authenticated: true }), 302)
  })
  .get('/admin/submissions/:id/history', async ({ params, headers, set }) => {
    if (!await adminOr401(headers, set)) return { message: 'Inicia sesión para continuar.' }
    return sql`SELECT h.id, h.status, h.note, h.created_at, a.username AS admin
      FROM submission_review_history h LEFT JOIN admins a ON a.id = h.admin_id
      WHERE h.submission_id = ${params.id} ORDER BY h.created_at DESC`
  })
  .patch('/admin/submissions/:id', async ({ params, body, headers, set }) => {
    const admin = await adminOr401(headers, set)
    if (!admin) return { message: 'Inicia sesión para continuar.' }
    const [submission] = await sql`SELECT * FROM citizen_submissions WHERE id = ${params.id}`
    if (!submission) { set.status = 404; return { message: 'Envío no encontrado.' } }
    if (submission.status !== 'PENDIENTE') { set.status = 409; return { message: 'Este envío ya fue revisado.' } }
    if (body.status === 'APROBADO' && !body.title?.trim()) {
      set.status = 400
      return { message: 'Escribe un título para publicar el contenido.' }
    }

    let publicUrl: string | null = null
    let capsuleId: string | null = null
    if (body.status === 'APROBADO') {
      const resourceType = submission.media_type === 'image' ? 'image' : 'video'
      try {
        await renameCloudinaryAsset(submission.public_id, resourceType, 'authenticated', 'upload')
        publicUrl = getCloudinaryUrl(submission.public_id, submission.mime_type)
      } catch {
        set.status = 502
        return { message: 'No se pudo publicar el archivo multimedia.' }
      }
    }

    await sql.begin(async (transaction) => {
      if (body.status === 'APROBADO' && submission.media_type === 'audio') {
        const [capsule] = await transaction`INSERT INTO capsules (title, description, audio_url, audio_public_id,
          category, language, duration_seconds)
          VALUES (${body.title!.trim()}, ${body.description?.trim() || null}, ${publicUrl}, ${submission.public_id},
            ${body.category?.trim() || 'Comunidad'}, ${body.language?.trim() || 'Español'}, NULL)
          RETURNING id`
        capsuleId = capsule.id
      }
      await transaction`UPDATE citizen_submissions SET status = ${body.status}, title = ${body.title?.trim() || null},
        category = ${body.category?.trim() || 'Comunidad'}, language = ${body.language?.trim() || 'Español'},
        description = ${body.description?.trim() || null}, capsule_id = ${capsuleId}, reviewed_at = NOW(),
        reviewed_by = ${admin.id}, review_note = ${body.note?.trim() || null} WHERE id = ${params.id}`
      await transaction`INSERT INTO submission_review_history (submission_id, admin_id, status, note)
        VALUES (${params.id}, ${admin.id}, ${body.status}, ${body.note?.trim() || null})`
    })
    return { message: body.status === 'APROBADO' ? 'Contenido aprobado y publicado.' : 'Contenido rechazado.', publicUrl }
  }, { body: reviewBody })
