
CREATE TABLE t_p52075342_pc_admin_dashboard.pcs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE,
  zone VARCHAR(20) NOT NULL DEFAULT 'Стандарт',
  ip VARCHAR(45),
  mac_address VARCHAR(17),
  specs_cpu VARCHAR(100),
  specs_gpu VARCHAR(100),
  specs_ram VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'offline',
  last_seen TIMESTAMPTZ,
  agent_token VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p52075342_pc_admin_dashboard.clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  visits INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'idle',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p52075342_pc_admin_dashboard.tariffs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  zone VARCHAR(20) NOT NULL,
  price_per_hour INTEGER NOT NULL,
  min_time INTEGER NOT NULL DEFAULT 1,
  color VARCHAR(20) DEFAULT '#00ffff',
  popular BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE t_p52075342_pc_admin_dashboard.sessions (
  id SERIAL PRIMARY KEY,
  pc_id INTEGER NOT NULL REFERENCES t_p52075342_pc_admin_dashboard.pcs(id),
  client_id INTEGER REFERENCES t_p52075342_pc_admin_dashboard.clients(id),
  tariff_id INTEGER REFERENCES t_p52075342_pc_admin_dashboard.tariffs(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  cost INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  game VARCHAR(100)
);

CREATE TABLE t_p52075342_pc_admin_dashboard.pc_commands (
  id SERIAL PRIMARY KEY,
  pc_id INTEGER NOT NULL REFERENCES t_p52075342_pc_admin_dashboard.pcs(id),
  command VARCHAR(50) NOT NULL,
  params JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ,
  result JSONB
);

CREATE TABLE t_p52075342_pc_admin_dashboard.screenshots (
  id SERIAL PRIMARY KEY,
  pc_id INTEGER NOT NULL REFERENCES t_p52075342_pc_admin_dashboard.pcs(id),
  url TEXT NOT NULL,
  taken_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p52075342_pc_admin_dashboard.transactions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES t_p52075342_pc_admin_dashboard.clients(id),
  amount INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO t_p52075342_pc_admin_dashboard.tariffs (name, zone, price_per_hour, min_time, color, popular) VALUES
('Стандарт Day', 'Стандарт', 120, 1, '#22c55e', false),
('Стандарт Night', 'Стандарт', 80, 2, '#22c55e', false),
('VIP Day', 'VIP', 200, 1, '#a855f7', true),
('VIP Night', 'VIP', 150, 2, '#a855f7', false),
('Турнирная', 'Турнирная', 300, 1, '#f97316', false),
('Ночной пакет', 'Стандарт', 60, 8, '#00ffff', false);
