import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Plans from "./pages/admin/Plans";
import Transactions from "./pages/admin/Transactions";
import Referrals from "./pages/admin/Referrals";
import Rewards from "./pages/admin/Rewards";
import SitePages from "./pages/admin/SitePages";
import SiteNavigation from "./pages/admin/SiteNavigation";
import SiteFooter from "./pages/admin/SiteFooter";
import Settings from "./pages/admin/Settings";
import { queryClient } from "./services/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import AdminProtected from "./routes/AdminProtected";
import AdminLogin from "./pages/admin/AdminLogin";
import LoginUser from "./pages/user/LoginUser";
import SignupUser from "./pages/user/SignupUser";
import UserLayout from "./layouts/UserLayout";
import UserProtected from "./routes/UserProtected";
import UserDashboardPage from "./pages/user/UserDashboard";
import DepositPage from "./components/user/Deposit";
import PlansPage from "./pages/user/Plans";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public admin login */}
          <Route path="/auth/login-admin" element={<AdminLogin />} />
          {/* Protected Admin routes */}
          <Route path="/admin" element={<AdminProtected />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="plans" element={<Plans />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="referrals" element={<Referrals />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="site/pages" element={<SitePages />} />
              <Route path="site/navigation" element={<SiteNavigation />} />
              <Route path="site/footer" element={<SiteFooter />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* User auth */}
          <Route path="/auth/login" element={<LoginUser />} />
          <Route path="/auth/register" element={<SignupUser />} />
          {/* Protected User routes */}
          <Route path="/user" element={<UserProtected />}>
            <Route element={<UserLayout />}>
              <Route path="dashboard" element={<UserDashboardPage />} />
              <Route path="deposit" element={<DepositPage />} />
              <Route path="plans" element={<PlansPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
