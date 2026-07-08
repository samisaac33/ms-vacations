import { z } from "zod";

export const bookingRequestSchema = z.object({
  propertySlug: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(30),
  guestName: z.string().min(2).max(120),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(8).max(30),
  paymentMethodId: z.enum(["transferencia", "paypal", "payphone", "efectivo"]),
  notes: z.string().max(500).optional(),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

export interface StoredBooking extends BookingRequestInput {
  id: string;
  propertyName: string;
  total: number;
  deposit: number;
  currency: "USD";
  status: "pending";
  createdAt: string;
}

const bookings: StoredBooking[] = [];

export function createBooking(
  input: BookingRequestInput,
  meta: { propertyName: string; total: number; deposit: number },
): StoredBooking {
  const booking: StoredBooking = {
    ...input,
    id: `MS-${Date.now().toString(36).toUpperCase()}`,
    propertyName: meta.propertyName,
    total: meta.total,
    deposit: meta.deposit,
    currency: "USD",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  return booking;
}

export function listBookings() {
  return bookings;
}
