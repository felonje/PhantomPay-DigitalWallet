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
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/lib/auth";
import { X } from "lucide-react";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [fee, setFee] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const transferMutation = useMutation({
    mutationFn: async (transferData: { toUserId: number; amount: number; description?: string }) => {
      const token = await getAuthToken();
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(transferData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Transfer failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transfer Successful",
        description: "Money has been sent successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateFeeMutation = useMutation({
    mutationFn: async (data: { amount: number; type: string }) => {
      const token = await getAuthToken();
      const response = await fetch('/api/calculate-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Fee calculation failed');
      return response.json();
    },
    onSuccess: (data) => {
      setFee(data.fee);
    },
  });

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numValue = parseFloat(value);
    if (numValue > 0) {
      calculateFeeMutation.mutate({ amount: numValue, type: 'p2p' });
    } else {
      setFee(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    const userIdNum = parseInt(toUserId);

    if (!userIdNum || amountNum <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid recipient and amount",
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate({
      toUserId: userIdNum,
      amount: amountNum,
      description: description || undefined,
    });
  };

  const resetForm = () => {
    setToUserId("");
    setAmount("");
    setDescription("");
    setFee(0);
  };

  const totalAmount = parseFloat(amount) + fee || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Send Money
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient Selection */}
          <div>
            <Label htmlFor="recipient">Send to (User ID)</Label>
            <div className="relative">
              <Input
                id="recipient"
                type="number"
                placeholder="Enter recipient user ID"
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
                required
              />
              <div className="absolute right-3 top-3">
                <span>👤</span>
              </div>
            </div>
            <p className="text-xs text-phantom-gray-500 mt-1">
              In production, this would search by phone/email
            </p>
          </div>
          
          {/* Amount Input */}
          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="text-right text-xl font-semibold pr-4"
                required
              />
              <div className="absolute left-3 top-3 text-phantom-gray-500 font-medium">KES</div>
            </div>
          </div>
          
          {/* Fee Display */}
          {amount && parseFloat(amount) > 0 && (
            <div className="p-4 bg-phantom-gray-50 rounded-xl">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-phantom-gray-600">Amount</span>
                <span className="font-medium">KES {parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-phantom-gray-600">Transaction Fee</span>
                <span className="font-medium text-phantom-orange">KES {fee.toLocaleString()}</span>
              </div>
              <div className="border-t border-phantom-gray-200 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-phantom-gray-900">Total</span>
                  <span className="font-bold text-phantom-gray-900">KES {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Message */}
          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="What's this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={transferMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-phantom-green hover:bg-phantom-green/90"
              disabled={transferMutation.isPending || !amount || !toUserId}
            >
              {transferMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                "Send Money"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
