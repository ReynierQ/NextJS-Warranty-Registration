import express from "express";
import { getFormConfig, updateFormConfig } from "../controllers/formConfigController.js";
import protectAdmin from "../middlewares/authMiddleware.js";

const router = express.Router();

// routes/formConfigRoutes.js
router.get("/public-config", getFormConfig); // no protectAdmin

router.get("/config", protectAdmin, getFormConfig);
router.put("/config", protectAdmin, updateFormConfig);

export default router;