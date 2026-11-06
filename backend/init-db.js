import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import pg from 'pg'
if (!process.env.DATABASE_URL) throw new Error('Define DATABASE_URL en el entorno.')
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
try {
  await pool.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'))
  console.log('Esquema y trámites de demostración listos.')
} catch (error) {
  const refused = error.code === 'ECONNREFUSED' || error.errors?.some((cause) => cause.code === 'ECONNREFUSED')
  if (refused) {
    console.error(`No se pudo conectar a PostgreSQL (${new URL(process.env.DATABASE_URL).host}). Inicia el servicio PostgreSQL y confirma el puerto de DATABASE_URL en .env. Cuando el servidor esté escuchando, vuelve a ejecutar npm run db:init.`)
  } else {
    console.error(`No se pudo inicializar la base de datos: ${error.message}`)
  }
  process.exitCode = 1
} finally {
  await pool.end()
}
