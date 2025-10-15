import { useEffect, useState } from "react";
import {
  PlusCircle,
  XCircle,
  Edit,
  Trash,
  Loader2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../../lib/api";
import type { AxiosError } from "axios";

interface KycField {
  label: string;
  type: "text" | "file";
  required: boolean;
}

interface KycForm {
  _id?: string;
  name: string;
  fields: KycField[];
  status: "active" | "deactivated";
}

interface ErrorResponse {
  message?: string;
}

export default function CreateKyc() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [forms, setForms] = useState<KycForm[]>([]);
  const [name, setName] = useState("");
  const [fields, setFields] = useState<KycField[]>([]);
  const [status, setStatus] = useState<"active" | "deactivated">("active");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editId, setEditId] = useState<string | null>(null); // ✅ track edit mode

  // ✅ Load all existing KYC forms from backend
  const fetchKycForms = async () => {
    try {
      setFetching(true);
      const res = await API.get("/kyc/admin/forms");
      setForms(res.data.forms || []);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      toast.error(error.response?.data?.message || "Failed to fetch KYC forms");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchKycForms();
  }, []);

  // ✅ Add new field group
  const addField = () =>
    setFields((prev) => [...prev, { label: "", type: "text", required: true }]);

  // ✅ Update field dynamically
  const updateField = <K extends keyof KycField>(
    index: number,
    key: K,
    value: KycField[K]
  ) => {
    setFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  // ✅ Remove a field
  const removeField = (index: number) =>
    setFields((prev) => prev.filter((_, i) => i !== index));

  // ✅ Save or Update KYC form
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a form name");
      return;
    }
    if (fields.length === 0) {
      toast.error("Add at least one field option");
      return;
    }

    setLoading(true);
    try {
      if (editId) {
        // ✅ UPDATE existing KYC form
        await API.put(`/kyc/admin/forms/${editId}`, { name, fields, status });
        toast.success(`KYC Form "${name}" updated successfully ✅`);
      } else {
        // ✅ CREATE new KYC form
        await API.post("/kyc/admin/forms", { name, fields, status });
        toast.success(`${name} KYC CREATED ✅`);
      }

      await fetchKycForms();

      // Reset form
      setShowDropdown(false);
      setName("");
      setFields([]);
      setStatus("active");
      setEditId(null);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      toast.error(error.response?.data?.message || "Failed to save KYC");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete KYC form
  const handleDelete = async (index: number) => {
    const form = forms[index];
    if (!form._id) {
      setForms((prev) => prev.filter((_, i) => i !== index));
      toast.success(`${form.name} deleted`);
      return;
    }

    try {
      await API.delete(`/kyc/admin/forms/${form._id}`);
      toast.success(`${form.name} deleted`);
      await fetchKycForms();
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      toast.error(error.response?.data?.message || "Failed to delete KYC");
    }
  };

  // ✅ Edit KYC handler
  const handleEdit = (form: KycForm) => {
    setEditId(form._id || null);
    setName(form.name);
    setFields(form.fields);
    setStatus(form.status);
    setShowDropdown(true);
  };

  // ✅ Cancel Edit / Reset form
  const handleCancel = () => {
    setShowDropdown(false);
    setName("");
    setFields([]);
    setStatus("active");
    setEditId(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* ==== HEADER ==== */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">KYC Forms</h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              setEditId(null);
              setName("");
              setFields([]);
              setStatus("active");
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <PlusCircle size={18} /> ADD NEW
          </button>
          <button
            onClick={fetchKycForms}
            disabled={fetching}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition"
          >
            {fetching ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Loading...
              </>
            ) : (
              <>
                <RefreshCw size={16} /> Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* ==== DROPDOWN CARD ==== */}
      {showDropdown && (
        <div className="bg-white rounded-xl shadow-lg border p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {editId ? "Edit KYC Form" : "Add New KYC Form"}
            </h3>
            <button
            title="Cancel"
              onClick={handleCancel}
              className="text-gray-500 hover:text-red-600 transition"
            >
              <XCircle size={22} />
            </button>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
            {/* Form Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
                placeholder="Enter KYC Form Name"
              />
            </div>

            {/* Add Field Button */}
            <button
              onClick={addField}
              className="text-sm bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Add Field Option
            </button>

            {/* Fields List */}
            <div className="space-y-3">
              {fields.map((field, i) => (
                <div
                  key={i}
                  className="flex flex-wrap md:flex-nowrap items-center gap-2 border p-3 rounded-lg bg-white relative"
                >
                  {/* Label Input */}
                  <input
                    type="text"
                    placeholder="Field Label"
                    value={field.label}
                    onChange={(e) =>
                      updateField(i, "label", e.target.value)
                    }
                    className="flex-1 border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                  />

                  {/* Type Selector */}
                  <select
                  title="Field Type"
                    value={field.type}
                    onChange={(e) =>
                      updateField(i, "type", e.target.value as "text" | "file")
                    }
                    className="border rounded-md px-3 py-2"
                  >
                    <option value="text">Input Text</option>
                    <option value="file">File Upload</option>
                  </select>

                  {/* Required Selector */}
                  <select
                  title="Required Field"
                    value={field.required ? "Required" : "Not Required"}
                    onChange={(e) =>
                      updateField(i, "required", e.target.value === "Required")
                    }
                    className="border rounded-md px-3 py-2"
                  >
                    <option value="Required">Required</option>
                    <option value="Not Required">Not Required</option>
                  </select>

                  {/* Remove Button */}
                  <button
                  title="Remove Field"
                    onClick={() => removeField(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Status Buttons */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Status:</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStatus("active")}
                  className={`px-4 py-2 rounded-md border transition ${
                    status === "active"
                      ? "bg-green-600 text-white"
                      : "bg-white hover:bg-green-50"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatus("deactivated")}
                  className={`px-4 py-2 rounded-md border transition ${
                    status === "deactivated"
                      ? "bg-red-600 text-white"
                      : "bg-white hover:bg-red-50"
                  }`}
                >
                  Deactivated
                </button>
              </div>
            </div>

            {/* Save Changes */}
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium transition flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : editId ? (
                "Update Form"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      )}

      {/* ==== KYC TABLE ==== */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        {fetching ? (
          <div className="flex justify-center py-6 text-gray-500">
            <Loader2 size={22} className="animate-spin mr-2" />
            Loading KYC Forms...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-700">
                <th className="py-2 px-3">VERIFICATION NAME</th>
                <th className="py-2 px-3">STATUS</th>
                <th className="py-2 px-3">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {forms.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500 py-4">
                    No KYC Forms Created
                  </td>
                </tr>
              ) : (
                forms.map((form, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition text-sm"
                  >
                    <td className="py-2 px-3 font-medium">{form.name}</td>
                    <td
                      className={`py-2 px-3 font-semibold ${
                        form.status === "active"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {form.status}
                    </td>
                    <td className="py-2 px-3 flex items-center gap-3">
                      <button
                      title="Edit KYC Form"
                        onClick={() => handleEdit(form)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 rounded-full"
                      >
                        <Edit size={16} className="text-blue-600" />
                      </button>
                      <button
                      title="Delete KYC Form"
                        onClick={() => handleDelete(index)}
                        className="p-2 bg-red-50 hover:bg-red-100 rounded-full"
                      >
                        <Trash size={16} className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}