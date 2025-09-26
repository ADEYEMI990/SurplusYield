// src/components/admin/SiteNavigation.tsx
"use client";
import { useState } from "react";
import Button from "../common/Button";
import Input from "../common/Input";
import Dialog from "../common/Dialog";
import Loader from "../common/Loader";
import type { INavigation } from "../../types/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

interface Props {
  navItems: INavigation[];
  loading: boolean;
  error: string;
  onCreate: (data: Partial<INavigation>) => void;
  onUpdate: (id: string, data: Partial<INavigation>) => void;
  onDelete: (id: string) => void;
  onReorder: (items: INavigation[]) => void;
}

export default function SiteNavigation({
  navItems,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
}: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState<Partial<INavigation>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

  const openCreate = () => {
    setForm({});
    setIsCreateOpen(true);
  };

  const openEdit = (item: INavigation) => {
    setEditingId(item._id);
    setForm(item);
    setIsEditOpen(true);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(navItems);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updated = reordered.map((item, idx) => ({
      ...item,
      order: idx,
    }));

    onReorder(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h1 className="text-lg sm:text-xl font-bold">Navigation</h1>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          + Add Navigation Item
        </Button>
      </div>

      {/* ✅ Mobile Cards */}
      <div className="sm:hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="nav-list-mobile">
            {(provided) => (
              <div
                className="space-y-3"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {navItems.map((item, index) => (
                  <Draggable
                    key={item._id}
                    draggableId={item._id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-4 border rounded-lg shadow-sm bg-white ${
                          snapshot.isDragging ? "bg-blue-50" : ""
                        }`}
                      >
                        <p className="font-semibold">{item.label}</p>
                        <p className="text-sm text-gray-600 break-all">
                          {item.link}
                        </p>
                        <p className="text-sm mt-1">
                          Order: <span className="font-medium">{item.order}</span>
                        </p>
                        <p className="text-sm">
                          Active:{" "}
                          <span
                            className={
                              item.isActive ? "text-green-600" : "text-red-500"
                            }
                          >
                            {item.isActive ? "Yes" : "No"}
                          </span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2 mt-3">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEdit(item)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(item._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* ✅ Desktop Table */}
      <div className="hidden sm:block overflow-x-auto border rounded-lg">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="nav-list-desktop">
            {(provided) => (
              <table
                className="w-full border-collapse text-sm"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-2">Label</th>
                    <th className="px-4 py-2">Link</th>
                    <th className="px-4 py-2">Order</th>
                    <th className="px-4 py-2">Active</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {navItems.map((item, index) => (
                    <Draggable
                      key={item._id}
                      draggableId={item._id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`border-t ${
                            snapshot.isDragging ? "bg-blue-50" : ""
                          }`}
                        >
                          <td className="px-4 py-2">{item.label}</td>
                          <td className="px-4 py-2 break-all">{item.link}</td>
                          <td className="px-4 py-2">{item.order}</td>
                          <td className="px-4 py-2">
                            {item.isActive ? "✅" : "❌"}
                          </td>
                          <td className="px-4 py-2 flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openEdit(item)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => onDelete(item._id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Create Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Navigation Item"
      >
        <div className="space-y-3">
          <Input
            label="Label"
            value={form.label || ""}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          />
          <Input
            label="Link"
            value={form.link || ""}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
          <Input
            label="Order"
            type="number"
            value={form.order ?? 0}
            onChange={(e) =>
              setForm({ ...form, order: Number(e.target.value) })
            }
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
            />
            Active
          </label>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onCreate(form);
                setIsCreateOpen(false);
              }}
            >
              Create
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Navigation Item"
      >
        <div className="space-y-3">
          <Input
            label="Label"
            value={form.label || ""}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          />
          <Input
            label="Link"
            value={form.link || ""}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
          <Input
            label="Order"
            type="number"
            value={form.order ?? 0}
            onChange={(e) =>
              setForm({ ...form, order: Number(e.target.value) })
            }
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
            />
            Active
          </label>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingId) onUpdate(editingId, form);
                setIsEditOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
