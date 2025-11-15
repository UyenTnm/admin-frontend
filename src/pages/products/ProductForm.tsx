import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "@/styles/react-quill-custom.css";
import { Plus, Trash2 } from "lucide-react";

const BASE_URL = "http://localhost:3000";

export default function ProductForm({ mode }: { mode?: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPreorder, setIsPreorder] = useState(false);
  const [preorderDeadline, setPreorderDeadline] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const isEdit = mode === "edit" || !!id;

  const [values, setValues] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    currency: "USD",
    categoryId: "",
    brandId: "",
    isActive: true,
    imageUrl: "",
  });

  const [detail, setDetail] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(!!isEdit);
  const [saving, setSaving] = useState(false);
  // Variant State
  const [variants, setVariants] = useState<any[]>([]);
  const [variantForm, setVariantForm] = useState({
    name: "",
    colorHex: "",
    extraPrice: 0,
  });

  const quillRef = useRef<ReactQuill | null>(null);

  const onChange = (key: string, value: any) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    (async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get("/categories"),
          api.get("/brands"),
        ]);
        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);

        if (isEdit && id) {
          const { data } = await api.get(`/products/${id}`);

          // Đảm bảo backend trả đủ dữ liệu (images, detail, category, brand)
          setValues({
            name: data.name ?? "",
            description: data.description ?? "",
            price: data.price ?? 0,
            stock: data.stock ?? 0,
            currency: data.currency ?? "USD",
            categoryId: data.category?.id?.toString() ?? "",
            brandId: data.brand?.id?.toString() ?? "",
            isActive: data.isActive ?? data.status === "ACTIVE",
            imageUrl: data.image
              ? data.image.startsWith("http")
                ? data.image
                : `${BASE_URL}${data.image}`
              : "",
          });
          // Bổ sung đoạn xử lý preorder ở đây
          setIsPreorder(Boolean(data.isPreorder));
          setPreorderDeadline(
            data.preorderDeadline
              ? new Date(data.preorderDeadline).toISOString().split("T")[0]
              : ""
          );
          setEstimatedDelivery(
            data.estimatedDelivery
              ? new Date(data.estimatedDelivery).toISOString().split("T")[0]
              : ""
          );

          // Giữ nội dung detail, fallback an toàn
          setDetail(
            data.detail && data.detail.trim() !== "" ? data.detail : "<p></p>"
          );

          // Giữ lại gallery cũ (không mất khi không upload mới)
          if (Array.isArray(data.images) && data.images.length > 0) {
            setExistingGallery(
              data.images
                .map((img: any) => {
                  const url = img.url || img.path || img.imageUrl;
                  if (!url) return "";
                  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
                })
                .filter(Boolean)
            );
          } else {
            setExistingGallery([]);
          }
          // === Load product variants ===
          try {
            const { data: variantData } = await api.get(
              `/variants/product/${id}`
            );
            setVariants(Array.isArray(variantData) ? variantData : []);
          } catch (err) {
            console.warn("No variants found for product", id);
          }
        }
      } catch (err) {
        console.error("Failed to load product data:", err);
        toast.error("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Gộp chứ không ghi đè
    const newFiles = [...galleryFiles, ...files].slice(0, 15);
    setGalleryFiles(newFiles);

    // Giữ lại preview cũ
    setGalleryPreview(newFiles.map((f) => URL.createObjectURL(f)));
  };

  // === Variant CRUD ===
  // Add new variant
  const addVariant = async () => {
    if (!variantForm.name.trim())
      return toast.error("Please enter variant name.");

    try {
      const payload = {
        productId: Number(id),
        name: variantForm.name,
        colorHex: variantForm.colorHex,
        extraPrice: Number(variantForm.extraPrice) || 0,
        salePrice: Number(values.price) + Number(variantForm.extraPrice || 0),
        costPrice: Number(values.price),
        stock: Number(values.stock) || 0,
      };
      const { data } = await api.post("/variants", payload);
      setVariants((prev) => [...prev, data]);
      setVariantForm({ name: "", colorHex: "", extraPrice: 0 });
      toast.success("Variant added!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add variant");
    }
  };

  // Delete variant
  const deleteVariant = async (vid: number) => {
    if (!confirm("Delete this variant?")) return;
    try {
      await api.delete(`/variants/${vid}`);
      setVariants((prev) => prev.filter((v) => v.id !== vid));
      toast.success("Deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const submit = async () => {
    try {
      setSaving(true);
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("detail", detail || "");
      formData.append("price", String(values.price));
      formData.append("stock", String(values.stock));
      formData.append("isPreorder", String(isPreorder));
      formData.append("currency", values.currency);
      formData.append("isActive", String(values.isActive));
      if (values.categoryId) formData.append("categoryId", values.categoryId);
      if (values.brandId) formData.append("brandId", values.brandId);
      if (image) formData.append("image", image);
      galleryFiles.forEach((file) => formData.append("gallery", file));

      if (isPreorder) {
        formData.append("groupbuyType", "preorder");
        if (preorderDeadline)
          formData.append(
            "preorderDeadline",
            new Date(preorderDeadline).toISOString()
          );
        if (estimatedDelivery)
          formData.append(
            "estimatedDelivery",
            new Date(estimatedDelivery).toISOString()
          );
      } else {
        formData.append("groupbuyType", "normal");
        formData.append("stock", String(values.stock));
      }
      if (isEdit && id) {
        await api.patch(`/products/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated successfully!");
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product created successfully!");
      }
      navigate("/products");
    } catch {
      toast.error("Save failed!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <Card className="max-w-4xl mx-auto p-6 space-y-4 border rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Product" : "Create Product"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <label>
          <span className="text-sm">Name *</span>
          <input
            className="input"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </label>

        {/* Brand */}
        <label>
          <span className="text-sm">Brand</span>
          <select
            className="input"
            value={values.brandId}
            onChange={(e) => onChange("brandId", e.target.value)}
          >
            <option value="">— Select Brand —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        {/* Category */}
        <label>
          <span className="text-sm">Category</span>
          <select
            className="input"
            value={values.categoryId}
            onChange={(e) => onChange("categoryId", e.target.value)}
          >
            <option value="">— Select Category —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {/* Price */}
        <label>
          <span className="text-sm">Price *</span>
          <input
            type="number"
            className="input"
            value={values.price}
            onChange={(e) => onChange("price", e.target.value)}
          />
        </label>

        {/* Stock OR Preorder Mode */}
        {!isPreorder ? (
          // === STOCK MODE ===
          <label>
            <span className="text-sm">Stock *</span>
            <input
              type="number"
              className="input"
              value={values.stock}
              onChange={(e) => onChange("stock", e.target.value)}
              min={0}
            />
          </label>
        ) : (
          // === PREORDER MODE ===
          <div className="space-y-3 md:col-span-2 border p-3 rounded-xl bg-gray-50/50 dark:bg-neutral-900/50">
            <label className="block text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                Preorder Deadline *
              </span>
              <input
                type="date"
                value={preorderDeadline}
                onChange={(e) => setPreorderDeadline(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
              />
            </label>

            <label className="block text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                Estimated Delivery *
              </span>
              <input
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
              />
            </label>
          </div>
        )}

        {/* Toggle Preorder */}
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={isPreorder}
            onChange={(e) => setIsPreorder(e.target.checked)}
            className="rounded"
          />
          <span className="text-neutral-600 dark:text-neutral-400">
            Enable Preorder Mode
          </span>
        </label>

        {/* Description */}
        <label className="md:col-span-2">
          <span className="text-sm">Short Description</span>
          <textarea
            rows={3}
            className="input"
            value={values.description}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </label>

        {/* WYSIWYG */}
        <div className="md:col-span-2">
          <span className="text-sm block mb-2">Detailed Product</span>
          {!loading && (
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={detail}
              onChange={setDetail}
              modules={{
                toolbar: [
                  ["bold", "italic", "underline", "strike"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link", "image"],
                  ["clean"],
                ],
              }}
              className="min-h-[200px] bg-white dark:bg-neutral-900 rounded-xl"
            />
          )}
        </div>

        {/* Main Image */}
        <div>
          <span className="text-sm block mb-1">Main Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setImage(file);
              if (file) {
                // Tạo preview tạm mà không mất ảnh cũ
                const previewUrl = URL.createObjectURL(file);
                setValues((prev) => ({ ...prev, imageUrl: previewUrl }));
              }
            }}
          />
          {values.imageUrl && (
            <img
              src={values.imageUrl}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded-lg border"
            />
          )}
        </div>

        {/* Gallery */}
        <div className="md:col-span-2">
          <span className="text-sm block mb-1">
            Product Gallery (Multiple Images)
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryChange}
          />
          <p className="text-xs text-gray-500 mt-1">
            You can upload up to 15 images. ({galleryFiles.length}/15 used)
          </p>

          {/* Combined Gallery (old + new) */}
          {(existingGallery.length > 0 || galleryPreview.length > 0) && (
            <div className="flex flex-wrap gap-3 mt-3">
              {/* Ảnh cũ từ DB */}
              {existingGallery.map((src, idx) => (
                <div key={`old-${idx}`} className="relative group">
                  <img
                    src={src}
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      // Cho phép xóa ảnh cũ trên giao diện (tùy backend xử lý)
                      setExistingGallery((prev) =>
                        prev.filter((_, i) => i !== idx)
                      );
                    }}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs hidden group-hover:block"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Ảnh mới vừa chọn */}
              {galleryPreview.map((src, idx) => (
                <div key={`new-${idx}`} className="relative group">
                  <img
                    src={src}
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryPreview((prev) =>
                        prev.filter((_, i) => i !== idx)
                      );
                      setGalleryFiles((prev) =>
                        prev.filter((_, i) => i !== idx)
                      );
                    }}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs hidden group-hover:block"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button onClick={() => navigate("/products")} className="btn">
          Cancel
        </button>
        <button onClick={submit} disabled={saving} className="btn-primary">
          {saving ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
      </div>

      {/* === PRODUCT VARIANTS === */}
      <div className="mt-10 border-t pt-6">
        <h3 className="text-lg font-semibold mb-3">Product Variants</h3>

        {/* Add Variant Form */}
        <div className="flex flex-wrap gap-3 items-end mb-5">
          <div>
            <label className="text-sm block">Name *</label>
            <input
              className="input"
              placeholder="e.g. Bronze"
              value={variantForm.name}
              onChange={(e) =>
                setVariantForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-sm block">Color</label>
            <input
              type="color"
              className="input w-16 h-10"
              value={variantForm.colorHex}
              onChange={(e) =>
                setVariantForm((prev) => ({
                  ...prev,
                  colorHex: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="text-sm block">Extra Price (+)</label>
            <input
              type="number"
              className="input"
              placeholder="0"
              value={variantForm.extraPrice}
              onChange={(e) =>
                setVariantForm((prev) => ({
                  ...prev,
                  extraPrice: Number(e.target.value) || 0,
                }))
              }
            />
          </div>

          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 bg-black text-white px-3 py-2 rounded-md hover:bg-neutral-800 transition"
          >
            <Plus size={16} /> Add Variant
          </button>
        </div>

        {/* Variant List */}
        {variants.length > 0 ? (
          <table className="w-full border border-neutral-300 text-sm">
            <thead>
              <tr className="bg-neutral-100 dark:bg-neutral-800">
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Color</th>
                <th className="px-3 py-2 text-right">Extra Price</th>
                <th className="px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr
                  key={v.id}
                  className="border-t border-neutral-200 dark:border-neutral-700"
                >
                  <td className="px-3 py-2">{v.name}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: v.colorHex }}
                      ></span>
                      {v.colorHex}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {v.extraPrice?.toLocaleString() ?? 0}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => deleteVariant(v.id)}
                      className="text-red-600 hover:underline flex items-center gap-1 justify-center mx-auto"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-neutral-500">No variants added yet.</p>
        )}
      </div>
    </Card>
  );
}
