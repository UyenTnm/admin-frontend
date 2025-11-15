import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { Card } from "../ui/Card";
import { option } from "framer-motion/client";

export default function ProductForm_legacy() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // Form values
  const [values, setValues] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    currency: "USD",
    categoryId: "",
    brandId: "",
    isActive: true,
  });

  // Files
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);

  // Categories
  const [categories, setCategories] = useState<any[]>([]);

  // brand
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data: catData } = await api.get("/categories");
        setCategories(Array.isArray(catData) ? catData : []);

        const { data: brandData } = await api.get("/brands");
        setBrands(Array.isArray(brandData) ? brandData : []);
      } catch {
        setCategories([]);
        setBrands([]);
      }
    })();
  }, []);

  const onChange = (key: string, value: any) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    try {
      setSaving(true);

      const hasFiles = image || video;

      if (hasFiles) {
        const fd = new FormData();
        fd.append("name", values.name);
        fd.append("description", values.description || "");
        fd.append("price", String(values.price));
        fd.append("stock", String(values.stock));
        fd.append("currency", values.currency || "USD");
        if (values.categoryId)
          fd.append("categoryId", String(values.categoryId));
        fd.append("isActive", String(values.isActive));
        if (image) fd.append("image", image);
        if (video) fd.append("video", video);
        await api.post("/products", fd);
      } else {
        const payload = {
          ...values,
          price: Number(values.price),
          stock: Number(values.stock),
          brandId: values.brandId ? Number(values.brandId) : undefined,
        };
        await api.post("/products", payload);
      }

      alert("Product created!");
      navigate("/products");
    } catch (err: any) {
      console.error("Create product error:", err?.response?.data || err);
      alert(err?.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Create Product</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm">Name *</span>
          <input
            className="w-full border rounded p-2"
            placeholder="Product name"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm">Price *</span>
          <input
            type="number"
            min="0"
            className="w-full border rounded p-2"
            value={values.price}
            onChange={(e) => onChange("price", Number(e.target.value))}
          />
        </label>

        <label className="block">
          <span className="text-sm">Stock *</span>
          <input
            type="number"
            min="0"
            className="w-full border rounded p-2"
            value={values.stock}
            onChange={(e) => onChange("stock", Number(e.target.value))}
          />
        </label>

        <label className="block">
          <span className="text-sm">Currency</span>
          <input
            className="w-full border rounded p-2"
            value={values.currency}
            onChange={(e) => onChange("currency", e.target.value)}
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm">Description</span>
          <textarea
            rows={3}
            className="w-full border rounded p-2"
            value={values.description}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm">Category</span>
          <select
            className="w-full border rounded p-2"
            value={values.categoryId}
            onChange={(e) => onChange("categoryId", e.target.value)}
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Brand</span>
          <select
            className="w-full border rounded p-2"
            value={values.categoryId}
            onChange={(e) => onChange("brandId", e.target.value)}
          >
            <option value="">- None -</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => onChange("isActive", e.target.checked)}
          />
          <span>Active</span>
        </label>

        <label className="block">
          <span className="text-sm">Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </label>

        <label className="block">
          <span className="text-sm">Video</span>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          className="px-4 py-2 rounded-xl border hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onClick={() => navigate(-1)}
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Create"}
        </button>
      </div>
    </Card>
  );
}
