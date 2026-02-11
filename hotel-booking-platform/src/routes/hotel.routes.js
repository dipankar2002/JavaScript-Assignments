
import express from "express";
import { authMiddleware, ownerOnlyMiddle } from "../middlewares/middlewares.js";
import { addRoomToHotel, createHotel } from "../controllers/hotel.controller.js";

const router = express.Router();

router.post("/", authMiddleware, ownerOnlyMiddle, createHotel);
router.post("/:hotelId/rooms", authMiddleware, ownerOnlyMiddle, addRoomToHotel);

export default router;