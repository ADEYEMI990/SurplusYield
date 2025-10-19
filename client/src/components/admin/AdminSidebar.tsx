// src/components/admin/AdminSidebar.tsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  CreditCard,
  Users,
  Gift,
  FileText,
  List,
  AlignJustify,
  Settings,
  X,
  IdCard,
  ClipboardList,
  Wallet,
  PlusCircle
} from "lucide-react";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Plans", to: "/admin/plans", icon: Layers },
  { label: "Transactions", to: "/admin/transactions", icon: CreditCard },
  { label: "Referrals", to: "/admin/referrals", icon: Users },
  { label: "Rewards", to: "/admin/rewards", icon: Gift },
  { label: "Site Pages", to: "/admin/site/pages", icon: FileText },
  { label: "Navigation", to: "/admin/site/navigation", icon: List },
  { label: "Footer", to: "/admin/site/footer", icon: AlignJustify },
  { label: "Settings", to: "/admin/settings", icon: Settings },
  { label: "Create KYC", to: "/admin/create-kyc", icon: IdCard },
  { label: "All Kyc", to: "/admin/kyc", icon: ClipboardList },
  { label: "Deposit Wallet", to: "/admin/wallet", icon: Wallet },
  { label: "Withdraw Wallet", to: "/admin/withdraw-wallet", icon: Wallet },
  { label: "Create Spotlight", to: "/admin/create", icon: PlusCircle },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}
export default function AdminSidebar({ open, setOpen }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-blue-800 text-white flex-col p-4 overflow-y-auto">
        <h1 className="text-lg font-bold mb-6">Admin Panel</h1>
        <nav className="flex flex-col gap-2">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-blue-700 hover:text-white"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-30 md:hidden transition-all duration-300 ease-in-out ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {/* Background overlay */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* Sliding panel */}
        <aside
          className={`absolute top-0 left-0 h-full w-64 bg-blue-800 text-white p-4 transform transition-transform duration-300 ease-in-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-md hover:bg-blue-700"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-blue-700 hover:text-white"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}