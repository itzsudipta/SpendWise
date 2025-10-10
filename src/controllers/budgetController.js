import {
    getAllBudgetsService,
    getBudgetByIdService,
    createBudgetService,
    updateBudgetService,
    deleteBudgetService,
    getBudgetsByUserIdService,
    getBudgetByUserAndMonthService,
    getBudgetWithSpendingService
} from "../models/budgetModel.js";

// Standardized response handler
const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data
    });
};

// Get all budgets
export const getAllBudgets = async (req, res, next) => {
    try {
        const budgets = await getAllBudgetsService();
        handleResponse(res, 200, "Budgets fetched successfully", budgets);
    } catch (err) {
        next(err);
    }
};

// Get budget by ID
export const getBudgetById = async (req, res, next) => {
    const { id } = req.params;

    // Validate ID
    if (isNaN(id)) {
        return handleResponse(res, 400, "Invalid budget ID. It must be a number.");
    }

    try {
        const budget = await getBudgetByIdService(Number(id));
        if (!budget) return handleResponse(res, 404, "Budget not found");
        handleResponse(res, 200, "Budget fetched successfully", budget);
    } catch (err) {
        next(err);
    }
};

// Create new budget
export const createBudget = async (req, res, next) => {
    const { user_id, b_mnth, limit_amount } = req.body;

    // Validate required fields
    if (!user_id || !b_mnth || !limit_amount) {
        return handleResponse(res, 400, "user_id, b_mnth, and limit_amount are required fields");
    }

    // Validate data types
    if (isNaN(user_id) || isNaN(limit_amount)) {
        return handleResponse(res, 400, "user_id and limit_amount must be valid numbers");
    }

    if (limit_amount <= 0) {
        return handleResponse(res, 400, "limit_amount must be greater than 0");
    }

    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(b_mnth)) {
        return handleResponse(res, 400, "b_mnth must be in format YYYY-MM (e.g., 2025-10)");
    }

    try {
        // Check if budget already exists for this user and month
        const existingBudget = await getBudgetByUserAndMonthService(Number(user_id), b_mnth);
        if (existingBudget) {
            return handleResponse(res, 409, "Budget already exists for this user and month");
        }

        const newBudget = await createBudgetService(
            Number(user_id),
            b_mnth,
            Number(limit_amount)
        );
        handleResponse(res, 201, "Budget created successfully", newBudget);
    } catch (err) {
        next(err);
    }
};

// Update budget
export const updateBudget = async (req, res, next) => {
    const { id } = req.params;
    const { user_id, b_mnth, limit_amount } = req.body;

    // Validate ID
    if (isNaN(id)) {
        return handleResponse(res, 400, "Invalid budget ID. It must be a number.");
    }

    // Validate required fields
    if (!user_id || !b_mnth || !limit_amount) {
        return handleResponse(res, 400, "user_id, b_mnth, and limit_amount are required fields");
    }

    // Validate data types
    if (isNaN(user_id) || isNaN(limit_amount)) {
        return handleResponse(res, 400, "user_id and limit_amount must be valid numbers");
    }

    if (limit_amount <= 0) {
        return handleResponse(res, 400, "limit_amount must be greater than 0");
    }

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(b_mnth)) {
        return handleResponse(res, 400, "b_mnth must be in format YYYY-MM (e.g., 2025-10)");
    }

    try {
        const updatedBudget = await updateBudgetService(
            Number(id),
            Number(user_id),
            b_mnth,
            Number(limit_amount)
        );
        if (!updatedBudget) return handleResponse(res, 404, "Budget not found");
        handleResponse(res, 200, "Budget updated successfully", updatedBudget);
    } catch (err) {
        next(err);
    }
};

// Delete budget
export const deleteBudget = async (req, res, next) => {
    const { id } = req.params;

    // Validate ID
    if (isNaN(id)) {
        return handleResponse(res, 400, "Invalid budget ID. It must be a number.");
    }

    try {
        const deletedBudget = await deleteBudgetService(Number(id));
        if (!deletedBudget) return handleResponse(res, 404, "Budget not found");
        handleResponse(res, 200, "Budget deleted successfully", deletedBudget);
    } catch (err) {
        next(err);
    }
};

// Get budgets by user ID
export const getBudgetsByUserId = async (req, res, next) => {
    const { user_id } = req.params;

    // Validate user_id
    if (isNaN(user_id)) {
        return handleResponse(res, 400, "Invalid user ID. It must be a number.");
    }

    try {
        const budgets = await getBudgetsByUserIdService(Number(user_id));
        handleResponse(res, 200, "User budgets fetched successfully", budgets);
    } catch (err) {
        next(err);
    }
};

// Get budget by user and month
export const getBudgetByUserAndMonth = async (req, res, next) => {
    const { user_id, b_mnth } = req.params;

    // Validate user_id
    if (isNaN(user_id)) {
        return handleResponse(res, 400, "Invalid user ID. It must be a number.");
    }

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(b_mnth)) {
        return handleResponse(res, 400, "b_mnth must be in format YYYY-MM (e.g., 2025-10)");
    }

    try {
        const budget = await getBudgetByUserAndMonthService(Number(user_id), b_mnth);
        if (!budget) return handleResponse(res, 404, "Budget not found for this user and month");
        handleResponse(res, 200, "Budget fetched successfully", budget);
    } catch (err) {
        next(err);
    }
};

// Get budget with spending summary
export const getBudgetWithSpending = async (req, res, next) => {
    const { user_id, b_mnth } = req.params;

    // Validate user_id
    if (isNaN(user_id)) {
        return handleResponse(res, 400, "Invalid user ID. It must be a number.");
    }

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(b_mnth)) {
        return handleResponse(res, 400, "b_mnth must be in format YYYY-MM (e.g., 2025-10)");
    }

    try {
        const budgetWithSpending = await getBudgetWithSpendingService(Number(user_id), b_mnth);
        if (!budgetWithSpending) return handleResponse(res, 404, "Budget not found for this user and month");
        handleResponse(res, 200, "Budget with spending summary fetched successfully", budgetWithSpending);
    } catch (err) {
        next(err);
    }
};