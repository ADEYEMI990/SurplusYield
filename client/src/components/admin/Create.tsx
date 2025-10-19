// client/src/components/admin/Create.tsx
import { useEffect, useState } from "react";
import API from "../../lib/api";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import Card, { CardHeader, CardTitle, CardContent } from "../common/Card";
import { toast } from "react-toastify";

type SpotlightType = "investment" | "withdraw";

type SpotlightForm = {
  type: SpotlightType;
  title: string;
  subtitle?: string;
  date?: string;
  status?: string;
  net?: string;
  total?: string;
  amount?: number;
  order?: number;
};

interface Spotlight {
  _id?: string ;
  title: string;
  description: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  type: SpotlightType;
  subtitle?: string;
  date?: string;
  status?: string;
  net?: string;
  total?: string;
  amount?: number;
  order?: number;
}


export default function AdminCreate() {
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<SpotlightForm>({
    type: "investment",
    title: "",
    subtitle: "",
    date: "",
    status: "Active",
    net: "",
    total: "",
    amount: 0,
    order: 0,
  });
  const [items, setItems] = useState<Spotlight[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    try {
      const res = await API.get("/spotlights/admin");
      setItems(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch admin list");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const resetForm = () =>
    setForm({
      type: "investment",
      title: "",
      subtitle: "",
      date: "",
      status: "Active",
      net: "",
      total: "",
      amount: 0,
      order: 0,
    });

  const handleSubmit = async () => {
    if (!form.title || !form.type) return toast.error("Please provide title and type");
    setLoading(true);
    try {
      if (editingId) {
        await API.put(`/spotlights/admin/${editingId}`, form);
        toast.success("Updated");
      } else {
        await API.post("/spotlights/admin", form);
        toast.success("Created");
      }
      resetForm();
      setFormOpen(false);
      setEditingId(null);
      await fetchList();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Spotlight) => {
    setEditingId(item._id ?? null);
    setForm({
      type: item.type,
      title: item.title,
      subtitle: item.subtitle || "",
      date: item.date ? new Date(item.date).toISOString().slice(0, 16) : "",
      status: item.status || "Active",
      net: item.net || "",
      total: item.total || "",
      amount: item.amount || 0,
      order: item.order || 0,
    });
    setFormOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return toast.error("Invalid item ID");

    if (!window.confirm("Are you sure you want to delete this spotlight?")) return;
    try {
      await API.delete(`/spotlights/admin/${id}`);
      toast.success("Deleted");
      await fetchList();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Create Site Item</h2>
        <Button onClick={() => { setFormOpen((v) => !v); if (!formOpen) { resetForm(); setEditingId(null); } }}>
          {formOpen ? "Close" : "Create"}
        </Button>
      </div>

      {formOpen && (
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as SpotlightType }))}
                options={[
                  { value: "investment", label: "Investment" },
                  { value: "withdraw", label: "Withdraw" },
                ]}
              />
              <Input
                label="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <Input
                label="Subtitle"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
              <Input
                label="Date"
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
              <Input
                label="Status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              />
              <Input
                label="Net (small text)"
                value={form.net}
                onChange={(e) => setForm((f) => ({ ...f, net: e.target.value }))}
              />
              <Input
                label="Total (display like '100 USD')"
                value={form.total}
                onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))}
              />
              <Input
                label="Amount (numeric)"
                type="number"
                value={String(form.amount)}
                onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
              />
              <Input
                label="Order (lower comes first)"
                type="number"
                value={String(form.order)}
                onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
              />
            </div>

            <div className="flex gap-3 mt-3">
              <Button onClick={handleSubmit} loading={loading}>
                {editingId ? "Update" : "Create"}
              </Button>
              <Button variant="outline" onClick={() => { resetForm(); setFormOpen(false); setEditingId(null); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Created Items</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-gray-500">No items yet</div>
          ) : (
            items.map((it: Spotlight) => (
              <div key={it._id} className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">{it.title}</div>
                  <div className="text-sm text-gray-500">{it.subtitle}</div>
                  <div className="text-xs text-gray-400">{it.type} • {it.status} • {it.total || ""}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEdit(it)}>Edit</Button>
                  <Button variant="danger" onClick={() => handleDelete(it._id)}>Delete</Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
