import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import postgres from 'postgres'

if (!process.env.DATABASE_URL) throw new Error('Define DATABASE_URL en el entorno.')
const sql = postgres(process.env.DATABASE_URL)
try {
  await sql.unsafe(await readFile(new URL('../schema.sql', import.meta.url), 'utf8'))
  console.log('Esquema y trámites de demostración listos.')
} finally {
  await sql.end()
}
