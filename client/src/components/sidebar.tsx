import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { 
  Home, 
  ArrowRightLeft, 
  PiggyBank, 
  History, 
  Smartphone, 
  QrCode, 
  Users, 
  Settings,
  LogOut
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Transfers", href: "/transfer", icon: ArrowRightLeft },
  { name: "Savings", href: "/savings", icon: PiggyBank },
  { name: "History", href: "/history", icon: History },
  { name: "Airtime", href: "/airtime", icon: Smartphone },
  { name: "QR Payments", href: "/qr", icon: QrCode },
  { name: "Referrals", href: "/referrals", icon: Users },
];

export function Sidebar() {
  const [location] = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:shadow-sm">
      <div className="p-6 border-b border-phantom-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-phantom-green rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">👻</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-phantom-gray-900">PhantomPay</h1>
            <p className="text-sm text-phantom-gray-500">Digital Wallet</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-phantom-green text-white"
                    : "text-phantom-gray-700 hover:bg-phantom-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-phantom-gray-200 space-y-2">
        <Link href="/settings">
          <a className="flex items-center space-x-3 px-3 py-2 rounded-lg text-phantom-gray-700 hover:bg-phantom-gray-100">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </a>
        </Link>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start px-3 py-2 text-phantom-gray-700 hover:bg-phantom-gray-100"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
