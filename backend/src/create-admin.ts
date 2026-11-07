import 'dotenv/config'
import postgres from 'postgres'

const required = ['DATABASE_URL', 'ADMIN_USERNAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD']
if (!required.every((key) => process.env[key])) {
  throw new Error('Define DATABASE_URL, ADMIN_USERNAME, ADMIN_EMAIL y ADMIN_PASSWORD.')
}
if ((process.env.ADMIN_PASSWORD ?? '').length < 12) throw new Error('ADMIN_PASSWORD debe tener al menos 12 caracteres.')

const sql = postgres(process.env.DATABASE_URL as string)
const username = process.env.ADMIN_USERNAME as string
const email = process.env.ADMIN_EMAIL as string
const password = process.env.ADMIN_PASSWORD as string
try {
  await sql`
    INSERT INTO users (username, email, password_hash, display_name, role, is_active)
    VALUES (${username}, ${email}, crypt(${password}, gen_salt('bf')), ${username}, 'admin', true)
    ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email,
      password_hash = EXCLUDED.password_hash, is_active = true
  `
  console.log('Cuenta administradora creada.')
} finally {
  await sql.end()
}
