import pool from '../config/db.js';

// Get all budgets
export const getAllBudgetsService = async () => {
    const result = await pool.query("SELECT * FROM budget");
    return result.rows;
}

// Get budget by ID
export const getBudgetByIdService = async (id) => {
    const result = await pool.query("SELECT * FROM budget WHERE b_id = $1", [id]);
    return result.rows[0];
}

// Create new budget
export const createBudgetService = async (user_id, b_mnth, limit_amount) => {
    const result = await pool.query(
        "INSERT INTO budget (user_id, b_mnth, limit_amount) VALUES ($1, TO_DATE($2, 'YYYY-MM'), $3) RETURNING *",
        [user_id, b_mnth, limit_amount]
    );
    return result.rows[0];
};

// Update budget
export const updateBudgetService = async (id, user_id, b_mnth, limit_amount) => {
    const result = await pool.query(
        "UPDATE budget SET user_id = $1, b_mnth = TO_DATE($2, 'YYYY-MM'), limit_amount = $3 WHERE b_id = $4 RETURNING *",
        [user_id, b_mnth, limit_amount, id]
    );
    return result.rows[0];
};

// Delete budget
export const deleteBudgetService = async (id) => {
    const result = await pool.query("DELETE FROM budget WHERE b_id = $1 RETURNING *", [id]);
    return result.rows[0];
};

// Get budgets by user ID
export const getBudgetsByUserIdService = async (user_id) => {
    const result = await pool.query("SELECT * FROM budget WHERE user_id = $1 ORDER BY b_mnth DESC", [user_id]);
    return result.rows;
};

// Get budget by user and month
export const getBudgetByUserAndMonthService = async (user_id, b_mnth) => {
    const result = await pool.query(
        "SELECT * FROM budget WHERE user_id = $1 AND b_mnth = TO_DATE($2, 'YYYY-MM')",
        [user_id, b_mnth]
    );
    return result.rows[0];
};

// Get budget with spending summary
export const getBudgetWithSpendingService = async (user_id, b_mnth) => {
    const result = await pool.query(`
        SELECT 
            b.b_id,
            b.user_id,
            b.b_mnth,
            b.limit_amount,
            COALESCE(SUM(e.ex_amount), 0) as spent_amount,
            (b.limit_amount - COALESCE(SUM(e.ex_amount), 0)) as remaining_amount
        FROM budget b
        LEFT JOIN expense e ON b.user_id = e.user_id 
            AND DATE_TRUNC('month', e.ex_data) = DATE_TRUNC('month', TO_DATE(b.b_mnth, 'YYYY-MM'))
        WHERE b.user_id = $1 AND b.b_mnth = $2
        GROUP BY b.b_id, b.user_id, b.b_mnth, b.limit_amount
    `, [user_id, b_mnth]);
    return result.rows[0];
};
