import z from "zod";

export const createHotelSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  city: z.string().min(2),
  country: z.string().min(2),
  amenities: z.array(z.string().min(1)).min(1)
});