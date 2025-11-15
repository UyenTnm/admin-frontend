import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { rest } from "@/lib/api";
import { PageFade } from "@/components/ui/PageFade";
import toast from "react-hot-toast";

export default function UserForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    isActive: true,
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  /* -------------------- LOAD USER (EDIT MODE) -------------------- */
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const data = await rest.get(`/users/${id}`);
        setValues({
          name: data.name ?? "",
          email: data.email ?? "",
          password: "", // không hiển thị password cũ (bảo mật)
          role: data.role ?? "user",
          isActive: data.isActive ?? true,
        });
      } catch (error) {
        console.error("Failed to load user:", error);
        toast.error("Unable to load user data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  /* -------------------- HANDLERS -------------------- */
  const onChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = { ...values };

      // Nếu password rỗng, xóa khỏi payload (tránh 400 Bad Request)
      if (!payload.password || payload.password.trim() === "") {
        delete payload.password;
      }

      console.log("Sending update payload:", payload);

      if (isEdit) {
        await rest.patch(`/users/${id}`, payload);
        toast.success("User update successful!");
      } else {
        await rest.post("/users", payload);
        toast.success("New user created successfully!");
      }

      navigate("/users");
    } catch (error: any) {
      console.error("Save failed:", error);
      const msg =
        error?.response?.data?.message ||
        "Save failed, please check again.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /* -------------------- UI -------------------- */
  if (loading)
    return (
      <div className="p-6 text-center text-neutral-500 italic">
        Loading user data...
      </div>
    );

  return (
    <PageFade>
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">
          {isEdit ? "Edit User" : "Create User"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 dark:bg-neutral-800"
              value={values.name}
              onChange={(e) => onChange("name", e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              className="w-full border rounded-md px-3 py-2 dark:bg-neutral-800"
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
              required
            />
          </div>

          {/* Password (chỉ hiện khi tạo mới) */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Password *
              </label>
              <input
                type="password"
                className="w-full border rounded-md px-3 py-2 dark:bg-neutral-800"
                value={values.password}
                onChange={(e) => onChange("password", e.target.value)}
                required
              />
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="w-full border rounded-md px-3 py-2 dark:bg-neutral-800"
              value={values.role}
              onChange={(e) => onChange("role", e.target.value)}
            >
              <option value="user">User</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Active */}
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(e) => onChange("isActive", e.target.checked)}
            />
            <span>Active</span>
          </label>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="px-4 py-2 border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70"
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </PageFade>
  );
}
