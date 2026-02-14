import {
    createUserService,
    getAllUsersService,
    getUserByIdService,
    updateUserService,
    deleteUserService,
    updateUserBankBalanceService
} from "../models/userModel.js";

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data
    });
};

export const createUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        const newUser = await createUserService(name, email, password);
        handleResponse(res, 201, "User created successfully", newUser);
    } catch (err) {
        next(err);
    }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await getAllUsersService();
        handleResponse(res, 200, "Users fetched successfully", users);
    } catch (err) {
        next(err);
    }
};

export const getUserById = async (req, res, next) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return handleResponse(res, 400, "Invalid user ID. It must be a number.");
    }

    try {
        const user = await getUserByIdService(Number(id));
        if (!user) return handleResponse(res, 404, "User not found");
        handleResponse(res, 200, "User fetched successfully", user);
    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        const updatedUser = await updateUserService(req.params.id, name, email, password);
        if (!updatedUser) return handleResponse(res, 404, "User not found");
        handleResponse(res, 200, "User updated successfully", updatedUser);
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const deletedUser = await deleteUserService(req.params.id);
        if (!deletedUser) return handleResponse(res, 404, "User not found");
        handleResponse(res, 200, "User deleted successfully", deletedUser);
    } catch (err) {
        next(err);
    }
};

export const updateUserBankBalance = async (req, res, next) => {
    const { id } = req.params;
    const { bank_opening_balance } = req.body;

    if (isNaN(id)) {
        return handleResponse(res, 400, "Invalid user ID. It must be a number.");
    }

    if (bank_opening_balance === undefined || isNaN(bank_opening_balance)) {
        return handleResponse(res, 400, "bank_opening_balance is required and must be a valid number");
    }

    try {
        const updatedUser = await updateUserBankBalanceService(
            Number(id),
            Number(bank_opening_balance)
        );
        if (!updatedUser) return handleResponse(res, 404, "User not found");
        handleResponse(res, 200, "User bank opening balance updated successfully", updatedUser);
    } catch (err) {
        next(err);
    }
};
