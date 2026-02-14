import pool from "../config/db.js";

export const getAllUsersService = async () => {
    const result = await pool.query("SELECT * FROM user_data");
    return result.rows;
}

export const getUserByIdService = async (id) => {
    const result = await pool.query("SELECT * FROM user_data WHERE user_id = $1", [id]);
    return result.rows[0];
}

export const createUserService = async (name, email, password) => {
    const result = await pool.query("INSERT INTO user_data (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *", [name, email, password]);
    return result.rows[0];
}

export const updateUserService = async (id, name, email, password) => {
    const result = await pool.query("UPDATE user_data SET user_name = $1, user_email = $2, user_password = $3 WHERE user_id = $4 RETURNING *", [name, email, password, id]);
    return result.rows[0];
}

export const deleteUserService = async (id) => {
    const result = await pool.query("DELETE FROM user_data WHERE user_id = $1 RETURNING *", [id]);
    return result.rows[0];
}

export const updateUserBankBalanceService = async (id, bank_opening_balance) => {
    const result = await pool.query(
        "UPDATE user_data SET bank_opening_balance = $1 WHERE user_id = $2 RETURNING *",
        [bank_opening_balance, id]
    );
    return result.rows[0];
}
