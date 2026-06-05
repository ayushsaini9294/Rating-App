-- ============================================================
-- Store Rating Platform — PostgreSQL Schema
-- ============================================================

-- Drop in correct dependency order
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;
DROP TYPE  IF EXISTS user_role;

-- Enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'user', 'owner');

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE users (
  id           SERIAL        PRIMARY KEY,
  name         VARCHAR(60)   NOT NULL CHECK (char_length(name) >= 20),
  email        VARCHAR(255)  NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  address      VARCHAR(400)  NOT NULL,
  role         user_role     NOT NULL DEFAULT 'user',
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Stores ───────────────────────────────────────────────────
CREATE TABLE stores (
  id         SERIAL        PRIMARY KEY,
  name       VARCHAR(60)   NOT NULL,
  email      VARCHAR(255)  NOT NULL UNIQUE,
  address    VARCHAR(400)  NOT NULL,
  owner_id   INT           REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Ratings ──────────────────────────────────────────────────
CREATE TABLE ratings (
  id         SERIAL      PRIMARY KEY,
  store_id   INT         NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id    INT         NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  rating     SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, user_id)
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_ratings_store  ON ratings (store_id);
CREATE INDEX idx_ratings_user   ON ratings (user_id);
CREATE INDEX idx_stores_owner   ON stores  (owner_id);
