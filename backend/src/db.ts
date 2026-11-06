import postgres from 'postgres'

if (!process.env.DATABASE_URL) throw new Error('Define DATABASE_URL en el entorno.')

export const sql = postgres(process.env.DATABASE_URL, {
  max: Number(process.env.DB_MAX_CONNECTIONS ?? 10),
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: process.env.DATABASE_SSL === 'disable'
    ? false
    : process.env.DATABASE_SSL === 'require'
      || process.env.NODE_ENV === 'production'
      || process.env.DATABASE_URL.includes('supabase.co')
      ? 'require'
      : undefined,
})
