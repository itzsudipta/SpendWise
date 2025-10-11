// built a express server
import express from 'express'
import cors from "cors"
import dotenv from 'dotenv'
import pool from "./config/db.js"

import userRoutes from './routes/userRoutes.js'
import expenseRoutes from './routes/expenseRoutes.js'
import budgetRoutes from './routes/budgetRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import errorHandling from './middlewares/errorHandler.js'
dotenv.config()

const app = express()

const port = process.env.PORT || 3001;

//Middlewares
app.use(express.json())
app.use(cors())

//then define routes
app.use("/api/user", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/categories", categoryRoutes);

//error handling middleware
app.use(errorHandling);
//Testing POSTGRES connection
    app.get("/",async(req, res) =>{
        console.log("Starting DB connection test");
        const result = await pool.query("SELECT current_database()");
        console.log("end");
        res.send(`The database connected is: ${result.rows[0].current_database}`);
    });
//server running
app.listen(port, () => {
    console.log(`Server is running on http:localhost: ${port}`)
});