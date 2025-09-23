// client/src/components/admin/Planform.tsx
import { useForm } from "react-hook-form";
import type { Plan } from "../../services/planService";

interface PlanFormProps {
  initialData?: Plan;
  onSubmit: (data: Plan) => void;
}

export default function PlanForm({ initialData, onSubmit }: PlanFormProps) {
  const { register, handleSubmit, reset } = useForm<Plan>({
    defaultValues: initialData || {
      name: "",
      description: "",
      minAmount: 0,
      maxAmount: 0,
      roiRate: 0,
      roiInterval: "daily",
      roiType: "flat",
      profitPercentage: 0,
      durationInDays: 0,
    },
  });

  const submitHandler = (data: Plan) => {
    onSubmit(data);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="space-y-3 p-4 border rounded"
    >
      <input {...register("name")} placeholder="Plan Name" className="w-full p-2 border rounded" />
      <textarea {...register("description")} placeholder="Description" className="w-full p-2 border rounded" />
      <input type="number" {...register("minAmount")} placeholder="Min Amount" className="w-full p-2 border rounded" />
      <input type="number" {...register("maxAmount")} placeholder="Max Amount" className="w-full p-2 border rounded" />
      <input type="number" {...register("roiRate")} placeholder="ROI Rate (%)" className="w-full p-2 border rounded" />
      
      <select {...register("roiInterval")} className="w-full p-2 border rounded">
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <select {...register("roiType")} className="w-full p-2 border rounded">
        <option value="flat">Flat</option>
        <option value="compounded">Compounded</option>
      </select>

      <input type="number" {...register("profitPercentage")} placeholder="Profit %" className="w-full p-2 border rounded" />

      <input
        type="number"
        {...register("durationInDays", { valueAsNumber: true })}
        placeholder="Duration (days)"
        className="w-full p-2 border rounded"
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {initialData ? "Update Plan" : "Create Plan"}
      </button>
    </form>
  );
}