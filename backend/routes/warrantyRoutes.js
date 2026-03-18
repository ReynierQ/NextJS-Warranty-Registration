import express from "express";
import { registerWarranty, getWarranty } from "../controllers/warrantyController.js";
import { getWarranties, updateWarranty, deleteWarranty } from "../controllers/adminWarrantyControllers.js";

import protectAdmin from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";

const router = express.Router();

// Warranty registration (public)
router.post("/register", upload.single("receiptImage"), registerWarranty);

// Admin warranty management (protected)
router.get("/warranties", protectAdmin, getWarranties); // View + Search
router.get("/warranties/:id", protectAdmin, getWarranty); // Single warranty
router.put("/warranties/:id", protectAdmin, updateWarranty); // Edit
router.delete("/warranties/:id", protectAdmin, deleteWarranty); // Delete

export default router;
