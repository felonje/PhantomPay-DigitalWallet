import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { TransferModal } from "@/components/transfer-modal";

export default function Transfer() {
  const [showTransferModal, setShowTransferModal] = useState(false);

  return (
    <div className="min-h-screen bg-phantom-gray-50">
      <div className="lg:flex lg:min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:p-6">
          <div className="px-4 py-6 lg:px-0 lg:py-0">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Money</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Transfer functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileNav />
      <TransferModal 
        isOpen={showTransferModal} 
        onClose={() => setShowTransferModal(false)} 
      />
    </div>
  );
}
