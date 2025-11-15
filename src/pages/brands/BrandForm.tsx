import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { rest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";

export default function BrandForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [values, setValues] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const data = await rest.get(`/brands/${id}`);
          setValues(data);
        } catch (err) {
          console.error("Failed to load brand:", err);
          toast.error("Failed to load brand:", err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, isEdit]);

  const onChange = (key: string, value: any) =>
    setValues((s) => ({ ...s, [key]: value }));

  const submit = async () => {
    try {
      setSaving(true);

      if (!values.name.trim()) {
        toast.error("Brand name cannot blank");
        return;
      }

      if (isEdit) {
        await rest.patch(`/brands/${id}`, values);
        toast.success("Brand updated successfully");
      } else {
        await rest.post("/brands", values);
        toast.success("Brand created successfully");
      }
      navigate("/brands");
    } catch (err: any) {
      console.error("Save failed:", err?.response?.data || err);
      const msg = err?.response?.data.message || "Save failed brand";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Brand" : "Create Brand"}
      </h2>

      <div className="space-y-3">
        <label className="block">
          <div className="text-sm mb-1">Name</div>
          <input
            type="text"
            className="input"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </label>

        <label className="block">
          <div className="text-sm mb-1">Slug</div>
          <input
            type="text"
            className="input"
            value={values.slug}
            onChange={(e) => onChange("slug", e.target.value)}
          />
        </label>

        <label className="block">
          <div className="text-sm mb-1">Description</div>
          <textarea
            className="input"
            rows={3}
            value={values.description}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => onChange("isActive", e.target.checked)}
          />
          <span>Active</span>
        </label>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={() => navigate("/brands")}
          className="btn"
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
