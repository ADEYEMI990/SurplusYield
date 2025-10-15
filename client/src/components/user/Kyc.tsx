import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../lib/api";
import { AxiosError } from "axios";

// === Type Definitions ===
interface FormField {
  label: string;
  type: "text" | "file";
  required: boolean;
}

interface KycForm {
  _id: string;
  name: string;
  fields: FormField[];
}

interface KycFieldValue {
  label: string;
  value: string;
}

interface UploadResponse {
  url: string;
}

interface ErrorResponse {
  message?: string;
}

interface KycSubmission {
  _id: string;
  form: KycForm;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  fields: KycFieldValue[];
}

// === Component ===
export default function Kyc() {
  const [forms, setForms] = useState<KycForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<KycForm | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [userKyc, setUserKyc] = useState<KycSubmission[]>([]);

  const navigate = useNavigate();

  // ✅ Fetch all user KYC data (reusable)
  const reloadUserKyc = async () => {
    try {
      const [formsRes, userRes] = await Promise.all([
        API.get<KycForm[]>("/kyc/forms/active"),
        API.get<KycSubmission[]>("/kyc/my"),
      ]);
      setForms(formsRes.data);
      setUserKyc(userRes.data);
    } catch {
      toast.error("Failed to refresh KYC data");
    }
  };

  // ✅ Load on mount
  useEffect(() => {
    reloadUserKyc();
  }, []);

  // ✅ Handle input change
  const handleChange = async (
    field: FormField,
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    if (field.type === "file") {
      const file = e.target.files?.[0];
      if (!file) return;

      const localUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [field.label]: localUrl }));

      const formData = new FormData();
      formData.append("file", file);

      const toastId = toast.loading(`Uploading ${field.label}...`);
      try {
        const res = await API.post<UploadResponse>("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setValues((prev) => ({ ...prev, [field.label]: res.data.url }));
        toast.update(toastId, {
          render: `${field.label} uploaded successfully`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } catch (uploadErr) {
        const error = uploadErr as AxiosError<ErrorResponse>;
        toast.update(toastId, {
          render: error.response?.data?.message || "Upload failed",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } else {
      setValues((prev) => ({ ...prev, [field.label]: e.target.value }));
    }
  };

  // ✅ Submit KYC form
  const handleSubmit = async (): Promise<void> => {
    if (!selectedForm) {
      toast.error("Select a form first");
      return;
    }

    const fields = selectedForm.fields.map((f) => ({
      label: f.label,
      value: values[f.label] || "",
    }));

    setLoading(true);
    try {
      await API.post("/kyc/submit", {
        formId: selectedForm._id,
        fields,
      });

      toast.success("KYC submitted successfully");

      // 🔁 Refresh user’s KYC status instantly
    await reloadUserKyc();

      setSelectedForm(null);
      setValues({});
      setPreviews({});
      
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      toast.error(error.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get current user's KYC submission for a form
  const getUserKyc = (formId: string): KycSubmission | undefined =>
    userKyc.find((k) => k.form?._id === formId);

  const getStatus = (formId: string): string | null =>
    getUserKyc(formId)?.status || null;

  const getReason = (formId: string): string | null =>
    getUserKyc(formId)?.reason || null;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6 space-y-5">
      {/* === HEADER === */}
      <div className="flex items-center gap-3">
        <button
          title="Go Back"
          onClick={() => navigate("/user/dashboard")}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">
          KYC Verification
        </h2>
      </div>

      <hr className="border-gray-200" />

      {/* === MAIN CARD === */}
      <div className="p-5 border rounded-xl space-y-5 bg-gray-50">
        <h3 className="font-semibold text-gray-700">Verification Type</h3>

        {/* === Form Selector === */}
        <select
          title="Select Verification Type"
          className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
          value={selectedForm?._id || ""}
          onChange={(e) => {
            const form = forms.find((f) => f._id === e.target.value) || null;
            setSelectedForm(form);
            setValues({});
            setPreviews({});

            // Prefill if rejected KYC exists
            if (form) {
              const rejected = userKyc.find(
                (k) => k.form?._id === form._id && k.status === "rejected"
              );
              if (rejected) {
                const prefilled: Record<string, string> = {};
                rejected.fields.forEach((f) => {
                  prefilled[f.label] = f.value;
                });
                setValues(prefilled);
              }
            }
          }}
        >
          <option value="">Select Verification Type</option>
          {forms.map((form) => {
            const status = getStatus(form._id);
            return (
              <option key={form._id} value={form._id}>
                {form.name}{" "}
                {status === "pending"
                  ? "(Pending)"
                  : status === "approved"
                    ? "(Verified)"
                    : status === "rejected"
                      ? "(Rejected)"
                      : ""}
              </option>
            );
          })}
        </select>

        {/* === Selected Form Fields === */}
        {selectedForm && getStatus(selectedForm._id) !== "approved" && (
          <div className="p-4 border rounded-lg bg-white space-y-4 shadow-sm">
            {selectedForm.fields.map((field) => (
              <div key={field.label} className="space-y-2">
                <label className="block font-medium text-gray-700">
                  {field.label}{" "}
                  {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === "file" ? (
                  <div className="space-y-2">
                    <input
                      title="Upload File"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleChange(field, e)}
                      className="w-full border px-3 py-2 rounded-lg"
                    />
                    {previews[field.label] && (
                      <div className="border rounded-lg p-2">
                        {/\.(jpg|jpeg|png|gif)$/i.test(
                          previews[field.label]
                        ) ? (
                          <img
                            src={previews[field.label]}
                            alt="preview"
                            className="h-32 w-32 object-cover rounded-md"
                          />
                        ) : (
                          <a
                            href={previews[field.label]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View Uploaded File
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={values[field.label] || ""}
                    onChange={(e) => handleChange(field, e)}
                    placeholder={`Enter ${field.label}`}
                    className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-300"
                  />
                )}
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
            >
              {loading ? "Submitting..." : "SUBMIT NOW"}
            </button>
          </div>
        )}
      </div>

      {/* === Status Info === */}
      {selectedForm && (
        <>
          {(() => {
            const status = getStatus(selectedForm._id);
            const reason = getReason(selectedForm._id);

            if (status === "pending")
              return (
                <div className="border-2 border-yellow-400 rounded-lg text-yellow-600 text-sm px-3 py-2">
                  ⏳ Your KYC is pending verification.
                </div>
              );
            if (status === "approved")
              return (
                <div className="border-2 border-green-500 rounded-lg text-green-600 text-sm px-3 py-2">
                  ✅ Your KYC has been verified successfully.
                </div>
              );
            if (status === "rejected")
              return (
                <div className="border-2 border-red-500 rounded-lg text-red-600 text-sm px-3 py-3 space-y-2">
                  <p className="font-medium">❌ Your KYC was rejected.</p>
                  {reason && (
                    <p className="text-gray-800">
                      <span className="font-semibold">Reason:</span> {reason}
                    </p>
                  )}
                  <p>Please correct the issues and re-submit your KYC form.</p>
                </div>
              );
            return null;
          })()}
        </>
      )}
    </div>
  );
}
