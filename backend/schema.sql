CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  summary TEXT,
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(20) DEFAULT 'active',
  audio_url TEXT,
  audio_public_id TEXT,
  image_url TEXT,
  image_public_id TEXT,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  audio_public_id TEXT,
  duration_seconds INT,
  category VARCHAR(100) NOT NULL DEFAULT 'Comunidad',
  language VARCHAR(100) NOT NULL DEFAULT 'Español',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  requirements TEXT,
  audio_url TEXT,
  is_priority BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
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
  reviewed_by UUID REFERENCES admins(id),
  review_note TEXT
);

CREATE TABLE IF NOT EXISTS submission_review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES citizen_submissions(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES admins(id),
  status VARCHAR(20) NOT NULL,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE notices ADD COLUMN IF NOT EXISTS audio_public_id TEXT;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS image_public_id TEXT;
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS audio_public_id TEXT;
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'Comunidad';
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS language VARCHAR(100) NOT NULL DEFAULT 'Español';
ALTER TABLE citizen_submissions ADD COLUMN IF NOT EXISTS duration_seconds INT;

INSERT INTO notices (title, summary, priority, status) VALUES
  ('Reunión comunitaria', 'Este sábado a las 10am en la plaza principal', 'urgent', 'active'),
  ('Festival cultural', 'Celebración de la tradición Hñähñu el próximo mes', 'normal', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO capsules (title, description, audio_url, duration_seconds) VALUES
  ('Historia de Santa Ana', 'Orígenes de la comunidad', 'https://example.com/demo1.mp3', 120),
  ('Tradiciones Hñähñu', 'Costumbres ancestrales', 'https://example.com/demo2.mp3', 180)
ON CONFLICT DO NOTHING;
