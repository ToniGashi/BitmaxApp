BEGIN;

CREATE TABLE users (
    id SERIAL PRIMARY KEY NOT NULL,
    email text UNIQUE NOT NULL,
    dhash text NOT NULL,
    session_data text
);

CREATE TABLE tickers (
    id TEXT PRIMARY KEY NOT NULL,
    symbol VARCHAR(255),
    name text UNIQUE
);

CREATE TABLE user_tickers (
    user_id int NOT NULL REFERENCES users (id),
    ticker_id TEXT NOT NULL REFERENCES tickers (id)
);

CREATE TABLE ticker_data (
    ticker_id TEXT NOT NULL REFERENCES tickers (id),
    Date TIMESTAMP,
    price DECIMAL
);

INSERT INTO users (email, dhash) values ('tonigashi@gmail.com', '$2a$10$Zaj07zmXgC7MmV/BjMdo2e5RSZa/Kbh4DmM5qDZXoFPN/k7fzFvq2');

COMMIT;
