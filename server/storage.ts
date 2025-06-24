import { users, transactions, savingsAccounts, referrals, type User, type InsertUser, type Transaction, type InsertTransaction, type SavingsAccount, type InsertSavingsAccount, type Referral, type InsertReferral } from "@shared/schema";
import { db } from "./db";
import { eq, or, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserBalance(id: number, walletBalance: string, savingsBalance?: string): Promise<User | undefined>;

  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  updateTransactionStatus(transactionId: string, status: string): Promise<Transaction | undefined>;

  // Savings operations
  getSavingsAccount(id: number): Promise<SavingsAccount | undefined>;
  getUserSavingsAccounts(userId: number): Promise<SavingsAccount[]>;
  createSavingsAccount(savingsAccount: InsertSavingsAccount): Promise<SavingsAccount>;
  updateSavingsAccount(id: number, updates: Partial<SavingsAccount>): Promise<SavingsAccount | undefined>;

  // Referral operations
  getReferral(id: number): Promise<Referral | undefined>;
  getUserReferrals(referrerId: number): Promise<Referral[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferral(id: number, updates: Partial<Referral>): Promise<Referral | undefined>;
}

// Keep MemStorage for potential fallback, but not used by default

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        phone: insertUser.phone ?? null,
        displayName: insertUser.displayName ?? null,
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserBalance(id: number, walletBalance: string, savingsBalance?: string): Promise<User | undefined> {
    const updateData: any = { walletBalance, updatedAt: new Date() };
    if (savingsBalance !== undefined) {
      updateData.savingsBalance = savingsBalance;
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.transactionId, transactionId));
    return transaction || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...insertTransaction,
        status: insertTransaction.status ?? 'pending',
        fee: insertTransaction.fee ?? '0.00',
        description: insertTransaction.description ?? null,
        metadata: insertTransaction.metadata ?? null,
        fromUserId: insertTransaction.fromUserId ?? null,
        toUserId: insertTransaction.toUserId ?? null,
      })
      .returning();
    return transaction;
  }

  async getUserTransactions(userId: number, limit = 50): Promise<Transaction[]> {
    const userTransactions = await db
      .select()
      .from(transactions)
      .where(or(eq(transactions.fromUserId, userId), eq(transactions.toUserId, userId)))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
    return userTransactions;
  }

  async updateTransactionStatus(transactionId: string, status: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.transactionId, transactionId))
      .returning();
    return transaction || undefined;
  }

  async getSavingsAccount(id: number): Promise<SavingsAccount | undefined> {
    const [account] = await db.select().from(savingsAccounts).where(eq(savingsAccounts.id, id));
    return account || undefined;
  }

  async getUserSavingsAccounts(userId: number): Promise<SavingsAccount[]> {
    const accounts = await db
      .select()
      .from(savingsAccounts)
      .where(eq(savingsAccounts.userId, userId))
      .orderBy(desc(savingsAccounts.createdAt));
    return accounts;
  }

  async createSavingsAccount(insertSavingsAccount: InsertSavingsAccount): Promise<SavingsAccount> {
    const [account] = await db
      .insert(savingsAccounts)
      .values({
        ...insertSavingsAccount,
        status: insertSavingsAccount.status ?? 'active',
      })
      .returning();
    return account;
  }

  async updateSavingsAccount(id: number, updates: Partial<SavingsAccount>): Promise<SavingsAccount | undefined> {
    const [account] = await db
      .update(savingsAccounts)
      .set(updates)
      .where(eq(savingsAccounts.id, id))
      .returning();
    return account || undefined;
  }

  async getReferral(id: number): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.id, id));
    return referral || undefined;
  }

  async getUserReferrals(referrerId: number): Promise<Referral[]> {
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, referrerId));
    return userReferrals;
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values({
        ...insertReferral,
        status: insertReferral.status ?? 'pending',
        earningsGenerated: insertReferral.earningsGenerated ?? '0.00',
      })
      .returning();
    return referral;
  }

  async updateReferral(id: number, updates: Partial<Referral>): Promise<Referral | undefined> {
    const [referral] = await db
      .update(referrals)
      .set(updates)
      .where(eq(referrals.id, id))
      .returning();
    return referral || undefined;
  }
}

export const storage = new DatabaseStorage();
