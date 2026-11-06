import { Elysia, t } from 'elysia'
import { destroyCloudinaryAsset, uploadToCloudinary } from '../cloudinary'
import { sql } from '../db'

export const citizenRoutes = new Elysia({ prefix: '/api' }).post('/citizen-submissions', async ({ body, set }) => {
  const mediaType = body.file.type.startsWith('audio/')
    ? 'audio'
    : body.file.type.startsWith('video/')
      ? 'video'
      : body.file.type.startsWith('image/')
        ? 'image'
        : null
  if (!mediaType) {
    set.status = 400
    return { message: 'Formato de foto, audio o video no permitido.' }
  }

  const resourceType = mediaType === 'image' ? 'image' : 'video'
  const asset = await uploadToCloudinary(await body.file.arrayBuffer(), resourceType, 'authenticated')
  try {
    await sql.begin(async (transaction) => {
      const [submission] = await transaction`
        INSERT INTO citizen_submissions (media_type, storage_name, mime_type, file_size, private_contact, status)
        VALUES (${mediaType}, ${asset.publicId}, ${body.file.type}, ${body.file.size}, ${body.contact?.trim().slice(0, 160) || null}, 'PENDIENTE')
        RETURNING id
      `
      await transaction`
        INSERT INTO moderation_history (submission_id, new_status, note, changed_by)
        VALUES (${submission.id}, 'PENDIENTE', 'Recepción inicial', NULL)
      `
    })
    set.status = 201
    return { message: 'Contenido recibido. Quedó pendiente de revisión.' }
  } catch (error) {
    await destroyCloudinaryAsset(asset.publicId, resourceType, 'authenticated')
    throw error
  }
}, {
  body: t.Object({
    file: t.File({ maxSize: '50m', type: ['image/*', 'audio/*', 'video/*'] }),
    contact: t.Optional(t.String({ maxLength: 160 })),
  }),
})
