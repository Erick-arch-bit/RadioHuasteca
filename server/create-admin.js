import 'dotenv/config'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } = process.env
if (![ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, process.env.DATABASE_URL].every(Boolean)) {
  console.error('Define DATABASE_URL, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_NAME y ADMIN_PASSWORD en el entorno. La contraseña no se almacena en el repositorio.')
  process.exit(1)
}
if (ADMIN_PASSWORD.length < 12) { console.error('ADMIN_PASSWORD debe tener al menos 12 caracteres.'); process.exit(1) }
try {
  await pool.query(`INSERT INTO admin_users (username,email,display_name,password_hash) VALUES ($1,$2,$3,crypt($4,gen_salt('bf')))`, [ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD])
  console.log('Cuenta administradora creada.')
} catch (error) { console.error('No se pudo crear la cuenta. Verifica que username y email sean únicos.', error.message); process.exitCode = 1 }
finally { await pool.end() }
