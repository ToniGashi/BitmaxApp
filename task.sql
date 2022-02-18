BEGIN;

CREATE TABLE users (
    id SERIAL PRIMARY KEY NOT NULL,
    email text UNIQUE NOT NULL,
    dhash text NOT NULL,
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

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
INSERT INTO users (email, dpassword) values ('tonigashi@gmail.com', '$2b$10$B3KkKy4IaUpwsZLLNb0SH.gmIqiaweruymA0pEAKfZOAfnCNTOguC');
=======
INSERT INTO users (email, dpassword) values ('tonisproject@gmail.com', 'T3stpw!');
=======
INSERT INTO users (email, dhash) values ('tonisproject@gmail.com', 'T3stpw!');
>>>>>>> d15c8a2 (hashing passwords)

>>>>>>> be0e6fd (task02 initial commit)
=======
INSERT INTO users (email, dhash) values ('tonigashi@gmail.com', '$2b$10$B3KkKy4IaUpwsZLLNb0SH.gmIqiaweruymA0pEAKfZOAfnCNTOguC');
>>>>>>> 9a72027 (Changes to backend)
=======
INSERT INTO users (email, dhash) values ('tonigashi@gmail.com', '$2a$10$Zaj07zmXgC7MmV/BjMdo2e5RSZa/Kbh4DmM5qDZXoFPN/k7fzFvq2');
>>>>>>> a142ec3 (Fixing task02)

COMMIT;
