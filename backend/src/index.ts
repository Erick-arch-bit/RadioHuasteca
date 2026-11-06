import 'dotenv/config'
import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { adminRoutes } from './routes/admin'
import { catalogRoutes } from './routes/catalog'
import { mediaRoutes } from './routes/media'
import { noticeRoutes } from './routes/notices'

const port = Number(process.env.PORT ?? 3001)
const allowedOrigin = process.env.FRONTEND_ORIGIN ?? true

const app = new Elysia()
  .use(cors({ origin: allowedOrigin, credentials: true }))
  .get('/api/health', () => ({ status: 'ok' }))
  .use(mediaRoutes)
  .use(noticeRoutes)
  .use(catalogRoutes)
  .use(adminRoutes)
  .onError(({ code, error, set }) => {
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
