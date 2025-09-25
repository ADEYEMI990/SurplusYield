// src/components/admin/SitePages.tsx
import { useEffect, useState } from "react";
import API from "../../lib/api";
import Loader from "../common/Loader";
import Button from "../common/Button";
import Input from "../common/Input";
import Textarea from "../common/Textarea";
import Dialog from "../common/Dialog";
import axios from "axios";

interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
}

export default function SitePages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({ title: "", slug: "", content: "" });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  // Track if slug was manually edited
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data } = await API.get("/site/pages");
      setPages(data);
    } catch {
      alert("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  // --- Validation ---
  const validateForm = async (isEdit = false) => {
    const newErrors: { [k: string]: string } = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.slug.trim()) newErrors.slug = "Slug is required";
    if (!form.content.trim()) newErrors.content = "Content is required";

    // Check slug uniqueness
    if (form.slug.trim()) {
      const slugExists = pages.some(
        (p) =>
          p.slug === form.slug &&
          (!isEdit || (selectedPage && p._id !== selectedPage._id))
      );
      if (slugExists) newErrors.slug = "Slug must be unique";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Slug Generator ---
  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugManuallyEdited ? prev.slug : generateSlug(title),
    }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: generateSlug(slug) }));
  };

  const handleCreate = async () => {
    if (!(await validateForm(false))) return;

    try {
      await API.post("/site/pages", { ...form, isPublished: true });
      setIsCreateOpen(false);
      setForm({ title: "", slug: "", content: "" });
      setSlugManuallyEdited(false);
      fetchPages();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error ?? "Error creating page");
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Error creating page");
      }
    }
  };

  const handleUpdate = async () => {
    if (!selectedPage) return;
    if (!(await validateForm(true))) return;

    try {
      await API.put(`/site/pages/${selectedPage._id}`, form);
      setIsEditOpen(false);
      setSelectedPage(null);
      setSlugManuallyEdited(false);
      fetchPages();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error ?? "Error updating page");
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Error updating page");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    try {
      await API.delete(`/site/pages/${id}`);
      fetchPages();
    } catch {
      alert("Error deleting page");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-3 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-semibold">Manage Pages</h1>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          + Create New Page
        </Button>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {pages.map((page) => (
          <div key={page._id} className="border rounded-lg p-3 bg-white shadow-sm">
            <h2 className="font-semibold text-base">{page.title}</h2>
            <p className="text-sm text-gray-600 break-all">/{page.slug}</p>
            <p className="text-sm mt-1">
              Published:{" "}
              <span className={page.isPublished ? "text-green-600" : "text-red-500"}>
                {page.isPublished ? "Yes" : "No"}
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setSelectedPage(page);
                  setForm({
                    title: page.title,
                    slug: page.slug,
                    content: page.content,
                  });
                  setErrors({});
                  setSlugManuallyEdited(false);
                  setIsEditOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(page._id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Published</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page._id} className="border-b">
                <td className="px-4 py-2">{page.title}</td>
                <td className="px-4 py-2">{page.slug}</td>
                <td className="px-4 py-2">
                  {page.isPublished ? "✅ Yes" : "❌ No"}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedPage(page);
                      setForm({
                        title: page.title,
                        slug: page.slug,
                        content: page.content,
                      });
                      setErrors({});
                      setSlugManuallyEdited(false);
                      setIsEditOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(page._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Page Modal */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Page"
      >
        <div className="space-y-3">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            error={errors.title}
          />
          <div>
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              error={errors.slug}
            />
            <p className="text-xs text-gray-500 mt-1 break-all">
              Preview: <span className="font-mono">/pages/{form.slug || "your-slug"}</span>
            </p>
          </div>
          <Textarea
            label="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            error={errors.content}
          />
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Page Modal */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Page"
      >
        <div className="space-y-3">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            error={errors.title}
          />
          <div>
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              error={errors.slug}
            />
            <p className="text-xs text-gray-500 mt-1 break-all">
              Preview: <span className="font-mono">/pages/{form.slug || "your-slug"}</span>
            </p>
          </div>
          <Textarea
            label="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            error={errors.content}
          />
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}