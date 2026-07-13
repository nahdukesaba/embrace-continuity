import { z } from "zod";
import { diffMinutes } from "@/lib/format";

export const bookingSchema = z
  .object({
    resourceId: z.string().min(1, "Required"),
    date: z.string().min(1, "Required"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    numberOfDays: z.coerce.number().int().min(1).max(30).default(1),
    purpose: z.string().trim().min(3, "Please describe the purpose"),
  })
  .refine((v) => diffMinutes(v.startTime, v.endTime) > 0, {
    message: "End must be after start", path: ["endTime"],
  });
export type BookingValues = z.infer<typeof bookingSchema>;