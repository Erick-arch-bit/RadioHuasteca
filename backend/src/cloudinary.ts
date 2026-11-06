import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import { Readable } from 'node:stream'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.')
}

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })

export type CloudinaryResourceType = 'image' | 'video' | 'auto'

export async function uploadToCloudinary(
  fileBuffer: ArrayBuffer,
  resourceType: CloudinaryResourceType,
  type: 'upload' | 'authenticated' = 'upload',
) {
  const uploadType = resourceType === 'auto' ? 'auto' : resourceType
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'radiohuasteca', resource_type: uploadType, type, overwrite: false },
      (error, uploaded) => {
        if (error) reject(error)
        else if (uploaded) resolve(uploaded)
        else reject(new Error('Cloudinary no devolvió información del archivo.'))
      },
    )
    Readable.from(new Uint8Array(fileBuffer)).pipe(stream)
  })

  const actualResourceType = result.resource_type === 'image' ? 'image' : 'video'
  const url = cloudinary.url(result.public_id, {
    secure: true,
    resource_type: actualResourceType,
    type: 'upload',
    transformation:
      actualResourceType === 'image'
        ? [{ fetch_format: 'auto', quality: 'auto', crop: 'limit', width: 400 }]
        : undefined,
  })

  return { url, publicId: result.public_id, resourceType: actualResourceType }
}

export function getCloudinaryUrl(
  publicId: string,
  mimeType: string,
  options: { authenticated?: boolean; imageWidth?: number } = {},
) {
  const resourceType = mimeType.startsWith('image/') ? 'image' : 'video'
  const formatByMime: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
    'audio/mpeg': 'mp3', 'audio/mp4': 'mp4', 'audio/ogg': 'ogg',
    'audio/opus': 'ogg', 'audio/wav': 'wav', 'audio/webm': 'webm',
    'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
    'video/ogg': 'ogg',
  }
  const format = formatByMime[mimeType]
  if (!format) throw new Error(`Formato multimedia no soportado: ${mimeType}`)
  if (options.authenticated) {
    return cloudinary.utils.private_download_url(publicId, format, {
      resource_type: resourceType,
      type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + 300,
      attachment: false,
    })
  }
  const transform = resourceType === 'image'
    ? `f_auto,q_auto,c_limit,w_${options.imageWidth ?? 400}`
    : undefined
  return cloudinary.url(publicId, {
    secure: true,
    resource_type: resourceType,
    type: 'upload',
    format,
    transformation: transform ? [{ raw_transformation: transform }] : undefined,
  })
}

export async function renameCloudinaryAsset(
  publicId: string,
  resourceType: 'image' | 'video',
  fromType: 'upload' | 'authenticated',
  toType: 'upload' | 'authenticated',
) {
  return cloudinary.uploader.rename(publicId, publicId, {
    resource_type: resourceType,
    type: fromType,
    to_type: toType,
    overwrite: true,
    invalidate: true,
  })
}

export async function destroyCloudinaryAsset(
  publicId: string,
  resourceType: 'image' | 'video',
  type: 'upload' | 'authenticated',
) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type,
    invalidate: true,
  })
}
