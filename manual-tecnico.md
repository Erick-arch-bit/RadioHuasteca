# Manual técnico de RadioHuasteca

## 1. Alcance y estado del proyecto

RadioHuasteca es un repositorio con dos procesos independientes: una interfaz React/Vite (`src/`) y una API Bun/Elysia (`backend/`). PostgreSQL almacena administradores, avisos, cápsulas y trámites; Cloudinary se usa para cargar y entregar archivos multimedia.

El código visible no equivale a que todas las funciones estén conectadas de extremo a extremo. En la versión revisada, por ejemplo, los avisos públicos combinan API, datos semilla y localStorage; las cápsulas visibles usan datos locales; ciertas rutas de buzón/moderación no están implementadas; y los endpoints de carga de medios no persisten por sí solos una relación con aviso. Antes de desplegar, valida cada flujo funcional y el contenido de demostración.

## 2. Arquitectura

```text
Navegador
  └─ React 19 + Vite + Tailwind CSS (src/)
       ├─ datos locales de demostración y localStorage
       └─ fetch /api/* ──> Bun + Elysia (backend/src/index.ts)
                             ├─ PostgreSQL (backend/src/db.ts, schema.sql)
                             └─ Cloudinary (backend/src/cloudinary.ts)
```

El cliente lee `VITE_API_URL` al compilar. Si está vacío, usa rutas relativas `/api/...`, por lo que el frontend y la API deben compartir origen o el servidor web debe reenviar `/api`. En desarrollo, Vite suele estar en `http://localhost:5173` y la API en `http://localhost:3001`; el repositorio no muestra una configuración proxy de Vite. Configura `VITE_API_URL=http://localhost:3001` para que el navegador llame directamente a la API en ese entorno.

## 3. Interfaz web

### Tecnologías y entrada

- `src/main.jsx` monta React; `src/App.jsx` controla vista activa, idioma, menú, boletín y cápsulas.
- React 19, Vite 8 y Tailwind CSS v4; iconos de `lucide-react`.
- Las vistas secundarias se cargan con `React.lazy` y `Suspense`.
- `src/data/navigation.js` define destinos. Las cadenas ES/HN residen en `src/i18n/translations.js`; Hñähñu está marcado como borrador.

### Reproductores

El reproductor del boletín vive en `App` y se apoya en `src/hooks/useBulletinAudio.js`. Mantiene estados `idle`, `loading`, `playing`, `paused` y `error`, y usa eventos del elemento HTML `<audio>` para actualizar duración y progreso. El catálogo de cápsulas de demostración está en `src/data/notices.js`; los reproductores usan otro elemento `<audio>` montado por `App`.

### Avisos en el cliente

`src/hooks/useNotices.js` inicia con `noticeSeeds` de `src/data/notices.js`, agrega avisos creados localmente desde `localStorage` y trata de obtener avisos de `GET /api/notices`. Si la API falla, vuelve a los datos locales. Al refrescar mezcla los avisos remotos con semillas no repetidas y avisos locales. Los filtros de prioridad/estado son del lado del cliente. El servicio `noticeService.js` usa `apiClient.js` y `credentials: include`.

### Trámites y multimedia

`src/components/ProcedureView.jsx` inicia con `src/data/procedures.js` y reemplaza la lista si `GET /api/procedures` devuelve filas. Algunos campos de la respuesta API se adaptan a la vista; otros, como pasos y datos de audio traducidos, pueden no estar incluidos por el SQL actual. Fonoteca obtiene `GET /api/audios` y `GET /api/published-submissions`; el primero existe y el segundo devuelve una lista vacía constante en el estado actual. El reproductor de fonoteca usa `/api/media/:id`, que redirige a la URL de Cloudinary almacenada en la fila de cápsula.

## 4. Ejecución local

Requisitos indicados por el repositorio: Node.js 20+, npm 10+, Bun y PostgreSQL accesible. Para las cargas también se necesita una cuenta Cloudinary configurada.

```powershell
# Raíz del repositorio: instalar y arrancar la interfaz
npm install
npm run dev

# backend: instalar dependencias
cd backend
bun install
# configurar .env según .env.example
bun run db:init
bun run admin:create
bun run dev
```

La interfaz y la API son procesos separados; ejecuta cada uno en una terminal. `npm run build` genera `dist/`; `npm run lint` ejecuta oxlint. El script raíz también define `npm run server`, `npm run db:init` y `npm run admin:create` como accesos al backend.

## 5. Variables de entorno

Usa `backend/.env.example` como referencia y mantén secretos fuera del frontend y del control de versiones.

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto de escucha de la API; predeterminado `3001`. |
| `FRONTEND_ORIGIN` | Origen exacto permitido en CORS; en producción es obligatorio. |
| `DATABASE_URL` | Cadena de conexión PostgreSQL; obligatoria. |
| `DATABASE_SSL` | `disable` desactiva SSL; `require` lo fuerza. Producción y Supabase usan SSL. |
| `DB_MAX_CONNECTIONS` | Máximo del pool del driver; predeterminado `10`. |
| `SESSION_SECRET` | Clave de firma de sesión; al menos 32 caracteres. |
| `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Datos para `bun run admin:create`; contraseña mínima 12 caracteres. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Credenciales de almacenamiento; el módulo de Cloudinary requiere las tres. |
| `VITE_API_URL` | Base URL del API incorporada al bundle Vite; no debe contener secretos. |

## 6. API HTTP

Base local: `http://localhost:3001`. Las respuestas de aplicación son JSON salvo la redirección de medios. Elysia valida los cuerpos tipados; errores de validación se convierten en HTTP 400 y otros errores procesados por `onError` en HTTP 500. CORS permite credenciales y usa `FRONTEND_ORIGIN` si está configurado.

| Método | Ruta | Función y acceso |
| --- | --- | --- |
| `GET` | `/api/health` | Comprobación de salud; público. |
| `GET` | `/api/procedures` | Lista trámites ordenados por prioridad y nombre; consulta PostgreSQL. |
| `GET` | `/api/audios` | Lista cápsulas de la tabla `capsules`; público. |
| `GET` | `/api/published-submissions` | En el código actual devuelve `[]`; no hay entidad/ruta de envíos implementada. |
| `GET` | `/api/media/:id` | Busca URL de cápsula por ID y responde con redirección 302; devuelve 404 si no existe. |
| `GET` | `/api/notices/` | Lista avisos de PostgreSQL; público. |
| `POST` | `/api/notices/` | Crea aviso si hay sesión administrativa válida. |
| `POST` | `/api/media/upload` | Recibe campo `file` multipart de imagen/audio/video de hasta 50 MB y carga en Cloudinary. Requiere configurar Cloudinary; exige sesión administrativa solo en la lógica de UI, no en el handler actual. Devuelve `url`, `publicId`, `resourceType`; no guarda un registro en PostgreSQL. |
| `POST` | `/api/auth/login` | Recibe `{ username, password }`, verifica credenciales con `crypt`, emite cookie firmada `rh_admin`. |
| `GET` | `/api/auth/me` | Devuelve usuario de sesión o 401. |
| `POST` | `/api/auth/logout` | Limpia la cookie de sesión. |
| `GET` | `/api/admin/summary` | Resumen de trámites; requiere administrador. |
| `GET` | `/api/admin/notices` | Lista de administración; requiere administrador. |
| `POST` | `/api/admin/notices` | Crea aviso; requiere administrador. |
| `PATCH` | `/api/admin/notices/:id` | Actualiza aviso; requiere administrador. |
| `POST` | `/api/audios` | Carga audio a Cloudinary e inserta cápsula; requiere administrador. Campos multipart: `file`, `title`, `duration`, y opcionales `category`, `language`, `description`. |

El handler frontend espera algunas rutas que no están registradas en esta API: `POST /api/citizen-submissions`, `/api/admin/submissions` y rutas relacionadas con revisión/historial/descarga privada. No debe documentarse el buzón como persistencia funcional completa hasta implementar y conectar ese flujo.

## 7. Base de datos y almacenamiento

`backend/schema.sql` activa `pgcrypto` y crea:

- `admins`: identidad, correo único y hash de contraseña.
- `notices`: contenido, prioridad/estado, enlaces opcionales a medios, creador y fecha.
- `capsules`: título, descripción, URL/public ID de audio, duración y fecha.
- `procedures`: nombre, descripción, requisitos, audio y prioridad.

`bun run db:init` ejecuta el archivo SQL. El esquema inserta filas de demostración en avisos y cápsulas. `bun run admin:create` crea un administrador desde variables de entorno y guarda un hash bcrypt compatible con `pgcrypto`. La llamada no es idempotente si username/email ya existen.

`backend/src/cloudinary.ts` usa `upload_stream` dentro de la carpeta `radiohuasteca`. Imágenes reciben transformación de formato/calidad automáticos y ancho máximo. Las URLs multimedia se guardan para cápsulas y avisos por sus rutas correspondientes. Las credenciales solo deben vivir en el servidor.

## 8. Sesiones y seguridad

`backend/src/auth.ts` firma el contenido de sesión con HMAC-SHA256 y `SESSION_SECRET`, verifica firma en tiempo constante y caducidad de ocho horas. La cookie `rh_admin` es `HttpOnly`; en despliegue con `FRONTEND_ORIGIN` se marca `SameSite=None; Secure`, y sin origen usa `SameSite=Strict`. `getAdmin` vuelve a comprobar que el administrador exista en la base.

Operación recomendada: HTTPS para frontend y API en producción, `FRONTEND_ORIGIN` exacto, secreto aleatorio largo, credenciales de base/Cloudinary solo en el servidor, y reemplazo de contraseñas de ejemplo. El código actual permite CORS con cualquier origen si `FRONTEND_ORIGIN` no está definido fuera de producción; define un origen explícito también durante desarrollo compartido.

## 9. Limitaciones funcionales a resolver

1. El formulario del Buzón envía a `/api/citizen-submissions`, ruta inexistente; las pantallas de moderación apuntan a rutas `/api/admin/submissions` también inexistentes.
2. `GET /api/published-submissions` está implementado como arreglo vacío. No existe tabla de envíos, historial de moderación ni flujo de aprobación en `schema.sql`.
3. La carga genérica a Cloudinary no autentica al usuario en el handler. No se debe exponer como carga administrativa confiable hasta protegerla en el servidor.
4. `NoticeManagement` intenta usar `PATCH /api/admin/notices/:id`, que existe, y `POST /api/admin/notices`; en cambio los formularios de cliente envían algunos campos de fecha/tipo/audio que el esquema/ruta no persisten. La fila de aviso tiene `created_at` automático y no guarda `type` ni `audioId`.
5. La ruta pública de avisos consulta PostgreSQL; el frontend combina esas filas con semillas y almacenamiento local. Esto puede mostrar muestras junto con datos reales.
6. `schema.sql` inserta URLs `example.com` para cápsulas de muestra. Sustituye esos registros antes de uso público.
7. `GET /api/procedures` no devuelve todos los campos que consume el componente (por ejemplo pasos, responsable, vigencia, idioma/voz de audio). La UI usa datos locales cuando la respuesta está vacía, pero al recibir filas el detalle puede quedar incompleto.
8. El backend depende de `DATABASE_URL`, `SESSION_SECRET` y configuración de Cloudinary al importar módulos. Sin variables requeridas, el proceso puede fallar durante el arranque.

## 10. Despliegue

`backend/README.md` describe despliegue en Render con `render.yaml` (si está presente en la rama de despliegue): definir secretos `DATABASE_URL`, `FRONTEND_ORIGIN`, `SESSION_SECRET` y Cloudinary; usar PostgreSQL con SSL en producción; inicializar esquema y crear administrador una sola vez. Configura el host del frontend con `VITE_API_URL` al construir el sitio. Verifica `/api/health`, acceso administrativo, lectura/escritura de aviso y carga de audio con credenciales de prueba antes de publicar.
