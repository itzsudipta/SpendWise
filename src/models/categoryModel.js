import pool from "../config/db.js";

// Get all categories
export const getAllCategoriesService = async () => {
    const result = await pool.query("SELECT * FROM category ORDER BY cy_name");
    return result.rows;
}

// Get category by ID
export const getCategoryByIdService = async (cy_id) => {
    const result = await pool.query("SELECT * FROM category WHERE cy_id = $1", [cy_id]);
    return result.rows[0];
}

// Create new category
export const createCategoryService = async (user_id, cy_name) => {
    const result = await pool.query(
        "INSERT INTO category (user_id, cy_name) VALUES ($1, $2) RETURNING *",
        [user_id, cy_name]
    );
    return result.rows[0];
}

// Update category
export const updateCategoryService = async (cy_id, user_id, cy_name) => {
    const result = await pool.query(
        "UPDATE category SET user_id = $1, cy_name = $2 WHERE cy_id = $3 RETURNING *",
        [user_id, cy_name, cy_id]
    );
    return result.rows[0];
}

export const deleteCategoryService = async (cy_id) => {
    // First check if category has any expenses
    const expenseCheck = await pool.query(
        "SELECT COUNT(*) as count FROM expense WHERE cy_id = $1",
        [cy_id]
    );

    if (parseInt(expenseCheck.rows[0].count) > 0) {
        throw new Error(`Cannot delete category. It has ${expenseCheck.rows[0].count} expenses linked to it.`);
    }

    const result = await pool.query("DELETE FROM category WHERE cy_id = $1 RETURNING *", [cy_id]);
    return result.rows[0];
}

// Get categories by user ID
export const getCategoriesByUserIdService = async (user_id) => {
    const result = await pool.query("SELECT * FROM category WHERE user_id = $1 ORDER BY cy_name", [user_id]);
    return result.rows;
}

// Get category by name and user (to check for duplicates)
export const getCategoryByNameAndUserService = async (user_id, cy_name) => {
    const result = await pool.query(
        "SELECT * FROM category WHERE user_id = $1 AND LOWER(cy_name) = LOWER($2)",
        [user_id, cy_name]
    );
    return result.rows[0];
}

// Get categories with expense count
export const getCategoriesWithExpenseCountService = async (user_id) => {
    const result = await pool.query(`
        SELECT 
            c.cy_id,
            c.user_id,
            c.cy_name,
            COUNT(e.ex_id) as expense_count,
            COALESCE(SUM(e.ex_amount), 0) as total_spent
        FROM category c
        LEFT JOIN expense e ON c.cy_id = e.cy_id
        WHERE c.user_id = $1
        GROUP BY c.cy_id, c.user_id, c.cy_name
        ORDER BY c.cy_name
    `, [user_id]);
    return result.rows;
}

// Get most used categories by user
export const getMostUsedCategoriesService = async (user_id, limit = 5) => {
    const result = await pool.query(`
        SELECT 
            c.cy_id,
            c.cy_name,
            COUNT(e.ex_id) as usage_count,
            COALESCE(SUM(e.ex_amount), 0) as total_amount
        FROM category c
        INNER JOIN expense e ON c.cy_id = e.cy_id
        WHERE c.user_id = $1
        GROUP BY c.cy_id, c.cy_name
        ORDER BY usage_count DESC, total_amount DESC
        LIMIT $2
    `, [user_id, limit]);
    return result.rows;
}
