import {
    getAllCategoriesService,
    getCategoryByIdService,
    createCategoryService,
    updateCategoryService,
    deleteCategoryService,
    getCategoriesByUserIdService
} from "../models/categoryModel.js";

// Standardized response handler
const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data
    });
};

// Get all categories
export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await getAllCategoriesService();
        handleResponse(res, 200, "Categories fetched successfully", categories);
    } catch (err) {
        next(err);
    }
};

// Get category by ID
export const getCategoryById = async (req, res, next) => {
    const { cy_id } = req.params;

    // Validate cy_id
    if (isNaN(cy_id)) {
        return handleResponse(res, 400, "Invalid category ID. It must be a number.");
    }

    try {
        const category = await getCategoryByIdService(Number(cy_id));
        if (!category) return handleResponse(res, 404, "Category not found");
        handleResponse(res, 200, "Category fetched successfully", category);
    } catch (err) {
        next(err);
    }
};

// Create new category
export const createCategory = async (req, res, next) => {
    const { user_id, cy_name } = req.body;

    // Validate required fields
    if (!user_id || !cy_name) {
        return handleResponse(res, 400, "user_id and cy_name are required fields");
    }

    // Validate data types
    if (isNaN(user_id)) {
        return handleResponse(res, 400, "user_id must be a valid number");
    }

    // Validate cy_name
    if (typeof cy_name !== 'string' || cy_name.trim().length === 0) {
        return handleResponse(res, 400, "cy_name must be a non-empty string");
    }

    if (cy_name.trim().length > 100) {
        return handleResponse(res, 400, "cy_name must be 100 characters or less");
    }

    try {
        const newCategory = await createCategoryService(
            Number(user_id),
            cy_name.trim()
        );
        handleResponse(res, 201, "Category created successfully", newCategory);
    } catch (err) {
        next(err);
    }
};

// Update category
export const updateCategory = async (req, res, next) => {
    const { cy_id } = req.params;
    const { user_id, cy_name } = req.body;

    // Validate cy_id
    if (isNaN(cy_id)) {
        return handleResponse(res, 400, "Invalid category ID. It must be a number.");
    }

    // Validate required fields
    if (!user_id || !cy_name) {
        return handleResponse(res, 400, "user_id and cy_name are required fields");
    }

    // Validate data types
    if (isNaN(user_id)) {
        return handleResponse(res, 400, "user_id must be a valid number");
    }

    // Validate cy_name
    if (typeof cy_name !== 'string' || cy_name.trim().length === 0) {
        return handleResponse(res, 400, "cy_name must be a non-empty string");
    }

    if (cy_name.trim().length > 100) {
        return handleResponse(res, 400, "cy_name must be 100 characters or less");
    }

    try {
        const updatedCategory = await updateCategoryService(
            Number(cy_id),
            Number(user_id),
            cy_name.trim()
        );
        if (!updatedCategory) return handleResponse(res, 404, "Category not found");
        handleResponse(res, 200, "Category updated successfully", updatedCategory);
    } catch (err) {
        next(err);
    }
};

export const deleteCategory = async (req, res, next) => {
    const { cy_id } = req.params;

    // Validate cy_id
    if (isNaN(cy_id)) {
        return handleResponse(res, 400, "Invalid category ID. It must be a number.");
    }

    try {
        const deletedCategory = await deleteCategoryService(Number(cy_id));

        if (!deletedCategory) {
            return handleResponse(res, 404, "Category not found");
        }

        handleResponse(res, 200, "Category deleted successfully", deletedCategory);
    } catch (err) {
        next(err);
    }
};


// Get categories by user ID
export const getCategoriesByUserId = async (req, res, next) => {
    const { user_id } = req.params;

    // Validate user_id
    if (isNaN(user_id)) {
        return handleResponse(res, 400, "Invalid user ID. It must be a number.");
    }

    try {
        const categories = await getCategoriesByUserIdService(Number(user_id));
        handleResponse(res, 200, "User categories fetched successfully", categories);
    } catch (err) {
        next(err);
    }
};
