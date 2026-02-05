
import jwt from "jsonwebtoken";

export const createTocken = (userData) => {
    return jwt.sign({ email: userData }, process.env.JWT_SECRET, { expiresIn: '7d' });
};