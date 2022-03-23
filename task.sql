BEGIN;

CREATE TABLE users (
    id text PRIMARY KEY NOT NULL,
    email text UNIQUE NOT NULL,
    dhash text NOT NULL,
    session_data text
);

CREATE TABLE tickers (
    id text PRIMARY KEY NOT NULL,
    symbol VARCHAR(255),
    name text UNIQUE
);

CREATE TABLE user_tickers (
    user_id text NOT NULL REFERENCES users (id),
    ticker_id text NOT NULL REFERENCES tickers (id)
);

CREATE TABLE ticker_data (
    ticker_id text NOT NULL REFERENCES tickers (id),
    Date TIMESTAMP,
    price DECIMAL
);

INSERT INTO users (id, email, dhash) values ('a6742d1b-264e-4440-a340-06ccbcfd6c7e', 'tonigashi@gmail.com', '$2a$10$jgvkpP72XH/szf1XFY.2Fe3U.Sfb3qF9X2itKd9bICjtYikuE1KaG');
INSERT INTO tickers (id, symbol, name) values ('ad32c700-a91b-11ec-b33f-7b9e5e7edfa5', 'XBT', 'XBTUSD'), ('ad353800-a91b-11ec-b33f-7b9e5e7edfa5', 'LTC', 'LTCUSD'), ('ad344da0-a91b-11ec-b33f-7b9e5e7edfa5', 'ETH', 'ETHUSD');
INSERT INTO ticker_data (ticker_id, Date, price) values ('ad32c700-a91b-11ec-b33f-7b9e5e7edfa5', NOW(),  42502.71), ('ad353800-a91b-11ec-b33f-7b9e5e7edfa5', NOW(),  121.38), ('ad344da0-a91b-11ec-b33f-7b9e5e7edfa5', NOW(), 3016.8);

COMMIT;
