// src/components/landing/PlansLanding.tsx
"use client";
import { useEffect, useState } from "react";
import API from "../../lib/api";
import Card from "../common/Card";
import Button from "../common/Button";
import Loader from "../common/Loader";
import { Check } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface Plan {
  _id: string;
  icon?: string;
  name: string;
  badge: string;
  planType: string;
  amount?: number;
  roiValue?: number;
  roiUnit: string;
  returnPeriod: string;
  capitalBack: boolean;
  returnType: string;
  durationInDays: number;
  featured?: boolean;
  canCancel?: boolean;
  trending?: boolean;
  status: string;
  minAmount?: number;
  maxAmount?: number;
  minRoi?: number;
  maxRoi?: number;
  holidays?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function PlansLanding() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await API.get("/plans");
        setPlans(res.data.filter((p: Plan) => p.status === "active"));
      } catch {
        toast.error("Failed to load plans ❌");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const getReadablePeriod = (plan: Plan) => {
    const { returnPeriod, durationInDays } = plan;
    const period =
      returnPeriod === "hour"
        ? "hour"
        : returnPeriod === "daily"
        ? "day"
        : "week";
    const duration =
      returnPeriod === "weekly"
        ? `${durationInDays / 7} weeks`
        : `${durationInDays} days`;
    return `Pays every 1 ${period} for ${duration}`;
  };

  if (loading) return <Loader />;

  return (
    <section
      id="plans"
      className="relative scroll-snap-start py-16 sm:py-20 bg-gradient-to-b from-white to-blue-50 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 text-center">
        {/* Heading */}
        <div className="flex flex-col items-center justify-center mb-10 sm:mb-16 space-y-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Our Investment Plans
          </h2>
          <p className="text-blue-600 text-lg sm:text-xl font-medium">
            The plans we offer are specifically made for you
          </p>
        </div>

        {/* ==== PLAN CARDS ==== */}
        <div
          className="
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
            gap-6 sm:gap-8 md:gap-10 
            scroll-snap-center
          "
        >
          {plans.map((plan) => (
            <Card
              key={plan._id}
              className={`
                relative flex flex-col justify-between 
                border border-gray-100 
                rounded-2xl shadow-sm hover:shadow-lg 
                transition-all duration-300 
                bg-white/80 backdrop-blur-md 
                p-6 sm:p-8
                hover:-translate-y-1
              `}
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 text-xs sm:text-sm rounded-full uppercase tracking-wide shadow-sm">
                {plan.badge}
              </div>

              {/* Icon + Name */}
              <div className="flex flex-col items-center text-center gap-3 sm:gap-4 mt-4">
                {plan.icon && (
                  <img
                    src={plan.icon}
                    alt={plan.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-blue-100 shadow-sm"
                  />
                )}

                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {plan.name}
                </h3>
                <p className="text-blue-600 font-medium text-sm sm:text-base">
                  {plan.roiValue}
                  {plan.roiUnit} every {plan.returnPeriod}
                </p>
              </div>

              {/* Plan details */}
              <div className="mt-5 space-y-2 text-sm text-gray-700 bg-blue-50/30 rounded-xl p-4 border border-blue-100">
                <div className="flex justify-between">
                  <span>Investment:</span>
                  <span>
                    {plan.planType === "fixed"
                      ? `$${plan.amount}`
                      : `$${plan.minAmount} - $${plan.maxAmount}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Capital Back:</span>
                  <span>{plan.capitalBack ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Return Type:</span>
                  <span>{plan.returnType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{plan.durationInDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Cancelable:</span>
                  <span>{plan.canCancel ? "Yes" : "No"}</span>
                </div>
              </div>

              {/* Period */}
              <p className="text-xs sm:text-sm text-gray-500 mt-3 italic text-center">
                {getReadablePeriod(plan)}
              </p>

              {/* Button */}
              <div className="flex justify-center mt-6">
                <Button
                  variant="primary"
                  size="md"
                  className="rounded-full w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white px-6 py-3 font-medium shadow-md"
                  onClick={() => navigate(`/auth/register`)}
                >
                  <Check size={16} /> Invest Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Scroll Snap Helper */}
      <div className="absolute bottom-0 left-0 right-0 h-8 scroll-snap-end" />
    </section>
  );
}
