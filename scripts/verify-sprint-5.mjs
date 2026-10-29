#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const evidenceDir = path.join(root, 'docs/evidence/sprint-5')
mkdirSync(evidenceDir, { recursive: true })
const results = []
function check(name, condition, detail) {
  results.push({ name, status: condition ? 'PASS' : 'FAIL', detail })
  if (!condition) process.exitCode = 1
}
function run(command, args) {
  const result = process.platform === 'win32'
    ? spawnSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', `${command} ${args.join(' ')}`], { cwd: root, encoding: 'utf8' })
    : spawnSync(command, args, { cwd: root, encoding: 'utf8' })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()
  results.push({ name: `${command} ${args.join(' ')}`, status: result.status === 0 ? 'PASS' : 'FAIL', detail: output || `exit ${result.status}` })
  if (result.status !== 0) process.exitCode = 1
}

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const server = readFileSync(path.join(root, 'server/index.js'), 'utf8')
const schema = readFileSync(path.join(root, 'server/schema.sql'), 'utf8')
const media = readFileSync(path.join(root, 'src/components/MediaViews.jsx'), 'utf8')
check('Autenticación en recursos administrativos', /function requireAdmin/.test(server) && /function requireModerator/.test(server) && /app\.get\('\/api\/admin\/submissions', requireModerator/.test(server), 'Las rutas administrativas críticas tienen middleware de sesión y rol.')
check('La entrega pública excluye envíos pendientes', /app\.get\('\/api\/published-submissions'[^\n]*status='APROBADO'/.test(server), 'La API pública consulta contenido ciudadano aprobado.')
check('Almacenamiento privado fuera de public', /\.\.\/private-media/.test(server) && /app\.get\('\/api\/media\/:name'/.test(server), 'Los archivos se guardan en private-media y se sirven mediante ruta API.')
check('Restricciones del esquema multimedia', /file_size BIGINT NOT NULL CHECK \(file_size > 0\)/.test(schema) && /status TEXT NOT NULL DEFAULT 'PENDIENTE'/.test(schema), 'El esquema requiere archivos no vacíos y estado inicial pendiente.')
check('Reintentos de formularios bloqueados mientras cargan', /disabled=\{busy\}/.test(media), 'Los formularios multimedia deshabilitan el botón durante el envío.')
check('Comandos heredados declarados', ['verify:sprint1', 'verify:sprint2', 'verify:sprint3'].every((name) => typeof pkg.scripts[name] === 'string'), 'Scripts de regresión de Sprints 1 a 3 presentes.')

run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'lint'])
run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'])

const now = new Date().toISOString()
const report = `# Verificación automatizada · Sprint 5\n\nFecha UTC: ${now}\n\n${results.map((r) => `- **${r.status}** · ${r.name}: ${r.detail.replaceAll('\n', ' ')}`).join('\n')}\n\nLas pruebas que dependen de PostgreSQL, Chromium, cuenta administrativa, red móvil simulada o inspección manual se registran en [verificación](../../sprint-5-verification.md) y no se consideran ejecutadas por este comando.\n`
writeFileSync(path.join(evidenceDir, 'automated-verification.md'), report, 'utf8')
console.log(report)
