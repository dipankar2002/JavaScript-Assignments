import { nanoid } from "nanoid";
import pool from "../db/db.js";
import { addRoomSchema, createHotelSchema } from "../zod/hotel.zod.js";

export const addRoomToHotel = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const ownerId = req.user.id;

        const { data, success, error } = addRoomSchema.safeParse(req.body);
        if(!success) {
            return res.status(400).json({
                "success": false,
                "data": null,
                "error": "INVALID_REQUEST"
            })
        }

        const hotelResult = await pool.query(
            "SELECT * FROM hotels WHERE id = $1",
            [hotelId]
        )
        if(hotelResult.rows.length === 0) {
            return res.status(404).json({
                "success": false,
                "data": null,
                "error": "HOTEL_NOT_FOUND"
            })
        }
        if(hotelResult.rows[0].owner_id !== ownerId) {
            return res.status(403).json({
                "success": false,
                "data": null,
                "error": "FORBIDDEN"
            })
        }

        const { roomNumber, roomType, pricePerNight, maxOccupancy } = data;
        const roomCheck = await pool.query(
            `SELECT id FROM rooms WHERE hotel_id = $1 AND room_number = $2`,
            [ hotelId, roomNumber ]
        )
        if(roomCheck.rows.length > 0) {
            return res.status(400).json({
                "success": false,
                "data": null,
                "error": "ROOM_ALREADY_EXISTS"
            })
        }
        const roomId = `rm_${nanoid(10)}`;
        const roomResult = await pool.query(
            `INSERT INTO rooms (id, hotel_id, room_number, room_type, price_per_night, max_occupancy) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [ roomId, hotelId, roomNumber, roomType, pricePerNight, maxOccupancy ]
        )
        return res.status(201).json({
            "success": true,
            "data": {
                id: roomResult.rows[0].id,
                hotelId: roomResult.rows[0].hotel_id,
                roomNumber: roomResult.rows[0].room_number,
                roomType: roomResult.rows[0].room_type,
                pricePerNight: roomResult.rows[0].price_per_night,
                maxOccupancy: roomResult.rows[0].max_occupancy,
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