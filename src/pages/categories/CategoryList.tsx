import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function CategoryList() {
  const [categories, setCategories] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      const list = Array.isArray(data) ? data : [];
      setCategories(list);
      setFiltered(list);
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted!");
      loadCategories();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete category");
    }
  };

  /* -------------------- Search -------------------- */
  useEffect(() => {
    let result = [...categories];
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.slug?.toLowerCase().includes(q) ||
          c.parent?.name?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, categories]);

  /* -------------------- Render -------------------- */
  if (loading)
    return (
      <div className="flex items-center justify-center h-40 text-neutral-500">
        <Loader2 className="animate-spin w-5 h-5 mr-2" />
        Loading categories...
      </div>
    );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4">
        <h1 className="text-xl font-semibold">Categories</h1>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <input
            placeholder="Search..."
            className="border rounded-md px-3 py-1.5 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Add */}
          <Link
            to="/categories/create"
            className="rounded-md bg-black text-white px-3 py-1.5 text-sm hover:bg-neutral-800 transition"
          >
            + Add Category
          </Link>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border border-neutral-300 dark:border-neutral-700 text-sm">
        <thead>
          <tr className="bg-neutral-100 dark:bg-neutral-800">
            <th className="text-left px-3 py-2">#</th>
            <th className="text-left px-3 py-2">Name</th>
            <th className="text-left px-3 py-2">Parent</th>
            <th className="text-left px-3 py-2">Slug</th>
            <th className="text-center px-3 py-2 w-28">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-6 text-neutral-500">
                No categories found.
              </td>
            </tr>
          ) : (
            filtered.map((c, i) => (
              <tr
                key={c.id}
                className="border-t border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition"
              >
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{c.name}</td>
                <td className="px-3 py-2">{c.parent?.name || "—"}</td>
                <td className="px-3 py-2">{c.slug}</td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => navigate(`/categories/edit/${c.id}`)}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
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
  );
}
