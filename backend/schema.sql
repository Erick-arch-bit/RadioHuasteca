-- ═══════════════════════════════════════════════════════════════
-- SPRINT 1: Tabla de usuarios administradores
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'moderator')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para búsquedas rápidas por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Migración sin pérdida para instalaciones anteriores que usaban admins.
DO $$ BEGIN
  IF to_regclass('public.admins') IS NOT NULL THEN
    INSERT INTO users (id, username, email, password_hash, display_name)
    SELECT id, username, email, password_hash, username FROM admins
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Tabla para registrar sesiones (opcional, para auditoría)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'login', 'logout', 'moderate', 'create'
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Verificar que se crearon las tablas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('users', 'audit_log');

-- Catálogos y participación ciudadana.
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  summary TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'community',
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  audio_url TEXT,
  audio_public_id TEXT,
  image_url TEXT,
  image_public_id TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE notices ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'community';
ALTER TABLE notices ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  requirements TEXT,
  steps TEXT,
  audio_url TEXT,
  audio_public_id TEXT,
  audio_mime_type VARCHAR(100),
  language VARCHAR(10) NOT NULL DEFAULT 'es',
  is_priority BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE procedures ADD COLUMN IF NOT EXISTS audio_public_id TEXT;
ALTER TABLE procedures ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'es';
ALTER TABLE procedures ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE procedures ADD COLUMN IF NOT EXISTS steps TEXT;

CREATE TABLE IF NOT EXISTS capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  audio_public_id TEXT,
  duration_seconds INT,
  category VARCHAR(100) NOT NULL DEFAULT 'Comunidad',
  language VARCHAR(100) NOT NULL DEFAULT 'Español',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS bulletins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  publish_date DATE NOT NULL,
  audio_url TEXT NOT NULL,
  audio_public_id TEXT NOT NULL,
  duration_seconds INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bulletins_one_active ON bulletins(is_active) WHERE is_active;

CREATE TABLE IF NOT EXISTS mailbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  audio_url TEXT,
  audio_public_id TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  sender_name VARCHAR(100),
  sender_contact VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citizen_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('audio', 'image', 'video')),
  mime_type VARCHAR(100) NOT NULL,
  public_id TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  duration_seconds INT,
  contact VARCHAR(160),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')),
  title VARCHAR(150),
  category VARCHAR(100) NOT NULL DEFAULT 'Comunidad',
  language VARCHAR(100) NOT NULL DEFAULT 'Español',
  description TEXT,
  capsule_id UUID REFERENCES capsules(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  review_note TEXT
);
CREATE TABLE IF NOT EXISTS submission_review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES citizen_submissions(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notices_status_created ON notices(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mailbox_status_created ON mailbox(status, created_at DESC);
ALTER TABLE mailbox ADD COLUMN IF NOT EXISTS audio_mime_type VARCHAR(100);
