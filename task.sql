BEGIN;

CREATE TABLE users (
    id SERIAL PRIMARY KEY NOT NULL,
    email text UNIQUE NOT NULL,
    password text NOT NULL,
    session_data text
);

CREATE TABLE tickers (
    id SERIAL PRIMARY KEY NOT NULL,
    symbol VARCHAR(255),
    name VARCHAR(255)
);

CREATE TABLE user_tickers (
    user_id int NOT NULL REFERENCES users (id),
    ticker_id int NOT NULL REFERENCES tickers (id)
);

CREATE TABLE ticker_data (
    ticker_id int NOT NULL REFERENCES tickers (id),
    Dat VARCHAR(255),
    price DECIMAL
);



COMMIT;
