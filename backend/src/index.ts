import 'dotenv/config'
import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { adminRoutes } from './routes/admin'
import { catalogRoutes } from './routes/catalog'
import { mediaRoutes } from './routes/media'
import { noticeRoutes } from './routes/notices'

const port = Number(process.env.PORT ?? 3001)
const frontendOrigin = process.env.FRONTEND_ORIGIN
if (process.env.NODE_ENV === 'production' && !frontendOrigin) {
  throw new Error('Define FRONTEND_ORIGIN en producción.')
}
const allowedOrigin = frontendOrigin ?? true

const app = new Elysia()
  .use(cors({ origin: allowedOrigin, credentials: true }))
  .get('/', () => ({ name: 'RadioHuasteca API', status: 'ok', health: '/api/health' }))
  .get('/api/health', () => ({ status: 'ok' }))
  .use(mediaRoutes)
  .use(noticeRoutes)
  .use(catalogRoutes)
  .use(adminRoutes)
  .onError(({ code, error, set }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404
      return { message: 'Ruta no encontrada.' }
    }
    console.error(error)
    if (code === 'VALIDATION') {
      set.status = 400
      return { message: 'Los datos enviados no son válidos.' }
    }
    set.status = 500
    return { message: 'Error interno de la API.' }
  })
  .listen(port)

console.log(`RadioHuasteca API escuchando en http://localhost:${app.server?.port}`)
