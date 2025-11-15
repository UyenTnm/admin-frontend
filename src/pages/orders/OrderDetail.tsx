import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/format";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* -------------------- Fetch order -------------------- */
  const fetchOrder = async () => {
    try {
      const data = await rest.get(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      toast.error("Không thể tải đơn hàng.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Update status -------------------- */
  const updateStatus = async (status: string) => {
    try {
      setSaving(true);
      await rest.patch(`/orders/${id}/status`, { status });
      toast.success("Cập nhật trạng thái thành công!");
      fetchOrder();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Không thể cập nhật trạng thái.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  /* -------------------- UI -------------------- */
  if (loading)
    return <div className="p-6 text-center">Loading order details...</div>;

  if (!order)
    return (
      <div className="p-6 text-center text-gray-500">Order not found.</div>
    );

  return (
    <Card className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        <button
          onClick={() => navigate("/orders")}
          className="px-4 py-2 rounded-md border hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Back
        </button>
      </div>

      {/* Basic Info */}
      <div>
        <p>
          <strong>User:</strong> {order.user?.email || "—"}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span className="uppercase text-blue-600">{order.status}</span>
        </p>

        {/* Format currency cho subtotal, shipping, total */}
        <div className="mt-2 space-y-1 text-sm">
          <p>
            Subtotal: {formatCurrency(order.subtotal, order.currency || "USD")}
          </p>
          <p>
            Shipping:{" "}
            {formatCurrency(order.shippingFee, order.currency || "USD")}
          </p>
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
            Total: {formatCurrency(order.total, order.currency || "USD")}
          </p>
        </div>

        <p className="mt-2">
          <strong>Created at:</strong>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Items */}
      <div>
        <h3 className="font-semibold mb-2">Items</h3>
        <div className="border rounded-lg divide-y">
          {order.items.map((item: any) => (
            <div key={item.id} className="p-3 flex justify-between">
              <span>
                {item.product?.name} × {item.quantity}
              </span>
              <span className="font-medium">
                {formatCurrency(item.product?.price, order.currency || "USD")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Update Status */}
      <div className="pt-4">
        <h3 className="font-semibold mb-2">Update Status</h3>
        <div className="flex gap-3 flex-wrap">
          {["PENDING", "PAID", "FULFILLED", "CANCELED"].map((st) => (
            <button
              key={st}
              disabled={saving}
              onClick={() => updateStatus(st)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                order.status === st
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
