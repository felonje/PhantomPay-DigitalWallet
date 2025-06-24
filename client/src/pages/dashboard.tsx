import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { TransferModal } from "@/components/transfer-modal";
import { SavingsModal } from "@/components/savings-modal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/lib/auth";
import { ArrowUp, ArrowDown, Smartphone, PiggyBank, TrendingUp, Gift, Crown, Plus, Minus, ArrowRightLeft } from "lucide-react";

interface DashboardData {
  user: {
    id: number;
    displayName: string;
    email: string;
    walletBalance: string;
    savingsBalance: string;
    totalAssets: string;
    referralCount: number;
    referralEarnings: string;
    premiumStatus: boolean;
    totalEarnedInterest: string;
  };
  recentTransactions: Array<{
    id: number;
    transactionId: string;
    type: string;
    amount: string;
    fee: string;
    description: string;
    status: string;
    createdAt: string;
  }>;
  savingsAccounts: Array<{
    id: number;
    principal: string;
    currentBalance: string;
    lockPeriodMonths: number;
    annualInterestRate: string;
    startDate: string;
    maturityDate: string;
    status: string;
  }>;
}

export default function Dashboard() {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const { toast } = useToast();

  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/profile'],
    queryFn: async () => {
      const token = await getAuthToken();
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h1>
              <p className="text-gray-600">Please try refreshing the page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = dashboardData?.user;
  const recentTransactions = dashboardData?.recentTransactions || [];
  const savingsAccounts = dashboardData?.savingsAccounts || [];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDown className="h-5 w-5 text-green-600" />;
      case 'withdrawal':
        return <ArrowUp className="h-5 w-5 text-red-600" />;
      case 'transfer':
        return <ArrowRightLeft className="h-5 w-5 text-blue-600" />;
      case 'airtime':
        return <Smartphone className="h-5 w-5 text-orange-600" />;
      case 'savings_deposit':
        return <PiggyBank className="h-5 w-5 text-purple-600" />;
      default:
        return <ArrowRightLeft className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatAmount = (amount: string, type: string) => {
    const num = parseFloat(amount);
    const isIncoming = ['deposit', 'interest_earned'].includes(type);
    return `${isIncoming ? '+' : '-'}KES ${num.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateProgress = (startDate: string, maturityDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(maturityDate).getTime();
    const now = Date.now();
    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.displayName || 'User'}!</h1>
            <p className="text-blue-100">Manage your finances with confidence and ease.</p>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Wallet Balance Card */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm font-medium">Wallet Balance</p>
                  <h2 className="text-3xl font-bold">Ksh {parseFloat(user?.walletBalance || '0').toLocaleString()}</h2>
                  <p className="text-white/60 text-sm">Available for savings</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ArrowRightLeft className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Savings Card */}
          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm font-medium">Total Savings</p>
                  <h2 className="text-3xl font-bold">Ksh {parseFloat(user?.savingsBalance || '0').toLocaleString()}</h2>
                  <p className="text-white/60 text-sm">Earning interest</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <PiggyBank className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Savings Plans */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Savings Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">6%</div>
                <div className="text-sm text-gray-600 mb-2">Annual Interest</div>
                <div className="text-xs text-gray-500">1 Month</div>
                <div className="text-xs text-gray-400">KES 10,000 — Ksh 10,050</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">8%</div>
                <div className="text-sm text-gray-600 mb-2">Annual Interest</div>
                <div className="text-xs text-gray-500">3 Months</div>
                <div className="text-xs text-gray-400">KES 10,000 — Ksh 10,201.34</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">10%</div>
                <div className="text-sm text-gray-600 mb-2">Annual Interest</div>
                <div className="text-xs text-gray-500">6 Months</div>
                <div className="text-xs text-gray-400">KES 10,000 — Ksh 10,510.53</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">12%</div>
                <div className="text-sm text-gray-600 mb-2">Annual Interest</div>
                <div className="text-xs text-gray-500">12 Months</div>
                <div className="text-xs text-gray-400">KES 10,000 — Ksh 11,268.25</div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Start Saving</h3>
              <Button 
                onClick={() => setShowSavingsModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                + New Savings
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Savings Accounts</h3>
              
              {savingsAccounts.length > 0 ? (
                savingsAccounts.map((account) => (
                  <Card key={account.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{account.lockPeriodMonths} Month Savings</h4>
                          <p className="text-sm text-gray-600">{account.annualInterestRate}% Annual Interest</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                          Active
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Principal</p>
                          <p className="font-semibold">Ksh {parseFloat(account.principal).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Current Value</p>
                          <p className="font-semibold">Ksh {parseFloat(account.currentBalance).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Interest Earned</p>
                          <p className="font-semibold text-green-600">Ksh {(parseFloat(account.currentBalance) - parseFloat(account.principal)).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Matures On</p>
                          <p className="font-semibold">Sep 18, 2025</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center text-sm text-blue-600 mb-2">
                          <span>📅 89 days remaining until maturity</span>
                        </div>
                        <Progress value={calculateProgress(account.startDate, account.maturityDate)} className="h-2" />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button className="bg-green-600 hover:bg-green-700 text-white flex-1">
                          Withdraw at Maturity
                        </Button>
                        <Button variant="outline" className="text-red-600 border-red-200">
                          ⚠️ Early Withdrawal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No savings accounts yet. Start saving today!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
      />
      <SavingsModal
        isOpen={showSavingsModal}
        onClose={() => setShowSavingsModal(false)}
      />
    </div>
  );
}