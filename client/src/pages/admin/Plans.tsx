// client/src/pages/admin/Plans.tsx
import { useEffect, useState } from "react";
import API from "../../lib/api";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import PlanForm from "../../components/admin/PlanForm";
import { toast } from "react-toastify";
import type { Plan } from "../../types/plan";

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Plan | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      const { data } = await API.get("/plans");
      setPlans(data);
    } catch {
      toast.error("Error loading plans");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEdit = (plan: Plan) => {
    setEditData(plan);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      await API.delete(`/plans/${id}`);
      toast.success("Plan deleted successfully");
      fetchPlans();
    } catch {
      toast.error("Error deleting plan");
    }
  };

  const handleToggleStatus = async (plan: Plan) => {
    if (!plan._id) return;
    const newStatus = plan.status === "active" ? "deactivated" : "active";
    setLoadingId(plan._id);

    try {
      await API.put(`/plans/${plan._id}`, { status: newStatus });
      toast.success(`Plan ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
      fetchPlans();
    } catch {
      toast.error("Error updating plan status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditData(null);
    fetchPlans();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Investment Plans</h1>
        <Button
          onClick={() => {
            setEditData(null);
            setShowForm((prev) => !prev);
          }}
        >
          {showForm ? "Close Form" : "Create New Plan"}
        </Button>
      </div>

      {/* === FORM SECTION === */}
      {showForm && (
        <div className="transition-all duration-300 mt-4 border-t pt-4">
          <PlanForm
            mode={editData ? "edit" : "create"}
            initialData={editData || undefined}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* === TABLE SECTION === */}
      <Table
        data={plans}
        columns={[
          {
            key: "icon",
            header: "Plan Icon",
            render: (plan) =>
              plan.icon ? (
                <img
                  src={plan.icon}
                  alt={plan.name}
                  className="w-10 h-10 rounded-full border object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                  N/A
                </div>
              ),
          },
          {
            key: "name",
            header: "Plan Name",
            render: (plan) => <p className="font-medium">{plan.name}</p>,
          },
          {
            key: "badge",
            header: "Badge",
            render: (plan) => (
              <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                {plan.badge}
              </span>
            ),
          },
          {
            key: "planType",
            header: "Type",
            render: (plan) => (
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  plan.planType === "fixed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {plan.planType.toUpperCase()}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (plan) => (
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  plan.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {plan.status.toUpperCase()}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Action",
            render: (plan) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEdit(plan)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => plan._id && handleDelete(plan._id)}
                >
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant={plan.status === "active" ? "outline" : "primary"}
                  loading={loadingId === plan._id}
                  onClick={() => handleToggleStatus(plan)}
                >
                  {plan.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              </div>
            ),
          },
        ]}
        pageSize={8}
      />
    </div>
  );
}