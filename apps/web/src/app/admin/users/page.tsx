// apps/web/src/app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { useToast } from "@/components/Toast";
import { formatDate } from "@/lib/money";
import type { AdminUserResponse } from "@/lib/types";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    adminApi.users().then((data) => setUsers(data.content)).finally(() => setLoading(false));
  }, []);

  async function toggleStatus(u: AdminUserResponse) {
    const next = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setUpdating(u.id);
    try {
      await adminApi.updateUserStatus(u.id, next);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: next } : x)));
      toast(`User ${next.toLowerCase()}.`, "success");
    } catch {
      toast("Failed.", "error");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
        Users
      </h1>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: `1px solid var(--border)` }}>
                {["Name", "Email", "Role", "Joined", "Status", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: `1px solid var(--border)`, background: "var(--bg)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text)" }}>{u.name}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === "ADMIN" ? "accent" : u.role === "VENDOR" ? "success" : "default"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status === "ACTIVE" ? "success" : "danger"}>{u.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== "ADMIN" && (
                      <button
                        onClick={() => toggleStatus(u)}
                        disabled={updating === u.id}
                        className="px-3 py-1.5 rounded-lg border text-xs font-medium disabled:opacity-60"
                        style={{ borderColor: "var(--border)", color: "var(--text)" }}
                      >
                        {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}