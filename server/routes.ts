import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  transferSchema, 
  depositSchema, 
  withdrawalSchema, 
  savingsDepositSchema, 
  airtimeSchema,
  insertUserSchema 
} from "@shared/schema";
import { nanoid } from "nanoid";

// Fee calculation engine
function calculateTransactionFee(amount: number, transactionType: string): number {
  const feeTable = {
    'p2p_low': { percent: 0.01, fixed: 2, cap: 10 },
    'p2p_mid': { percent: 0.0075, fixed: 5, cap: 25 },
    'p2p_high': { percent: 0.005, fixed: 10, cap: 100 },
    'withdrawal': { percent: 0.015, fixed: 20, cap: 250 },
    'merchant_qr': { percent: 0.0075, fixed: 5, cap: 50 },
    'scheduled': { percent: 0.005, fixed: 0, cap: null }
  };

  let rule;
  if (transactionType === 'p2p') {
    if (amount <= 500) {
      rule = feeTable.p2p_low;
    } else if (amount <= 5000) {
      rule = feeTable.p2p_mid;
    } else {
      rule = feeTable.p2p_high;
    }
  } else {
    rule = feeTable[transactionType as keyof typeof feeTable];
  }

  if (!rule) return 0;

  let fee = (amount * rule.percent) + rule.fixed;
  if (rule.cap && fee > rule.cap) {
    fee = rule.cap;
  }

  return Math.round(fee * 100) / 100;
}

// Savings calculation
function calculateSavingsReturn(principal: number, months: number, annualRate: number) {
  const monthlyRate = annualRate / 12 / 100;
  const total = principal * Math.pow(1 + monthlyRate, months);
  const earnedInterest = total - principal;
  return {
    total: Math.round(total * 100) / 100,
    interest: Math.round(earnedInterest * 100) / 100
  };
}

// Get interest rate based on lock period
function getInterestRate(lockPeriodMonths: number): number {
  switch (lockPeriodMonths) {
    case 1: return 6;
    case 3: return 8;
    case 6: return 10;
    case 12: return 12;
    default: return 6;
  }
}

// Mock Firebase Admin SDK verification (in production, use actual Firebase Admin SDK)
function verifyFirebaseToken(token: string): { uid: string; email?: string; name?: string } | null {
  if (!token) return null;
  // In production, verify with Firebase Admin SDK
  // For now, mock verification
  return {
    uid: 'mock-firebase-uid-' + Math.random().toString(36).substr(2, 9),
    email: 'user@example.com',
    name: 'Mock User'
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to verify Firebase token
  const authenticateUser = async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const decodedToken = verifyFirebaseToken(token);
      
      if (!decodedToken) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get or create user
      let user = await storage.getUserByFirebaseUid(decodedToken.uid);
      if (!user) {
        user = await storage.createUser({
          firebaseUid: decodedToken.uid,
          email: decodedToken.email || '',
          displayName: decodedToken.name || '',
          phone: null,
          walletBalance: '0.00',
          savingsBalance: '0.00',
          totalEarnedInterest: '0.00',
          referralCount: 0,
          referralEarnings: '0.00',
          premiumStatus: false,
          kycVerified: false,
        });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };

  // Get user profile and dashboard data
  app.get('/api/profile', authenticateUser, async (req: any, res) => {
    try {
      const user = req.user;
      const recentTransactions = await storage.getUserTransactions(user.id, 10);
      const savingsAccounts = await storage.getUserSavingsAccounts(user.id);
      const referrals = await storage.getUserReferrals(user.id);

      const totalAssets = parseFloat(user.walletBalance) + parseFloat(user.savingsBalance);

      res.json({
        user: {
          ...user,
          totalAssets: totalAssets.toFixed(2)
        },
        recentTransactions,
        savingsAccounts,
        referrals
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get current balance
  app.get('/api/balance', authenticateUser, async (req: any, res) => {
    try {
      const user = req.user;
      res.json({
        walletBalance: user.walletBalance,
        savingsBalance: user.savingsBalance,
        totalAssets: (parseFloat(user.walletBalance) + parseFloat(user.savingsBalance)).toFixed(2)
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Process P2P transfer
  app.post('/api/transfer', authenticateUser, async (req: any, res) => {
    try {
      const validatedData = transferSchema.parse(req.body);
      const fromUser = req.user;
      const toUser = await storage.getUser(validatedData.toUserId);

      if (!toUser) {
        return res.status(400).json({ message: 'Recipient not found' });
      }

      const fee = calculateTransactionFee(validatedData.amount, 'p2p');
      const totalAmount = validatedData.amount + fee;

      if (parseFloat(fromUser.walletBalance) < totalAmount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      const transactionId = nanoid();

      // Create transaction record
      const transaction = await storage.createTransaction({
        transactionId,
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        amount: validatedData.amount.toString(),
        fee: fee.toString(),
        type: 'p2p',
        status: 'success',
        description: validatedData.description || `Transfer to ${toUser.displayName || toUser.email}`,
        metadata: null,
      });

      // Update balances
      const newFromBalance = (parseFloat(fromUser.walletBalance) - totalAmount).toFixed(2);
      const newToBalance = (parseFloat(toUser.walletBalance) + validatedData.amount).toFixed(2);

      await storage.updateUserBalance(fromUser.id, newFromBalance);
      await storage.updateUserBalance(toUser.id, newToBalance);

      res.json({
        transaction,
        newBalance: newFromBalance
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid transfer data' });
    }
  });

  // Process deposit
  app.post('/api/deposit', authenticateUser, async (req: any, res) => {
    try {
      const validatedData = depositSchema.parse(req.body);
      const user = req.user;

      const transactionId = nanoid();

      // Create transaction record (deposits are free)
      const transaction = await storage.createTransaction({
        transactionId,
        fromUserId: null,
        toUserId: user.id,
        amount: validatedData.amount.toString(),
        fee: '0.00',
        type: 'deposit',
        status: 'success',
        description: `Deposit via ${validatedData.method.toUpperCase()}`,
        metadata: JSON.stringify({ method: validatedData.method }),
      });

      // Update balance
      const newBalance = (parseFloat(user.walletBalance) + validatedData.amount).toFixed(2);
      await storage.updateUserBalance(user.id, newBalance);

      res.json({
        transaction,
        newBalance
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid deposit data' });
    }
  });

  // Process withdrawal
  app.post('/api/withdraw', authenticateUser, async (req: any, res) => {
    try {
      const validatedData = withdrawalSchema.parse(req.body);
      const user = req.user;

      const fee = calculateTransactionFee(validatedData.amount, 'withdrawal');
      const totalAmount = validatedData.amount + fee;

      if (parseFloat(user.walletBalance) < totalAmount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      const transactionId = nanoid();

      // Create transaction record
      const transaction = await storage.createTransaction({
        transactionId,
        fromUserId: user.id,
        toUserId: null,
        amount: validatedData.amount.toString(),
        fee: fee.toString(),
        type: 'withdrawal',
        status: 'success',
        description: `Withdrawal to ${validatedData.destination.toUpperCase()}`,
        metadata: JSON.stringify({ 
          destination: validatedData.destination,
          accountDetails: validatedData.accountDetails 
        }),
      });

      // Update balance
      const newBalance = (parseFloat(user.walletBalance) - totalAmount).toFixed(2);
      await storage.updateUserBalance(user.id, newBalance);

      res.json({
        transaction,
        newBalance,
        netAmount: validatedData.amount
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid withdrawal data' });
    }
  });

  // Create savings account
  app.post('/api/savings', authenticateUser, async (req: any, res) => {
    try {
      const validatedData = savingsDepositSchema.parse(req.body);
      const user = req.user;

      if (validatedData.amount < 500) {
        return res.status(400).json({ message: 'Minimum savings deposit is KES 500' });
      }

      if (parseFloat(user.walletBalance) < validatedData.amount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      const annualInterestRate = getInterestRate(validatedData.lockPeriodMonths);
      const startDate = new Date();
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + validatedData.lockPeriodMonths);

      // Create transaction record
      const transactionId = nanoid();
      const transaction = await storage.createTransaction({
        transactionId,
        fromUserId: user.id,
        toUserId: user.id,
        amount: validatedData.amount.toString(),
        fee: '0.00',
        type: 'savings_deposit',
        status: 'success',
        description: `Savings deposit - ${validatedData.lockPeriodMonths} month lock`,
        metadata: JSON.stringify({ lockPeriodMonths: validatedData.lockPeriodMonths }),
      });

      // Create savings account
      const savingsAccount = await storage.createSavingsAccount({
        userId: user.id,
        principal: validatedData.amount.toString(),
        currentBalance: validatedData.amount.toString(),
        lockPeriodMonths: validatedData.lockPeriodMonths,
        annualInterestRate: annualInterestRate.toString(),
        startDate,
        maturityDate,
        status: 'active',
      });

      // Update user balances
      const newWalletBalance = (parseFloat(user.walletBalance) - validatedData.amount).toFixed(2);
      const newSavingsBalance = (parseFloat(user.savingsBalance) + validatedData.amount).toFixed(2);
      await storage.updateUserBalance(user.id, newWalletBalance, newSavingsBalance);

      const expectedReturn = calculateSavingsReturn(validatedData.amount, validatedData.lockPeriodMonths, annualInterestRate);

      res.json({
        transaction,
        savingsAccount,
        expectedReturn,
        newWalletBalance,
        newSavingsBalance
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid savings data' });
    }
  });

  // Purchase airtime
  app.post('/api/airtime', authenticateUser, async (req: any, res) => {
    try {
      const validatedData = airtimeSchema.parse(req.body);
      const user = req.user;

      if (parseFloat(user.walletBalance) < validatedData.amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      const transactionId = nanoid();

      // Create transaction record (airtime purchases are free)
      const transaction = await storage.createTransaction({
        transactionId,
        fromUserId: user.id,
        toUserId: null,
        amount: validatedData.amount.toString(),
        fee: '0.00',
        type: 'airtime',
        status: 'success',
        description: `Airtime for ${validatedData.phoneNumber}`,
        metadata: JSON.stringify({ 
          phoneNumber: validatedData.phoneNumber,
          provider: validatedData.provider 
        }),
      });

      // Update balance
      const newBalance = (parseFloat(user.walletBalance) - validatedData.amount).toFixed(2);
      await storage.updateUserBalance(user.id, newBalance);

      res.json({
        transaction,
        newBalance
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid airtime data' });
    }
  });

  // Get transaction history
  app.get('/api/transactions', authenticateUser, async (req: any, res) => {
    try {
      const user = req.user;
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getUserTransactions(user.id, limit);

      res.json({ transactions });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Calculate fee for a transaction
  app.post('/api/calculate-fee', authenticateUser, async (req, res) => {
    try {
      const { amount, type } = req.body;
      const fee = calculateTransactionFee(amount, type);
      
      res.json({
        amount,
        fee,
        total: amount + fee
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid fee calculation data' });
    }
  });

  // Get user's QR code data
  app.get('/api/qr-code', authenticateUser, async (req: any, res) => {
    try {
      const user = req.user;
      const qrData = {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        type: 'payment_request'
      };

      res.json({ qrData: JSON.stringify(qrData) });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
