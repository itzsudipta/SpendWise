import express from "express";
import {
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpensesByUserId,
    getExpensesByCategory,
    getExpensesWithDetails
} from "../controllers/expenseController.js";

const router = express.Router();

// Basic CRUD routes
router.get("/", getAllExpenses);                    
router.get("/:id", getExpenseById);                 
router.post("/", createExpense);                    
router.put("/:id", updateExpense);                 
router.delete("/:id", deleteExpense);               

// Additional specialized routes
router.get("/user/:user_id", getExpensesByUserId);  
router.get("/category/:cy_id", getExpensesByCategory); 
router.get("/details/all", getExpensesWithDetails); 

export default router;