import pool from "../config/db.js";

// Get all expenses
export const getAllExpensesService = async () => {
    const result = await pool.query("SELECT * FROM expense");
    return result.rows; // Should return all rows, not just the first one
}

export const getExpenseByIdService = async (id) => {
    const result = await pool.query("SELECT * FROM expense WHERE ex_id = $1", [id]);
    return result.rows[0];
}

export const createExpenseService = async (user_id, cy_id, ex_amount, ex_desc, ex_data) => {
    const result = await pool.query(
        "INSERT INTO expense (user_id, cy_id, ex_amount, ex_desc, ex_data) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [user_id, cy_id, ex_amount, ex_desc, ex_data]
    );
    return result.rows[0];
}

export const updateExpenseService = async (id, user_id, cy_id, ex_amount, ex_desc, ex_data) => {
    const result = await pool.query(
        "UPDATE expense SET user_id = $1, cy_id = $2, ex_amount = $3, ex_desc = $4, ex_data = $5 WHERE ex_id = $6 RETURNING *",
        [user_id, cy_id, ex_amount, ex_desc, ex_data, id]
    );
    return result.rows[0];
}

export const deleteExpenseService = async (id) => {
    const result = await pool.query("DELETE FROM expense WHERE ex_id = $1 RETURNING *", [id]);
    return result.rows[0];
}

// Additional useful services for expenses
export const getExpensesByUserIdService = async (user_id) => {
    const result = await pool.query("SELECT * FROM expense WHERE user_id = $1 ORDER BY ex_data DESC", [user_id]);
    return result.rows;
}

export const getExpensesByCategoryService = async (cy_id) => {
    const result = await pool.query("SELECT * FROM expense WHERE cy_id = $1 ORDER BY ex_data DESC", [cy_id]);
    return result.rows;
}

export const getExpensesWithDetailsService = async () => {
    const result = await pool.query(`
        SELECT 
            e.ex_id,
            e.ex_amount,
            e.ex_desc,
            e.ex_data,
            e.created_at,
            u.user_name,
            u.user_email,
            c.cy_name as category_name
        FROM expense e
        LEFT JOIN user_data u ON e.user_id = u.user_id
        LEFT JOIN category c ON e.cy_id = c.cy_id
        ORDER BY e.ex_data DESC
    `);
    return result.rows;
}