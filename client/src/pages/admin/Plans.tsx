// src/pages/admin/Plans.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { planService } from "../../services/planService";
import type { Plan } from "../../services/planService";
import PlanForm from "../../components/admin/PlanForm";

export default function Plans() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ["plans"],
    queryFn: planService.getPlans,
  });

  if (error) {
    toast.error("Failed to load plans");
  }

  const createMutation = useMutation({
    mutationFn: planService.createPlan,
    onSuccess: () => {
      toast.success("Plan created successfully");
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      setShowForm(false); // close form after submit
    },
    onError: () => toast.error("Failed to create plan"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Plan }) =>
      planService.updatePlan(id, payload),
    onSuccess: () => {
      toast.success("Plan updated successfully");
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: () => toast.error("Failed to update plan"),
  });

  const deleteMutation = useMutation({
    mutationFn: planService.deletePlan,
    onSuccess: () => {
      toast.success("Plan deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: () => toast.error("Failed to delete plan"),
  });

  if (isLoading) return <p className="text-center py-4">Loading...</p>;

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center sm:text-left">
        Manage Plans
      </h1>

      {/* Available Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {plans?.map((plan) => (
          <div
            key={plan._id}
            className="p-4 border rounded-lg bg-white shadow-sm flex flex-col justify-between"
          >
            <div className="mb-3">
              <p className="font-semibold text-lg">{plan.name}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{plan.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {plan.roiRate}% {plan.roiInterval}, {plan.roiType}
              </p>
            </div>
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => {
                  const newName = prompt("Edit plan name:", plan.name);
                  if (newName) {
                    updateMutation.mutate({
                      id: plan._id!,
                      payload: { ...plan, name: newName },
                    });
                  }
                }}
                className="flex-1 px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteMutation.mutate(plan._id!)}
                className="flex-1 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Toggle Button */}
      <div className="flex justify-center sm:justify-start">
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition"
        >
          {showForm ? "Cancel" : "➕ Add New Plan"}
        </button>
      </div>

      {/* Drop-down form */}
      {showForm && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 shadow-inner">
          <h2 className="text-lg font-semibold mb-3">Create New Plan</h2>
          <PlanForm onSubmit={(data) => createMutation.mutate(data)} />
        </div>
      )}
    </div>
  );
}
