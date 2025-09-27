// src/components/admin/Setting.tsx
"use client";
import { useEffect, useState } from "react";
import API from "../../lib/api";
import Button from "../common/Button";
import Input from "../common/Input";
import Loader from "../common/Loader";
import Dialog from "../common/Dialog";

interface Setting {
  _id: string;
  key: string;
  value: string;
}

export default function SettingManager() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSetting, setCurrentSetting] = useState<Setting | null>(null);
  const [formValue, setFormValue] = useState("");

  // Load all settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get("/admin/settings");
        setSettings(res.data);
      } catch {
        setError("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleEdit = (setting: Setting) => {
    setCurrentSetting(setting);
    setFormValue(setting.value);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentSetting) return;

    try {
      const res = await API.post("/admin/settings", {
        key: currentSetting.key,
        value: formValue,
      });

      setSettings((prev) =>
        prev.map((s) => (s.key === currentSetting.key ? res.data : s))
      );

      setIsModalOpen(false);
      setCurrentSetting(null);
      setFormValue("");
    } catch {
      alert("Failed to update setting.");
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Admin Settings</h1>

      {/* ✅ Desktop/Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[400px] border border-gray-200 rounded-lg text-sm sm:text-base">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 sm:p-3">Key</th>
              <th className="p-2 sm:p-3">Value</th>
              <th className="p-2 sm:p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((setting) => (
              <tr key={setting._id} className="border-t">
                <td className="p-2 sm:p-3 font-medium">{setting.key}</td>
                <td className="p-2 sm:p-3 break-words max-w-[200px] sm:max-w-none">
                  {String(setting.value)}
                </td>
                <td className="p-2 sm:p-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(setting)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {settings.map((setting) => (
          <div
            key={setting._id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">{setting.key}</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleEdit(setting)}
              >
                Edit
              </Button>
            </div>
            <p className="text-gray-600 break-words">{String(setting.value)}</p>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Edit Setting: ${currentSetting?.key}`}
      >
        <div className="space-y-4">
          <Input
            label="Value"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
