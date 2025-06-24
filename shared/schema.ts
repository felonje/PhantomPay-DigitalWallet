import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  displayName: text("display_name"),
  walletBalance: decimal("wallet_balance", { precision: 12, scale: 2 }).notNull().default('0.00'),
  savingsBalance: decimal("savings_balance", { precision: 12, scale: 2 }).notNull().default('0.00'),
  totalEarnedInterest: decimal("total_earned_interest", { precision: 12, scale: 2 }).notNull().default('0.00'),
  referralCount: integer("referral_count").notNull().default(0),
  referralEarnings: decimal("referral_earnings", { precision: 12, scale: 2 }).notNull().default('0.00'),
  premiumStatus: boolean("premium_status").notNull().default(false),
  kycVerified: boolean("kyc_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  fromUserId: integer("from_user_id").references(() => users.id),
  toUserId: integer("to_user_id").references(() => users.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  fee: decimal("fee", { precision: 12, scale: 2 }).notNull().default('0.00'),
  type: text("type").notNull(), // 'p2p', 'deposit', 'withdrawal', 'airtime', 'merchant_qr', 'scheduled', 'savings_deposit', 'savings_withdrawal', 'interest_earned'
  status: text("status").notNull().default('pending'), // 'pending', 'success', 'failed'
  description: text("description"),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const savingsAccounts = pgTable("savings_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  principal: decimal("principal", { precision: 12, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).notNull(),
  lockPeriodMonths: integer("lock_period_months").notNull(),
  annualInterestRate: decimal("annual_interest_rate", { precision: 5, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  maturityDate: timestamp("maturity_date").notNull(),
  status: text("status").notNull().default('active'), // 'active', 'matured', 'withdrawn_early'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  referredUserId: integer("referred_user_id").notNull().references(() => users.id),
  status: text("status").notNull().default('pending'), // 'pending', 'completed'
  earningsGenerated: decimal("earnings_generated", { precision: 12, scale: 2 }).notNull().default('0.00'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertSavingsAccountSchema = createInsertSchema(savingsAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertSavingsAccount = z.infer<typeof insertSavingsAccountSchema>;
export type SavingsAccount = typeof savingsAccounts.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// Extended schemas for API validation
export const transferSchema = z.object({
  toUserId: z.number().int().positive(),
  amount: z.number().positive(),
  description: z.string().optional(),
});

export const depositSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(['mpesa', 'bank', 'card']),
});

export const withdrawalSchema = z.object({
  amount: z.number().positive(),
  destination: z.enum(['mpesa', 'bank']),
  accountDetails: z.string(),
});

export const savingsDepositSchema = z.object({
  amount: z.number().positive(),
  lockPeriodMonths: z.enum([1, 3, 6, 12]),
});

export const airtimeSchema = z.object({
  amount: z.number().positive(),
  phoneNumber: z.string().min(10),
  provider: z.enum(['safaricom', 'airtel', 'telkom']),
});

export type TransferRequest = z.infer<typeof transferSchema>;
export type DepositRequest = z.infer<typeof depositSchema>;
export type WithdrawalRequest = z.infer<typeof withdrawalSchema>;
export type SavingsDepositRequest = z.infer<typeof savingsDepositSchema>;
export type AirtimeRequest = z.infer<typeof airtimeSchema>;
