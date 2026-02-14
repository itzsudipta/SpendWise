import express from "express";
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserBankBalance
} from "../controllers/userController.js";

const router = express.Router();


router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.patch("/:id/bank-balance", updateUserBankBalance);
router.delete("/:id", deleteUser);

export default router; 
