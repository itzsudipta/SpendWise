import {
    getAllExpensesService,
    getExpenseByIdService,
    createExpenseService,
    updateExpenseService,
    deleteExpenseService,
    getExpensesByUserIdService,
    getExpensesByCategoryService,
    getExpensesWithDetailsService
} from "../models/expenseModel.js";

// Standardized response handler
const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data
    });
};

// Get all expenses
export const getAllExpenses = async (req, res, next) => {
    try {
        const expenses = await getAllExpensesService();
        handleResponse(res, 200, "Expenses fetched successfully", expenses);
    } catch (err) {
        next(err);
    }
};

// Get expense by ID
export const getExpenseById = async (req, res, next) => {
    const { id } = req.params;

    // Validate ID
    if (isNaN(id)) {
        return handleResponse(res, 400, "Invalid expense ID. It must be a number.");
    }

    try {
        const expense = await getExpenseByIdService(Number(id));
        if (!expense) return handleResponse(res, 404, "Expense not found");
        handleResponse(res, 200, "Expense fetched successfully", expense);
    } catch (err) {
        next(err);
    }
};

// Create new expense
export const createExpense = async (req, res, next) => {
    const { user_id, cy_id, ex_amount, ex_desc, ex_data } = req.body;

    // Validate required fields
    if (!user_id || !cy_id || !ex_amount) {
        return handleResponse(res, 400, "user_id, cy_id, and ex_amount are required fields");
    }

    // Validate data types
    if (isNaN(user_id) || isNaN(cy_id) || isNaN(ex_amount)) {
        return handleResponse(res, 400, "user_id, cy_id, and ex_amount must be valid numbers");
    }

    if (ex_amount <= 0) {
        return handleResponse(res, 400, "ex_amount must be greater than 0");
    }

    try {
        const newExpense = await createExpenseService(
            Number(user_id),
            Number(cy_id),
            Number(ex_amount),
            ex_desc || null,
            ex_data || null
        );
        handleResponse(res, 201, "Expense created successfully", newExpense);
    } catch (err) {
        next(err);
    }
};

// Update expense
export const updateExpense = async (req, res, next) => {
    const { id } = req.params;
    const { user_id, cy_id, ex_amount, ex_desc, ex_data } = req.body;

    // Validate ID
    if (isNaN(id)) {
        return handleResponse(res, 400, "Invalid expense ID. It must be a number.");
    }

    // Validate required fields
    if (!user_id || !cy_id || !ex_amount) {
        return handleResponse(res, 400, "user_id, cy_id, and ex_amount are required fields");
    }

    // Validate data types
    if (isNaN(user_id) || isNaN(cy_id) || isNaN(ex_amount)) {
        return handleResponse(res, 400, "user_id, cy_id, and ex_amount must be valid numbers");
    }

    if (ex_amount <= 0) {
        return handleResponse(res, 400, "ex_amount must be greater than 0");
    }

    try {
        const updatedExpense = await updateExpenseService(
            Number(id),
            Number(user_id),
            Number(cy_id),
            Number(ex_amount),
            ex_desc || null,
            ex_data || null
        );
        if (!updatedExpense) return handleResponse(res, 404, "Expense not found");
        handleResponse(res, 200, "Expense updated successfully", updatedExpense);
    } catch (err) {
        next(err);
    }
};

// Delete expense
export const deleteExpense = async (req, res, next) => {
    const { id } = req.params;

    // Validate ID
    if (isNaN(id)) {
        return handleResponse(res, 400, "Invalid expense ID. It must be a number.");
    }

    try {
        const deletedExpense = await deleteExpenseService(Number(id));
        if (!deletedExpense) return handleResponse(res, 404, "Expense not found");
        handleResponse(res, 200, "Expense deleted successfully", deletedExpense);
    } catch (err) {
        next(err);
    }
};

// Get expenses by user ID
export const getExpensesByUserId = async (req, res, next) => {
    const { user_id } = req.params;

    // Validate user_id
    if (isNaN(user_id)) {
        return handleResponse(res, 400, "Invalid user ID. It must be a number.");
    }

    try {
        const expenses = await getExpensesByUserIdService(Number(user_id));
        handleResponse(res, 200, "User expenses fetched successfully", expenses);
    } catch (err) {
        next(err);
    }
};

// Get expenses by category ID
export const getExpensesByCategory = async (req, res, next) => {
    const { cy_id } = req.params;

    // Validate cy_id
    if (isNaN(cy_id)) {
        return handleResponse(res, 400, "Invalid category ID. It must be a number.");
    }

    try {
        const expenses = await getExpensesByCategoryService(Number(cy_id));
        handleResponse(res, 200, "Category expenses fetched successfully", expenses);
    } catch (err) {
        next(err);
    }
};

// Get expenses with detailed information (JOIN query)
export const getExpensesWithDetails = async (req, res, next) => {
    try {
        const expenses = await getExpensesWithDetailsService();
        handleResponse(res, 200, "Detailed expenses fetched successfully", expenses);
    } catch (err) {
        next(err);
    }
};