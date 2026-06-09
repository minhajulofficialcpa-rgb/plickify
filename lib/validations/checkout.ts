import { z } from "zod";

export const checkoutSchema = z.object({
  itemId: z.string().uuid(),
  itemType: z.enum(["course", "product"]),
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8).max(20),
  amount: z.number().positive(),
  paymentMethod: z.enum(["bkash", "nagad", "rocket"])
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;
