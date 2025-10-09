import {
    createUserService,
    getAllUsersService,
    getUserByIdService,
    updateUserService,
    deleteUserService
} from "../models/userModel.js";

// standardized way to handle errors in express
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

    // 🧩 Validate the ID before querying
    if (isNaN(id)) {
        return handleResponse(res, 400, "Invalid user ID. It must be a number.");
    }

    try {
        // convert string -> number before passing to DB
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