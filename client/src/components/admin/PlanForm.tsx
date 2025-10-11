// client/src/components/admin/PlanForm.tsx
import React, { useEffect, useState } from "react";
import type { Plan } from "../../types/plan";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import Label from "../../components/common/Label";
import Card from "../../components/common/Card";
import { toast } from "react-toastify";
import API from "../../lib/api";

interface PlanFormProps {
  mode: "create" | "edit";
  initialData?: Plan; // Plan type
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PlanForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: PlanFormProps) {
  const [form, setForm] = useState<Plan>({
    name: "",
    badge: "",
    planType: "range",
    roiType: "range",
    roiUnit: "%",
    returnPeriod: "daily",
    returnType: "period",
    holidays: [],
    capitalBack: true,
    featured: true,
    canCancel: false,
    trending: false,
    status: "active",
    durationInDays: 0,
  });
  const [icon, setIcon] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // prefill for edit
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        ...form,
        ...initialData,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value === "yes" || value === "no"
            ? value === "yes"
            : value,
    }));
  };

  const handleHolidayToggle = (day: string) => {
    setForm((prev) => {
      const exists = prev.holidays.includes(day);
      return {
        ...prev,
        holidays: exists
          ? prev.holidays.filter((d) => d !== day)
          : [...prev.holidays, day],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          val.forEach((v) => formData.append(key, v));
        } else {
          formData.append(key, val as string);
        }
      });
      if (icon) formData.append("icon", icon);

      if (mode === "create") {
        await API.post("/plans", formData);
        toast.success("Plan created successfully");
      } else {
        if (initialData?._id) {
          await API.put(`/plans/${initialData._id}`, formData);
          toast.success("Plan updated successfully");
        } else {
          toast.error("No plan ID found to update");
        }
      }
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else if (typeof err === "object" && err && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        toast.error(axiosErr.response?.data?.message || "Error saving plan");
      } else {
        toast.error("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-gray-200 rounded-2xl p-6 bg-white mt-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Icon Upload */}
        <div className="flex flex-col gap-2">
          <Label>Upload Icon:</Label>
          <input
            name="icon"
            placeholder="Icon URL"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="file"
            accept="image/*"
            onChange={(e) => setIcon(e.target.files?.[0] || null)}
          />
        </div>

        {/* Plan Name & Badge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Plan Name:"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <Input
            label="Plan Badge:"
            name="badge"
            value={form.badge}
            onChange={handleChange}
          />
        </div>

        {/* Plan Type & Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Plan Type:</Label>
            <div className="flex gap-3 mt-2">
              {["fixed", "range"].map((type) => (
                <label key={type}>
                  <input
                    type="radio"
                    name="planType"
                    value={type}
                    checked={form.planType === type}
                    onChange={handleChange}
                  />{" "}
                  {type.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          <div>
            {form.planType === "fixed" ? (
              <Input
                label="Amount (USD)"
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
              />
            ) : (
              <div className="flex gap-3">
                <Input
                  label="Min Amount (USD)"
                  name="minAmount"
                  type="number"
                  value={form.minAmount}
                  onChange={handleChange}
                />
                <Input
                  label="Max Amount (USD)"
                  name="maxAmount"
                  type="number"
                  value={form.maxAmount}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* ROI Type & Interest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>ROI Type:</Label>
            <div className="flex gap-3 mt-2">
              {["fixed", "range"].map((type) => (
                <label key={type}>
                  <input
                    type="radio"
                    name="roiType"
                    value={type}
                    checked={form.roiType === type}
                    onChange={handleChange}
                  />{" "}
                  {type.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          <div>
            {form.roiType === "fixed" ? (
              <div className="flex gap-3 items-end">
                <Input
                  label="Interest Amount"
                  name="roiValue"
                  type="number"
                  value={form.roiValue}
                  onChange={handleChange}
                />
                <Select
                  label=""
                  name="roiUnit"
                  value={form.roiUnit}
                  onChange={handleChange}
                  options={[
                    { value: "%", label: "%" },
                    { value: "$", label: "$" },
                  ]}
                />
              </div>
            ) : (
              <div className="flex gap-3">
                <Input
                  label="Min ROI"
                  name="minRoi"
                  type="number"
                  value={form.minRoi}
                  onChange={handleChange}
                />
                <Input
                  label="Max ROI"
                  name="maxRoi"
                  type="number"
                  value={form.maxRoi}
                  onChange={handleChange}
                />
                <Select
                  label=""
                  name="roiUnit"
                  value={form.roiUnit}
                  onChange={handleChange}
                  options={[
                    { value: "%", label: "%" },
                    { value: "$", label: "$" },
                  ]}
                />
              </div>
            )}
          </div>
        </div>

        {/* Return Period & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Return Period"
            name="returnPeriod"
            value={form.returnPeriod}
            onChange={handleChange}
            options={[
              { value: "hour", label: "Hourly" },
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
            ]}
          />

          <div>
            <Label>Return Type:</Label>
            <div className="flex gap-3 mt-2">
              {["period", "lifetime"].map((type) => (
                <label key={type}>
                  <input
                    type="radio"
                    name="returnType"
                    value={type}
                    checked={form.returnType === type}
                    onChange={handleChange}
                  />{" "}
                  {type.toUpperCase()}
                </label>
              ))}
            </div>
            {form.returnType === "period" && (
              <div className="flex gap-3 mt-3">
                <Input
                  label="Duration (Days)"
                  name="durationInDays"
                  type="number"
                  value={form.durationInDays}
                  onChange={handleChange}
                />
                <span className="self-end mb-1 text-gray-600">Days</span>
              </div>
            )}
          </div>
        </div>

        {/* Holidays */}
        <div>
          <Label>
            Profit Return Holiday (User won’t get profit on selected day):
          </Label>
          <div className="flex gap-4 mt-2">
            {["saturday", "sunday"].map((day) => (
              <label key={day}>
                <input
                  type="checkbox"
                  checked={form.holidays.includes(day)}
                  onChange={() => handleHolidayToggle(day)}
                />{" "}
                {day.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        {/* Capital Back / Featured / Cancel / Trending / Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Capital Back:</Label>
            <div className="flex gap-3 mt-2">
              {["yes", "no"].map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="capitalBack"
                    value={val}
                    checked={form.capitalBack === (val === "yes")}
                    onChange={handleChange}
                  />{" "}
                  {val.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Featured:</Label>
            <div className="flex gap-3 mt-2">
              {["yes", "no"].map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="featured"
                    value={val}
                    checked={form.featured === (val === "yes")}
                    onChange={handleChange}
                  />{" "}
                  {val.toUpperCase()}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Plan Cancel:</Label>
            <div className="flex gap-3 mt-2">
              {["yes", "no"].map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="canCancel"
                    value={val}
                    checked={form.canCancel === (val === "yes")}
                    onChange={handleChange}
                  />{" "}
                  {val.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Trending:</Label>
            <div className="flex gap-3 mt-2">
              {["yes", "no"].map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name="trending"
                    value={val}
                    checked={form.trending === (val === "yes")}
                    onChange={handleChange}
                  />{" "}
                  {val.toUpperCase()}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <Label>Status:</Label>
          <div className="flex gap-3 mt-2">
            {["active", "deactivated"].map((val) => (
              <label key={val}>
                <input
                  type="radio"
                  name="status"
                  value={val}
                  checked={form.status === val}
                  onChange={handleChange}
                />{" "}
                {val.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {mode === "edit" ? "Update Plan" : "Add New Plan"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
