import express from 'express';
import {
    createBudget,
    getAllBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    getBudgetsByUserId,
    getBudgetByUserAndMonth,
    getBudgetWithSpending
} from '../controllers/budgetController.js';


const router = express.Router();

// CRUD routes for budgets
router.post('/', createBudget); 
router.get('/', getAllBudgets);
router.get('/user/:user_id', getBudgetsByUserId);
router.get('/user/:user_id/month/:b_mnth', getBudgetByUserAndMonth);
router.get('/user/:user_id/month/:b_mnth/summary', getBudgetWithSpending);
router.get('/:id', getBudgetById);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
