import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
  throw new Error('Define DATABASE_URL en el entorno.')
}

export const sql = postgres(process.env.DATABASE_URL, {
  max: Number(process.env.DB_MAX_CONNECTIONS ?? 10),
  idle_timeout: 20,
  connect_timeout: 10,
})

export async function ensureNoticeMediaColumns() {
  await sql`
    ALTER TABLE community_notices
      ADD COLUMN IF NOT EXISTS media_url TEXT,
      ADD COLUMN IF NOT EXISTS media_public_id TEXT
  `
}
