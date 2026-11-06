import { Elysia, t } from 'elysia'
import { uploadToCloudinary, type CloudinaryResourceType } from '../cloudinary'

const mediaFile = t.File({
  maxSize: '50m',
  type: ['image/*', 'audio/*', 'video/*'],
})

export const mediaRoutes = new Elysia({ prefix: '/api/media' }).post(
  '/upload',
  async ({ body, set }) => {
    const file = body.file
    if (!(file instanceof File) || file.size === 0) {
      set.status = 400
      return { message: 'Selecciona un archivo de imagen, audio o video.' }
    }

    const resourceType: CloudinaryResourceType = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('audio/') || file.type.startsWith('video/')
        ? 'video'
        : 'auto'

    try {
      return await uploadToCloudinary(await file.arrayBuffer(), resourceType)
    } catch (error) {
      set.status = 502
      return { message: `No se pudo subir el archivo a Cloudinary: ${String(error)}` }
    }
  },
  { body: t.Object({ file: mediaFile }) },
)
