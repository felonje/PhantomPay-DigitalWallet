import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/lib/auth";
import { X, PiggyBank } from "lucide-react";

interface SavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const lockPeriods = [
  { months: 1, rate: 6, label: "1 Month" },
  { months: 3, rate: 8, label: "3 Months" },
  { months: 6, rate: 10, label: "6 Months" },
  { months: 12, rate: 12, label: "12 Months" },
];

export function SavingsModal({ isOpen, onClose }: SavingsModalProps) {
  const [amount, setAmount] = useState("");
  const [lockPeriod, setLockPeriod] = useState("6");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const savingsMutation = useMutation({
    mutationFn: async (savingsData: { amount: number; lockPeriodMonths: number }) => {
      const token = await getAuthToken();
      const response = await fetch('/api/savings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(savingsData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Savings deposit failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Savings Account Created",
        description: `Successfully deposited KES ${parseFloat(amount).toLocaleString()} into savings!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Savings Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    const lockPeriodNum = parseInt(lockPeriod);

    if (amountNum < 500) {
      toast({
        title: "Minimum Amount Required",
        description: "Minimum savings deposit is KES 500",
        variant: "destructive",
      });
      return;
    }

    savingsMutation.mutate({
      amount: amountNum,
      lockPeriodMonths: lockPeriodNum,
    });
  };

  const resetForm = () => {
    setAmount("");
    setLockPeriod("6");
  };

  const selectedPeriod = lockPeriods.find(p => p.months.toString() === lockPeriod);
  const amountNum = parseFloat(amount) || 0;
  const expectedReturn = selectedPeriod ? 
    amountNum * (1 + selectedPeriod.rate / 100 * selectedPeriod.months / 12) : 0;
  const interest = expectedReturn - amountNum;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PiggyBank className="h-5 w-5 text-phantom-green" />
              <span>Start Savings</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div>
            <Label htmlFor="savings-amount">Amount to Save</Label>
            <div className="relative">
              <Input
                id="savings-amount"
                type="number"
                step="0.01"
                placeholder="500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-right text-xl font-semibold pr-4"
                required
                min="500"
              />
              <div className="absolute left-3 top-3 text-phantom-gray-500 font-medium">KES</div>
            </div>
            <p className="text-xs text-phantom-gray-500 mt-1">Minimum deposit: KES 500</p>
          </div>
          
          {/* Lock Period Selection */}
          <div>
            <Label>Lock Period</Label>
            <RadioGroup value={lockPeriod} onValueChange={setLockPeriod} className="mt-2">
              <div className="grid grid-cols-2 gap-3">
                {lockPeriods.map((period) => (
                  <div key={period.months} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={period.months.toString()} 
                      id={`period-${period.months}`}
                    />
                    <Label 
                      htmlFor={`period-${period.months}`}
                      className="flex-1 cursor-pointer p-3 rounded-lg border border-phantom-gray-200 hover:border-phantom-green"
                    >
                      <div className="font-medium">{period.label}</div>
                      <div className="text-sm text-phantom-green font-semibold">{period.rate}% APY</div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
          
          {/* Projection Display */}
          {amount && parseFloat(amount) >= 500 && selectedPeriod && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
              <h4 className="font-medium text-phantom-gray-900 mb-3">Savings Projection</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-phantom-gray-600">Principal Amount</span>
                  <span className="font-medium">KES {amountNum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-phantom-gray-600">Lock Period</span>
                  <span className="font-medium">{selectedPeriod.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-phantom-gray-600">Interest Rate</span>
                  <span className="font-medium text-phantom-green">{selectedPeriod.rate}% APY</span>
                </div>
                <div className="border-t border-green-200 pt-2">
                  <div className="flex justify-between">
                    <span className="text-phantom-gray-600">Expected Interest</span>
                    <span className="font-medium text-phantom-green">+KES {interest.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-phantom-gray-900">Total at Maturity</span>
                    <span className="text-phantom-green">KES {expectedReturn.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Warning */}
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Early Withdrawal Penalty:</strong> 5% of principal amount if withdrawn before maturity date.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={savingsMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-phantom-green hover:bg-phantom-green/90"
              disabled={savingsMutation.isPending || !amount || parseFloat(amount) < 500}
            >
              {savingsMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                "Create Savings"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
