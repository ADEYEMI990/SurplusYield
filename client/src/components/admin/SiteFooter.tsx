// src/components/admin/SiteFooter.tsx
"use client";
import { useEffect, useState } from "react";
import API from "../../lib/api";
import Button from "../common/Button";
import Input from "../common/Input";
import Textarea from "../common/Textarea";
import Dialog from "../common/Dialog";
import Label from "../common/Label";
import Loader from "../common/Loader";

interface FooterLink {
  label: string;
  url: string;
}

interface FooterSection {
  _id: string;
  section: string;
  links?: FooterLink[];
  content?: string;
}

interface SiteFooterProps {
  onDataChanged?: () => void;
}

export default function SiteFooter({ onDataChanged }: SiteFooterProps) {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FooterSection | null>(null);

  const [section, setSection] = useState("");
  const [content, setContent] = useState("");
  const [links, setLinks] = useState<FooterLink[]>([{ label: "", url: "" }]);

  // fetch sections
  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await API.get("/site/footer");
      setSections(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const resetForm = () => {
    setSection("");
    setContent("");
    setLinks([{ label: "", url: "" }]);
    setEditing(null);
  };

  const openModal = (sec?: FooterSection) => {
    if (sec) {
      setEditing(sec);
      setSection(sec.section);
      setContent(sec.content || "");
      setLinks(sec.links?.length ? sec.links : [{ label: "", url: "" }]);
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  const saveSection = async () => {
    const payload = { section, content, links };
    if (editing) {
      await API.put(`/site/footer/${editing._id}`, payload);
    } else {
      await API.post("/site/footer", payload);
    }
    setModalOpen(false);
    resetForm();
    fetchSections();
    onDataChanged?.();
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Delete this footer section?")) return;
    await API.delete(`/site/footer/${id}`);
    fetchSections();
    onDataChanged?.();
  };

  const updateLink = (idx: number, field: "label" | "url", value: string) => {
    setLinks((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    );
  };

  const addLink = () => setLinks((prev) => [...prev, { label: "", url: "" }]);
  const removeLink = (idx: number) =>
    setLinks((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold">Footer Sections</h2>
        <Button className="w-full sm:w-auto" onClick={() => openModal()}>
          + Add Section
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((sec) => (
            <div
              key={sec._id}
              className="p-4 border rounded-lg shadow-sm flex flex-col justify-between bg-white"
            >
              <div>
                <h3 className="font-semibold text-base">{sec.section}</h3>
                {sec.content && (
                  <p className="text-sm text-gray-600 mt-2">{sec.content}</p>
                )}
                {sec.links?.length ? (
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    {sec.links.map((link, i) => (
                      <li key={i}>
                        <a
                          href={link.url}
                          target="_blank"
                          className="text-blue-600 hover:underline break-words"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => openModal(sec)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={() => deleteSection(sec._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {sections.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">
              No footer sections found
            </p>
          )}
        </div>
      )}

      {/* Modal */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Footer Section" : "New Footer Section"}
      >
        <div className="space-y-4">
          <Input
            label="Section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            required
          />
          <Textarea
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div>
            <Label>Links</Label>
            <div className="space-y-2">
              {links.map((link, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row gap-2 items-start sm:items-center"
                >
                  <Input
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) => updateLink(i, "label", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => updateLink(i, "url", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeLink(i)}
                    className="w-full sm:w-auto"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={addLink}
              className="mt-3 w-full sm:w-auto"
            >
              + Add Link
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={saveSection}
            >
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}