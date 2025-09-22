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
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col p-4">
      <h1 className="text-lg font-bold mb-6">Admin Panel</h1>
      <nav className="flex flex-col gap-2">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}