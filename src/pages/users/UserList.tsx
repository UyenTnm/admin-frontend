import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { rest } from "../../lib/api";
import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { PageFade } from "@/components/ui/PageFade";

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* -------------------- Fetch users -------------------- */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await rest.get(`/users`);
      const list = Array.isArray(res) ? res : [];
      setUsers(list);
      setFiltered(list);
    } catch (err: any) {
      console.error("Failed to load user:", err);
      setError("Failed to load user list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* -------------------- Delete -------------------- */
  const handleDelete = async () => {
    try {
      await rest.delete(`/users/${selectedUser.id}`);
      setConfirmOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  /* -------------------- Toggle Active -------------------- */
  const handleToggle = async (id: number) => {
    try {
      await rest.patch(`/users/${id}/toggle`);
      fetchUsers();
    } catch (err) {
      console.error("Failed change status:", err);
    }
  };

  /* -------------------- Search + Role Filter -------------------- */
  useEffect(() => {
    let result = [...users];

    // Search theo name / email / role
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.role?.toLowerCase().includes(q)
      );
    }

    // Filter theo role
    if (roleFilter !== "all") {
      result = result.filter(
        (u) => u.role?.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    setFiltered(result);
  }, [search, roleFilter, users]);

  /* -------------------- UI -------------------- */
  return (
    <PageFade>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold">Users Management</h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search name, email, or role..."
            className="border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:bg-neutral-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none dark:bg-neutral-900"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="user">User</option>
          </select>

          {/* Clear Search */}
          {search && (
            <button
              onClick={() => setSearch("")}
              className="border rounded-lg px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Clear
            </button>
          )}

          {/* Add New */}
          <Link
            to="/users/new"
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition"
          >
            + Add
          </Link>
        </div>
      </div>

      {/* Loading & Error */}
      {loading ? (
        <p className="text-gray-500 italic">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <table className="min-w-full bg-white dark:bg-neutral-900">
            <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 uppercase text-sm">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-center">Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-gray-500 py-6 italic"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u: any) => (
                  <tr
                    key={u.id}
                    className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                  >
                    <td className="py-2 px-4">{u.name}</td>
                    <td className="py-2 px-4">{u.email}</td>
                    <td className="py-2 px-4 text-center capitalize">
                      {u.role}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => handleToggle(u.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          u.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.isActive ? "Active" : "Blocked"}
                      </button>
                    </td>
                    <td className="py-2 px-4 text-center space-x-2">
                      <Link
                        to={`/users/${u.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setConfirmOpen(true);
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Do you want to delete user "${selectedUser?.name}" ?`}
      />
    </PageFade>
  );
}
