import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  /* -------------------- Load Data -------------------- */
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await api.get("/products");
      const list = Array.isArray(data) ? data : [];
      setProducts(list);
      setFiltered(list);
    } catch (err) {
      console.error("Failed to load products:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Delete -------------------- */
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete product "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted!");
      loadProducts();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete product");
    }
  };

  /* -------------------- Toggle Active Status -------------------- */
  const toggleStatus = async (id: number) => {
    try {
      await api.patch(`/products/${id}/toggle`);
      toast.success("Status updated!");
      loadProducts();
    } catch (err) {
      console.error("Toggle failed:", err);
      toast.error("Failed to update status");
    }
  };

  /* -------------------- Search & Filter -------------------- */
  useEffect(() => {
    let result = [...products];

    // Lọc theo tên hoặc brand
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.name?.toLowerCase().includes(q)
      );
    }

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      result = result.filter((p) => p.isActive === isActive);
    }

    setFiltered(result);
  }, [search, statusFilter, products]);

  /* -------------------- Render -------------------- */
  if (loading)
    return (
      <div className="flex items-center justify-center h-40 text-neutral-500">
        <Loader2 className="animate-spin w-5 h-5 mr-2" />
        Loading products...
      </div>
    );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4">
        <h1 className="text-xl font-semibold">Products</h1>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <input
            placeholder="Search..."
            className="border rounded-md px-3 py-1.5 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Filter */}
          <select
            className="border rounded-md px-3 py-1.5 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Add new */}
          <Link
            to="/products/new"
            className="rounded-md bg-black text-white px-3 py-1.5 text-sm hover:bg-neutral-800 transition"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border border-neutral-300 dark:border-neutral-700 text-sm">
        <thead>
          <tr className="bg-neutral-100 dark:bg-neutral-800">
            <th className="text-left px-3 py-2">#</th>
            <th className="text-left px-3 py-2">Name</th>
            <th className="text-left px-3 py-2">Brand</th>
            <th className="text-left px-3 py-2">Price</th>
            <th className="text-left px-3 py-2">Stock</th>
            <th className="text-left px-3 py-2">Availability</th>
            <th className="text-left px-3 py-2">Status</th>
            <th className="text-center px-3 py-2 w-28">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-6 text-neutral-500">
                No products found.
              </td>
            </tr>
          ) : (
            filtered.map((p, i) => (
              <tr
                key={p.id}
                className="border-t border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition"
              >
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2">{p.brand?.name || "—"}</td>
                <td className="px-3 py-2">
                  {p.price?.toLocaleString()} {p.currency}
                </td>
                <td className="px-3 py-2">{p.stock}</td>

                {/* Toggle Status */}
                <td className="px-3 py-2 text-center">
                  <span
                    onClick={() => toggleStatus(p.id)}
                    className={`cursor-pointer px-2 py-1 text-xs font-semibold rounded-full ${
                      p.status === "ACTIVE"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {p.status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Availability */}
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full 
                    ${
                      p.availability === "IN_STOCK"
                        ? "bg-green-100 text-green-700"
                        : p.availability === "PREORDER"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {p.availability
                      ? p.availability
                          .replace("_", " ")
                          .replace("IN STOCK", "In Stock")
                          .replace("PREORDER", "Preorder")
                          .replace("OUT OF STOCK", "Out of Stock")
                      : "Unknown"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => navigate(`/products/${p.id}`)}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
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
