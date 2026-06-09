export type UserRole = "admin" | "instructor" | "student" | "support";
export type PaymentProvider = "piprapay" | "bkash" | "nagad" | "rocket";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  price_bdt: number;
  status: "draft" | "published" | "archived";
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_no: string;
  user_id: string;
  amount_bdt: number;
  status: PaymentStatus;
  provider: PaymentProvider;
  created_at: string;
}
