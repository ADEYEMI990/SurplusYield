// src/components/user/Kyc.tsx

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { ArrowLeft, Upload, CheckCircle, XCircle, Clock, AlertCircle, UserCheck, Shield, FileText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../lib/api";
import { AxiosError } from "axios";

/* ================= TYPES ================= */

interface FormField {
  label: string;
  type: "text" | "file";
  required: boolean;
}

interface KycForm {
  id: string;
  name: string;
  fields: FormField[];
}

interface ErrorResponse {
  message?: string;
}

interface KycSubmission {
  id: string;
  form: KycForm;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  fields: Record<string, string>;
}

/* ================= COMPONENT ================= */

export default function Kyc() {
  const [forms, setForms] = useState<KycForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<KycForm | null>(null);

  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [userKyc, setUserKyc] = useState<KycSubmission[]>([]);

  const navigate = useNavigate();

  /* ================= LOAD DATA ================= */

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

  useEffect(() => {
    reloadUserKyc();
  }, []);

  /* ================= HANDLE INPUT ================= */

  const handleChange = (
    field: FormField,
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    if (field.type === "file") {
      const file = e.target.files?.[0];
      if (!file) return;

      setFiles((prev) => ({ ...prev, [field.label]: file }));

      const preview = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [field.label]: preview }));
    } else {
      setValues((prev) => ({
        ...prev,
        [field.label]: e.target.value,
      }));
    }
  };

  const removeFile = (fieldLabel: string) => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[fieldLabel];
      return newFiles;
    });
    setPreviews((prev) => {
      const newPreviews = { ...prev };
      if (newPreviews[fieldLabel]) {
        URL.revokeObjectURL(newPreviews[fieldLabel]);
        delete newPreviews[fieldLabel];
      }
      return newPreviews;
    });
  };

  /* ================= SUBMIT KYC ================= */

  const handleSubmit = async (): Promise<void> => {
    if (!selectedForm) {
      toast.error("Select a verification type first");
      return;
    }

    const formData = new FormData();

    formData.append("formId", selectedForm.id);

    // Append text values
    formData.append("fields", JSON.stringify(values));

    // Append files
    Object.entries(files).forEach(([label, file]) => {
      formData.append(label, file);
    });

    setLoading(true);

    try {
      await API.post("/kyc/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("KYC submitted successfully");

      await reloadUserKyc();

      setSelectedForm(null);
      setValues({});
      setFiles({});
      setPreviews({});
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      toast.error(error.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATUS HELPERS ================= */

  const getUserKyc = (formId: string): KycSubmission | undefined =>
    userKyc.find((k) => k.form?.id === formId);

  const getStatus = (formId: string): string | null =>
    getUserKyc(formId)?.status || null;

  const getReason = (formId: string): string | null =>
    getUserKyc(formId)?.reason || null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-50 border-green-200 text-green-700";
      case "pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "rejected":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/user/dashboard")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
          </div>
          <p className="text-gray-500 text-sm ml-11">Verify your identity to unlock all features</p>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl p-5 mb-6 border border-green-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Why verify your identity?</h3>
              <p className="text-sm text-gray-600">
                Verification helps us ensure the security of your account and comply with regulations. 
                Verified users get access to higher limits and faster withdrawals.
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <h2 className="font-bold text-gray-900">Verification Type</h2>
            </div>
          </div>

          <div className="p-6">
            {/* Select Verification Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Verification Document
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors bg-white"
                value={selectedForm?.id || ""}
                onChange={(e) => {
                  const form = forms.find((f) => f.id === e.target.value) || null;
                  setSelectedForm(form);
                  setValues({});
                  setFiles({});
                  setPreviews({});
                }}
              >
                <option value="">Choose verification type</option>
                {forms.map((form) => {
                  const status = getStatus(form.id);
                  return (
                    <option key={form.id} value={form.id}>
                      {form.name} {status === "pending" ? "(Pending)" : status === "approved" ? "(Verified)" : status === "rejected" ? "(Rejected)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Form Fields */}
            {selectedForm && getStatus(selectedForm.id) !== "approved" && (
              <div className="space-y-6">
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Enter Your Details</h3>
                  
                  {selectedForm.fields.map((field) => (
                    <div key={field.label} className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {field.type === "file" ? (
                        <div className="space-y-3">
                          {!previews[field.label] ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 transition-colors bg-gray-50 hover:bg-green-50">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Click to upload</p>
                                <p className="text-xs text-gray-400">PDF, JPG, PNG (max 5MB)</p>
                              </div>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleChange(field, e)}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="relative">
                              {previews[field.label] && !previews[field.label].includes('.pdf') ? (
                                <div className="relative inline-block">
                                  <img
                                    src={previews[field.label]}
                                    alt="preview"
                                    className="h-40 rounded-xl object-cover border border-gray-200"
                                  />
                                  <button
                                    onClick={() => removeFile(field.label)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                  <FileText className="w-8 h-8 text-gray-400" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-700">{files[field.label]?.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {(files[field.label]?.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => removeFile(field.label)}
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={values[field.label] || ""}
                          onChange={(e) => handleChange(field, e)}
                          placeholder={`Enter your ${field.label.toLowerCase()}`}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                        />
                      )}
                    </div>
                  ))}

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      "Submit Verification"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Card */}
        {selectedForm && (
          <div className={`mt-6 rounded-2xl border p-5 ${getStatusColor(getStatus(selectedForm.id) || '')}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getStatusIcon(getStatus(selectedForm.id) || '')}
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  {getStatus(selectedForm.id) === "pending" && "Verification Pending"}
                  {getStatus(selectedForm.id) === "approved" && "Verification Approved"}
                  {getStatus(selectedForm.id) === "rejected" && "Verification Rejected"}
                  {!getStatus(selectedForm.id) && "Not Submitted"}
                </h3>
                <p className="text-sm">
                  {getStatus(selectedForm.id) === "pending" && "Your documents are being reviewed. This usually takes 24-48 hours."}
                  {getStatus(selectedForm.id) === "approved" && "Your identity has been verified. You now have full access to all features."}
                  {getStatus(selectedForm.id) === "rejected" && `Your verification was rejected. ${getReason(selectedForm.id) ? `Reason: ${getReason(selectedForm.id)}` : "Please submit new documents."}`}
                  {!getStatus(selectedForm.id) && "Complete the form above to start your verification process."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Need help?</h4>
              <p className="text-sm text-gray-600">
                Make sure your documents are clear and all information matches your account details.
                Contact support if you need assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}