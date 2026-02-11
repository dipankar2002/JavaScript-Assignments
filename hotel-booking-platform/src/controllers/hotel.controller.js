import { nanoid } from "nanoid";
import pool from "../db/db.js";
import { createHotelSchema } from "../zod/hotel.zod.js";

export const createHotel = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { data, success, error } = createHotelSchema.safeParse(req.body);
        if(!success) {
            return res.status(400).json({
                "success": false,
                "data": null,
                "error": "INVALID_REQUEST"
            })
        }
        const { name, description, city, country, amenities } = data;
        const hotelId = `hotl_${nanoid(10)}`;
        const hotelResult = await pool.query(
            `INSERT INTO hotels (id, owner_id, name, description, city, country, amenities) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [ hotelId, ownerId, name, description, city, country, JSON.stringify(amenities) ]
        );

        return res.status(201).json({
            "success": true,
            "data": {
                id: hotelId,
                ownerId,
                name,
                description,
                city,
                country,
                amenities,
                rating: hotelResult.rows[0].rating,
                totalReviews: hotelResult.rows[0].total_reviews
            },
            "error": null
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
}