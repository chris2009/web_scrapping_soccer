CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    username   VARCHAR(80)  UNIQUE NOT NULL,
    email      VARCHAR(200) UNIQUE,
    password_hash TEXT       NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'user'
                            CHECK (role IN ('admin', 'user')),
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_users_username ON users (username);
