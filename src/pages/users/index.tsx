import React, { useEffect, useState } from "react";
import axios from "axios";
import UserForm from "@/components/form/UserForm";

const API_URL = "http://localhost:3000/api/users";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  const loadUsers = async () => {
    const res = await axios.get(API_URL);
    setUsers(res.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Delete this user?")) {
      await axios.delete(`${API_URL}/${id}`);
      loadUsers();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <UserForm
        user={selected}
        onSuccess={() => {
          setSelected(null);
          loadUsers();
        }}
      />

      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Role</th>
            <th className="px-3 py-2 text-center">Active</th>
            <th className="px-3 py-2 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t hover:bg-gray-50">
              <td className="px-3 py-2">{u.name}</td>
              <td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2">{u.role}</td>
              <td className="px-3 py-2 text-center">
                {u.isActive ? "yes" : "not"}
              </td>
              <td className="px-3 py-2 text-center space-x-2">
                <button
                  onClick={() => setSelected(u)}
                  className="px-2 py-1 bg-yellow-400 rounded text-white"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(u.id)}
                  className="px-2 py-1 bg-red-500 rounded text-white"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
