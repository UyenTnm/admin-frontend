import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { rest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/format";

type Order = {
  id: number;
  user?: { id: number; email: string; name?: string };
  subtotal: number;
  shippingFee: number;
  total: number;
  status: "PENDING" | "PAID" | "FULFILLED" | "CANCELED";
  createdAt: string;
};

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* -------------------- Load Orders -------------------- */
  useEffect(() => {
    (async () => {
      try {
        const data = await rest.get("/orders");
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load orders:", err);
        toast.error("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* -------------------- Update Status -------------------- */
  async function handleChangeStatus(id: number, newStatus: Order["status"]) {
    try {
      await rest.patch(`/orders/${id}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order #${id} updated to ${newStatus}`);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update order status.");
    }
  }

  /* -------------------- UI -------------------- */
  if (loading)
    return (
      <div className="p-6 text-center text-neutral-500 italic">
        Loading orders...
      </div>
    );

  return (
    <Card className="p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Orders</h2>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-neutral-300 dark:border-neutral-700 text-left">
            <th className="p-2">#</th>
            <th className="p-2">Customer</th>
            <th className="p-2">Subtotal</th>
            <th className="p-2">Shipping</th>
            <th className="p-2">Total</th>
            <th className="p-2">Status</th>
            <th className="p-2">Created</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan={8} className="p-4 text-center text-neutral-500">
                No orders found.
              </td>
            </tr>
          )}
          {orders.map((o) => (
            <tr
              key={o.id}
              className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50"
            >
              <td className="p-2 font-medium">#{o.id}</td>
              <td className="p-2">
                {o.user?.name || o.user?.email || "Unknown"}
              </td>
              <td className="p-2">{formatCurrency(o.subtotal, "USD")}</td>
              <td className="p-2">{formatCurrency(o.shippingFee, "USD")}</td>
              <td className="p-2 font-semibold">
                {formatCurrency(o.total, "USD")}
              </td>
              <td className="p-2">
                <StatusBadge status={o.status} />
              </td>
              <td className="p-2">
                {new Date(o.createdAt).toLocaleDateString()}
              </td>
              <td className="p-2 text-right flex items-center justify-end gap-2">
                <select
                  className="border rounded-md px-2 py-1 bg-transparent text-sm"
                  value={o.status}
                  onChange={(e) =>
                    handleChangeStatus(o.id, e.target.value as Order["status"])
                  }
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="FULFILLED">Fulfilled</option>
                  <option value="CANCELED">Canceled</option>
                </select>

                <button
                  onClick={() => navigate(`/orders/${o.id}`)}
                  className="text-blue-600 hover:underline"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* -------------------- Subcomponent: StatusBadge -------------------- */
function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
    PAID: "bg-green-500/20 text-green-700 dark:text-green-300",
    FULFILLED: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
    CANCELED: "bg-red-500/20 text-red-700 dark:text-red-300",
  };

  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-medium ${
        colorMap[status] || "bg-neutral-300 text-neutral-800"
      }`}
    >
      {status}
    </span>
  );
}
