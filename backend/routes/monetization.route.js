import { Router } from "express";
import {
  deleteMonthlyCost,
  getMonetization,
  saveMonthlyCost,
  setUserPlan,
  updateFeatureLimit,
} from "../controllers/monetization.controller.js";
import { verifyToken } from "../middlewares/verifyUser.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";

const router = Router();

router.use(["/monetization", "/limits", "/plans", "/costs"], verifyToken, verifyAdmin);

router.get("/monetization", getMonetization);
router.put("/limits/:key", updateFeatureLimit);
router.put("/plans", setUserPlan);
router.put("/costs", saveMonthlyCost);
router.delete("/costs/:id", deleteMonthlyCost);

export default router;
