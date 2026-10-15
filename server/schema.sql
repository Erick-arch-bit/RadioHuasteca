CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (length(trim(username)) > 0), CHECK (length(trim(email)) > 3),
  CHECK (length(trim(display_name)) > 0)
);
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('operator', 'moderator'));

CREATE TABLE IF NOT EXISTS media_audios (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  category TEXT NOT NULL CHECK (length(trim(category)) > 0),
  language TEXT NOT NULL CHECK (length(trim(language)) > 0),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0),
  description TEXT NOT NULL DEFAULT '',
  storage_name TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  uploaded_by BIGINT NOT NULL REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS citizen_submissions (
  id BIGSERIAL PRIMARY KEY,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'video')),
  storage_name TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  private_contact TEXT,
  status TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')),
  public_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by BIGINT REFERENCES admin_users(id)
);

CREATE TABLE IF NOT EXISTS moderation_history (
  id BIGSERIAL PRIMARY KEY,
  submission_id BIGINT NOT NULL REFERENCES citizen_submissions(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL CHECK (new_status IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')),
  changed_by BIGINT REFERENCES admin_users(id),
  note TEXT NOT NULL DEFAULT '',
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE moderation_history ALTER COLUMN changed_by DROP NOT NULL;

CREATE TABLE IF NOT EXISTS procedures (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  requirements JSONB NOT NULL CHECK (jsonb_typeof(requirements) = 'array' AND jsonb_array_length(requirements) > 0),
  steps JSONB NOT NULL CHECK (jsonb_typeof(steps) = 'array' AND jsonb_array_length(steps) > 0),
  responsible TEXT NOT NULL,
  validity TEXT,
  priority BOOLEAN NOT NULL DEFAULT false,
  translations JSONB NOT NULL DEFAULT '{"es": {"status": "verified"}, "hnh": {"status": "pending_validation"}}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (length(trim(title)) > 0), CHECK (length(trim(summary)) > 0), CHECK (length(trim(responsible)) > 0)
);

CREATE TABLE IF NOT EXISTS procedure_audios (
  id BIGSERIAL PRIMARY KEY,
  procedure_id TEXT NOT NULL UNIQUE REFERENCES procedures(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'es',
  voice_name TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (length(trim(url)) > 0), CHECK (language IN ('es', 'hnh'))
);
ALTER TABLE procedure_audios ADD COLUMN IF NOT EXISTS voice_name TEXT;

INSERT INTO procedures (id, title, summary, requirements, steps, responsible, validity, priority, translations) VALUES
('constancia-residencia', 'Constancia de residencia', 'Solicitud de constancia para acreditar el domicilio en la comunidad.', '["Identificación oficial vigente", "Comprobante de domicilio reciente", "Datos de contacto"]', '["Acude a la oficina de atención comunitaria.", "Entrega los documentos y llena la solicitud.", "Consulta la fecha indicada para recoger la constancia."]', 'Oficina de atención comunitaria · dato demostrativo, confirmar con la autoridad local.', 'La vigencia depende de la institución que solicita la constancia.', true, '{"es":{"status":"demo"},"hnh":{"status":"pending_validation"}}'),
('apoyo-adulto-mayor', 'Orientación para apoyos a personas adultas mayores', 'Información inicial para solicitar orientación sobre programas de apoyo.', '["Identificación oficial", "CURP", "Comprobante de domicilio"]', '["Verifica la convocatoria y fechas vigentes.", "Acude al módulo oficial que corresponda.", "Solicita una revisión de documentos antes de entregarlos."]', 'Módulo oficial del programa · confirmar ubicación y convocatoria vigente.', 'La convocatoria y sus fechas pueden cambiar.', true, '{"es":{"status":"demo"},"hnh":{"status":"pending_validation"}}'),
('registro-aviso-comunitario', 'Registro de aviso comunitario', 'Canal para compartir un aviso de interés para la comunidad.', '["Título y descripción del aviso", "Fecha y tipo de aviso", "Medio de contacto"]', '["Prepara la información clara y verificable.", "Entrega el aviso a la persona responsable de comunicación.", "Confirma su publicación."]', 'Equipo de comunicación comunitaria · referencia de demostración.', null, false, '{"es":{"status":"demo"},"hnh":{"status":"pending_validation"}}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO procedure_audios (procedure_id, url, language, voice_name, is_demo) VALUES
('constancia-residencia', '/audio/tramite-constancia-residencia.mp3', 'es', 'Lizy · Customer Service Assistant', false),
('apoyo-adulto-mayor', '/audio/tramite-apoyo-adulto-mayor.mp3', 'es', 'Ninoska · Spanish Teacher', false)
ON CONFLICT (procedure_id) DO UPDATE SET url = EXCLUDED.url, language = EXCLUDED.language, voice_name = EXCLUDED.voice_name, is_demo = EXCLUDED.is_demo;
