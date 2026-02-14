import pkg from 'pg'
import dotenv from 'dotenv'

const { Pool } = pkg
dotenv.config() 

const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    })
    : new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME || process.env.DATABASE,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT || process.env.DBPORT || 5432),
    })

pool.on('connect', () => {
    console.log('connection pool established with database');
});

pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err.message);
});

export default pool;
