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

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
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
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
