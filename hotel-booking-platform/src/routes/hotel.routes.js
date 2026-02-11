
import express from "express";
import { authMiddleware, ownerOnlyMiddle } from "../middlewares/middlewares.js";
import { createHotel } from "../controllers/hotel.controller.js";

const router = express.Router();

router.post("/", authMiddleware, ownerOnlyMiddle, createHotel);

export default router;