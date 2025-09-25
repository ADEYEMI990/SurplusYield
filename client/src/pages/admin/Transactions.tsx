// src/pages/admin/Transactions.tsx
import AdminTransactions from "../../components/admin/Transactions";
export default function Transactions() {
  return (
    <div className="p-6 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center sm:text-left">Transactions Management</h1>
      <AdminTransactions />
    </div>
  );
}