import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, ArrowRightLeft, QrCode, History, User } from "lucide-react";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Transfer", href: "/transfer", icon: ArrowRightLeft },
  { name: "QR Pay", href: "/qr", icon: QrCode },
  { name: "History", href: "/history", icon: History },
  { name: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-phantom-gray-200 px-4 py-2">
      <div className="flex items-center justify-around">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex flex-col items-center space-y-1 p-2 transition-colors",
                  isActive ? "text-phantom-green" : "text-phantom-gray-500"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
