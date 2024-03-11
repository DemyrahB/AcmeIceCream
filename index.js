const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_icecream_db')
const app = express()
const port = process.env.PORT || 8080

const init = async()=>{
    await client.connect();
    console.log('You are connected to the database');
    let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      is_favorite BOOLEAN DEFAULT TRUE, 
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now() 
    );
    `
    await client.query(SQL);
    console.log('tables created');
    SQL = `
    INSERT INTO flavors(name, is_favorite) VALUES('Vanilla', FALSE);
    INSERT INTO flavors(name, is_favorite) VALUES('Chocolate', TRUE);
    INSERT INTO flavors(name, is_favorite) VALUES('Strawberry', TRUE);
    INSERT INTO flavors(name, is_favorite) VALUES('Butter pecan', FALSE);
    INSERT INTO flavors(name, is_favorite) VALUES('Cookie dough', TRUE);
    INSERT INTO flavors(name, is_favorite) VALUES('Chocolate Chip', TRUE);
    INSERT INTO flavors(name, is_favorite) VALUES('Oreo', TRUE);
    INSERT INTO flavors(name, is_favorite) VALUES('Coffee', FALSE);
    INSERT INTO flavors(name, is_favorite) VALUES('Birthday cake', TRUE);
    INSERT INTO flavors(name, is_favorite) VALUES('Pistachio', FALSE);
    `;
    await client.query(SQL);
    console.log('data seeded')
}
app.use(express.json());
app.use(require('morgan')('dev'))
app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
        INSERT INTO flavors(name)
        VALUES($1)
        RETURNING *
        `
        const response = await client.query(SQL, [req.body.name])
        res.send(response.rows[0])
    } catch (ex) {
        next(ex)
    }
});
app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
        SELECT * from flavors ORDER BY created_at DESC;
        `
        const response = await client.query(SQL)
        console.log(response)
        res.send(response.rows)
    } catch (ex) {
        next(ex)
    }
});
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
        UPDATE flavors
        SET name=$1, is_favorite=$2, created_at=now(), updated_at=now()
        WHERE id=$3 RETURNING *
        `
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id])
        res.send(response.rows[0])
    } catch (ex) {
        next(ex)
    }
});
app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
        DELETE from flavors
        WHERE id = $1
        `
        const response = await client.query(SQL, [req.params.id])
        res.sendStatus(204)
    } catch (ex) {
        next(ex)
    }
});

app.listen(port, ()=>{
    `listening on port ${port}`
})
init()