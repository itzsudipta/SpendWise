import express from "express"

import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByUserId
} from "../controllers/categoryCotroller.js";

const router = express.Router();

router.get("/", getAllCategories); 
router.get("/user/:user_id", getCategoriesByUserId); 
router.get("/:cy_id", getCategoryById); 
router.post("/", createCategory); 
router.put("/:cy_id", updateCategory); 
router.delete("/:cy_id", deleteCategory); 

export default router;
