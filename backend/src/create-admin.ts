import 'dotenv/config'
import postgres from 'postgres'

const required = ['DATABASE_URL', 'ADMIN_USERNAME', 'ADMIN_EMAIL', 'ADMIN_NAME', 'ADMIN_PASSWORD']
if (!required.every((key) => process.env[key])) {
  throw new Error('Define DATABASE_URL, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_NAME y ADMIN_PASSWORD.')
}
if ((process.env.ADMIN_PASSWORD ?? '').length < 12) throw new Error('ADMIN_PASSWORD debe tener al menos 12 caracteres.')

const sql = postgres(process.env.DATABASE_URL as string)
const username = process.env.ADMIN_USERNAME as string
const email = process.env.ADMIN_EMAIL as string
const name = process.env.ADMIN_NAME as string
const password = process.env.ADMIN_PASSWORD as string
try {
  await sql`
    INSERT INTO admin_users (username, email, display_name, password_hash)
    VALUES (${username}, ${email}, ${name}, crypt(${password}, gen_salt('bf')))
  `
  console.log('Cuenta administradora creada.')
} finally {
  await sql.end()
}
