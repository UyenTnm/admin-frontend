import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { rest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";

export default function CategoryForm({ mode }: { mode?: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === "edit" || !!id;

  const [values, setValues] = useState({
    name: "",
    slug: "",
    parentId: undefined as number | undefined,
  });
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(!!isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load danh sách category cha
    (async () => {
      try {
        const list = await rest.get("/categories");
        setAllCategories(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(" Failed to load categories:", err);
        toast.error("Unable to load category list!");
      }
    })();

    // Nếu là edit thì load dữ liệu hiện tại
    if (isEdit) {
      (async () => {
        try {
          const data = await rest.get(`/categories/${id}`);
          setValues({
            name: data.name ?? "",
            slug: data.slug ?? "",
            parentId: data.parent?.id ?? undefined,
          });
        } catch (err) {
          console.error("Failed to load category:", err);
          toast.error("Unable to load catalogy data!");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEdit, id]);

  const onChange = (key: string, value: any) =>
    setValues((s) => ({ ...s, [key]: value }));

  const submit = async () => {
    try {
      setSaving(true);

      // Validate đơn giản
      if (!values.name.trim()) {
        toast.error("Category name cannot be blank!");
        return;
      }

      const payload = {
        name: values.name,
        slug: values.slug,
        parent: values.parentId ? Number(values.parentId) : undefined,
      };

      if (isEdit) {
        await rest.patch(`/categories/${id}`, payload);
        toast.success("Catalogy updated successfully!");
      } else {
        await rest.post("/categories", payload);
        toast.success("New category created successfully!");
      }

      navigate("/categories");
    } catch (err: any) {
      console.error("Save failed:", err?.response?.data || err);
      const msg =
        err?.response?.data?.message || "Lưu thất bại, vui lòng thử lại!";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-neutral-500 italic">Loading...</div>
    );

  return (
    <Card className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit category" : "Create category"}
      </h2>

      <div className="space-y-3">
        {/* Name */}
        <label className="block">
          <div className="text-sm mb-1">Category name *</div>
          <input
            type="text"
            className="w-full rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </label>

        {/* Slug */}
        <label className="block">
          <div className="text-sm mb-1">Slug</div>
          <input
            type="text"
            className="w-full rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
            value={values.slug}
            onChange={(e) => onChange("slug", e.target.value)}
          />
        </label>

        {/* Parent Category */}
        <label className="block">
          <div className="text-sm mb-1">Parent</div>
          <select
            className="w-full rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
            value={values.parentId ?? ""}
            onChange={(e) =>
              onChange(
                "parentId",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          >
            <option value="">— None —</option>
            {allCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          type="button"
          className="px-4 py-2 rounded-xl border hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onClick={() => navigate("/categories")}
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
      </div>
    </Card>
  );
}
