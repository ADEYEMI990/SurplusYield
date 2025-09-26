// src/pages/admin/SiteNavigation.tsx
"use client";
import  { useEffect, useState } from "react";
import API from "../../lib/api";
import SiteNavigation from "../../components/admin/SiteNavigation";
import type{ INavigation } from "../../types/navigation";

export default function SiteNavigationPage() {
  const [navItems, setNavItems] = useState<INavigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNavItems = async () => {
    try {
      setLoading(true);
      const res = await API.get("/site/navigation");
      setNavItems(res.data);
    } catch {
      setError("Failed to fetch navigation items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNavItems();
  }, []);

  const handleCreate = async (data: Partial<INavigation>) => {
    try {
      const res = await API.post("/site/navigation", data);
      setNavItems((prev) => [...prev, res.data]);
    } catch {
      alert("Failed to create navigation item");
    }
  };

  const handleUpdate = async (id: string, data: Partial<INavigation>) => {
    try {
      const res = await API.put(`/site/navigation/${id}`, data);
      setNavItems((prev) =>
        prev.map((item) => (item._id === id ? res.data : item))
      );
    } catch {
      alert("Failed to update navigation item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await API.delete(`/site/navigation/${id}`);
      setNavItems((prev) => prev.filter((item) => item._id !== id));
    } catch {
      alert("Failed to delete navigation item");
    }
  };

  const handleReorder = async (items: INavigation[]) => {
    setNavItems(items); // update UI immediately
    try {
      // bulk update in backend
      await Promise.all(
        items.map((item) =>
          API.put(`/site/navigation/${item._id}`, { order: item.order })
        )
      );
    } catch {
      alert("Failed to save new order");
      fetchNavItems(); // rollback
    }
  };

  return (
    <div className="p-4">
      <SiteNavigation
        navItems={navItems}
        loading={loading}
        error={error}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />
    </div>
  );
}
