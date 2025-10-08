import pkg from 'pg'
import dotenv from 'dotenv'

const { Pool } = pkg
dotenv.config() 
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_HOST:", process.env.DB_HOST);
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DBPORT,
})

pool.on('connect', () => {
    console.log('connection pool established with database');
});

export default pool;