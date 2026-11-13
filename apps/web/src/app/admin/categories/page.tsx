// apps/web/src/app/admin/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import type { CategoryResponse } from "@/lib/types";

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .categories()
      .then(setCategories)
      .catch((err) => toast(err instanceof Error ? err.message : "Could not load categories.", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  function openCreate() {
    setModal("create");
    setName("");
    setEditing(null);
  }

  function openEdit(c: CategoryResponse) {
    setModal("edit");
    setName(c.name);
    setEditing(c);
  }

  function closeModal() {
    setModal(null);
    setName("");
    setEditing(null);
  }

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (modal === "create") {
        const created = await adminApi.createCategory(name.trim());
        setCategories((prev) => [...prev, created]);
        toast("Category created.", "success");
      } else if (editing) {
        const updated = await adminApi.updateCategory(editing.id, name.trim());
        setCategories((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
        toast("Category updated.", "success");
      }
      closeModal();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this category?")) return;
    try {
      await adminApi.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast("Deleted.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not delete.", "error");
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
          Categories
        </h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-[#E8F44A] text-zinc-900 text-sm font-semibold min-h-[44px]"
        >
          + New
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-5 py-3.5 rounded-xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div>
                <p className="font-medium" style={{ color: "var(--text)" }}>{c.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>/{c.slug}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(c)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-medium min-h-[36px]"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => del(c.id)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-medium text-red-500 border-red-200 dark:border-red-900 min-h-[36px]"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={closeModal}
        title={modal === "create" ? "New category" : "Edit category"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Name</label>
            <input
              type="text"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              autoFocus
              className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={closeModal}
              className="flex-1 h-10 rounded-xl border text-sm min-h-[44px]"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 h-10 rounded-xl bg-[#E8F44A] text-zinc-900 text-sm font-semibold disabled:opacity-60 min-h-[44px]"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}