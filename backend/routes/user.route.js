import { createUser, signInUser } from "../controllers/user.controller.js";
import express from "express";

const router = express.Router();

router.post("/add",createUser);
router.post("/signin", signInUser);


export default router;