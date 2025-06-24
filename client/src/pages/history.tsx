import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default function History() {
  return (
    <div className="min-h-screen bg-phantom-gray-50">
      <div className="lg:flex lg:min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:p-6">
          <div className="px-4 py-6 lg:px-0 lg:py-0">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Transaction history will be implemented here.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
