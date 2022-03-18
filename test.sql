\c bikers
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    username VARCHAR(30) NOT NULL
    age INT
);

INSERT INTO users
(username, age)
VALUES('adrian', '30')
RETURNING *;
