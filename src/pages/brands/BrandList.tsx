import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { rest } from "@/lib/api";
import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { PageFade } from "@/components/ui/PageFade";

export default function BrandList() {
  const [brands, setBrands] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  /* -------------------- Fetch Brands -------------------- */
  const fetchBrands = async () => {
    try {
      const data = await rest.get("/brands");
      setBrands(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  /* -------------------- Delete Brand -------------------- */
  const handleDelete = async () => {
    try {
      await rest.delete(`/brands/${selected.id}`);
      setConfirmOpen(false);
      fetchBrands();
    } catch (error) {
      console.error("Failed to delete brand:", error);
    }
  };

  /* -------------------- Toggle Active -------------------- */
  const handleToggle = async (id: number) => {
    try {
      await rest.patch(`/brands/${id}/toggle`);
      fetchBrands();
    } catch (error) {
      console.error("Failed to toggle brand:", error);
    }
  };

  /* -------------------- Search & Filter -------------------- */
  useEffect(() => {
    if (search.trim() === "") {
      setFiltered(brands);
      return;
    }

    const q = search.toLowerCase();
    const result = brands.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) || b.slug?.toLowerCase().includes(q)
    );
    setFiltered(result);
  }, [search, brands]);

  /* -------------------- UI -------------------- */
  if (loading) return <div>Loading brands...</div>;

  return (
    <PageFade>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold">Brand Management</h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search brand..."
            className="border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:bg-neutral-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Clear Button */}
          {search && (
            <button
              onClick={() => setSearch("")}
              className="border rounded-lg px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Clear
            </button>
          )}

          {/* Add Button */}
          <Link
            to="/brands/new"
            className="px-4 py-1.5 bg-black text-white rounded-lg hover:bg-neutral-800 text-sm transition"
          >
            + Add Brand
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="min-w-full bg-white dark:bg-neutral-900">
          <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 uppercase text-sm">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Slug</th>
              <th className="py-3 px-4 text-center">Active</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-6 text-neutral-500 dark:text-neutral-400"
                >
                  No brands found.
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                >
                  <td className="py-2 px-4">{b.name}</td>
                  <td className="py-2 px-4">{b.slug}</td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => handleToggle(b.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        b.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {b.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-2 px-4 text-center space-x-2">
                    <Link
                      to={`/brands/${b.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        setSelected(b);
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Brand"
        description={`Are you sure you want to delete "${selected?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </PageFade>
  );
}
