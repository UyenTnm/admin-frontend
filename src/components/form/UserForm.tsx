import React, { useEffect, useState } from "react";
import { rest } from "@/lib/api";
import toast from "react-hot-toast";

export default function UserForm({ user = null, onSuccess }: any) {
  const isEdit = Boolean(user?.id);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setValues({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "user",
        isActive: user.isActive ?? true,
      });
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload: any = { ...values };
      if (!payload.password) delete payload.password;

      if (isEdit) {
        await rest.patch(`/users/${user.id}`, payload);
        toast.success("User updated");
      } else {
        await rest.post("/users", payload);
        toast.success("User created");
      }

      setOpen(false);
      onSuccess && onSuccess();
    } catch (err) {
      toast.error("Save failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="bg-white dark:bg-[var(--card)] rounded-xl w-full max-w-md p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "Edit User" : "Create User"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              className="w-full p-2 rounded border"
              value={values.name}
              onChange={(e) =>
                setValues((v) => ({ ...v, name: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full p-2 rounded border"
              value={values.email}
              onChange={(e) =>
                setValues((v) => ({ ...v, email: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full p-2 rounded border"
              value={values.password}
              placeholder={
                isEdit ? "Leave blank to keep same password" : "New password"
              }
              onChange={(e) =>
                setValues((v) => ({ ...v, password: e.target.value }))
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="u_active"
              checked={values.isActive}
              onChange={(e) =>
                setValues((v) => ({ ...v, isActive: e.target.checked }))
              }
            />
            <label htmlFor="u_active">Active</label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded bg-gray-200"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-blue-300"
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
