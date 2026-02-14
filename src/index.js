import express from 'express'
import cors from "cors"
import dotenv from 'dotenv'
import pool from "./config/db.js"

import userRoutes from './routes/userRoutes.js'
import expenseRoutes from './routes/expenseRoutes.js'
import budgetRoutes from './routes/budgetRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import errorHandling from './middlewares/errorHandler.js'
import { runAutoReportsNowForPreviousMonth, startAutoReportScheduler } from './services/autoReportScheduler.js'
dotenv.config()

const app = express()

const port = process.env.PORT || 3001;

app.use(express.json())
app.use(cors())

app.use("/api/user", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reports", reportRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({ status: 200, message: "OK" });
});

app.get("/", async (req, res, next) => {
    try {
        const result = await pool.query("SELECT current_database()");
        res.send(`The database connected is: ${result.rows[0].current_database}`);
    } catch (err) {
        next(err);
    }
});

app.use((req, res) => {
    res.status(404).json({
        status: 404,
        message: "Route not found"
    });
});

app.use(errorHandling);

const ensureSchema = async () => {
    await pool.query(`
        ALTER TABLE user_data
        ADD COLUMN IF NOT EXISTS bank_opening_balance NUMERIC(14,2) NOT NULL DEFAULT 0
    `);

    await pool.query(`
        ALTER TABLE expense
        ADD COLUMN IF NOT EXISTS ex_type VARCHAR(10) NOT NULL DEFAULT 'expense'
    `);

    await pool.query(`
        DO $$
        DECLARE
            identity_flag TEXT;
        BEGIN
            SELECT is_identity
            INTO identity_flag
            FROM information_schema.columns
            WHERE table_name = 'expense' AND column_name = 'ex_id'
            LIMIT 1;

            IF identity_flag = 'NO' THEN
                CREATE SEQUENCE IF NOT EXISTS expense_ex_id_seq;
                PERFORM setval(
                    'expense_ex_id_seq',
                    COALESCE((SELECT MAX(ex_id) FROM expense), 0) + 1,
                    false
                );
                ALTER TABLE expense
                ALTER COLUMN ex_id SET DEFAULT nextval('expense_ex_id_seq');
            END IF;
        END
        $$;
    `);
};

const bootstrap = async () => {
    await ensureSchema();
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`)
        startAutoReportScheduler();
        runAutoReportsNowForPreviousMonth().catch((err) => {
            console.error('[auto-report] bootstrap run failed:', err.message);
        });
    });
};

bootstrap().catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});
