import { useState } from "react";
import { toggleProductStatus } from "@/lib/api";

interface Props {
  id: number;
  status: "ACTIVE" | "INACTIVE";
  onToggled?: (newStatus: "ACTIVE" | "INACTIVE") => void;
}

export default function StatusSwitch({ id, status, onToggled }: Props) {
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(status === "ACTIVE");

  const handleToggle = async () => {
    setLoading(true);
    try {
      const updated = await toggleProductStatus(id);
      setIsActive(updated.status === "ACTIVE");
      onToggled?.(updated.status);
    } catch (err) {
      console.error(err);
      alert(" Không thể thay đổi trạng thái sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition 
        ${isActive ? "bg-green-500" : "bg-gray-400"}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform 
          ${isActive ? "translate-x-6" : "translate-x-1"}`}
      />
      <span className="absolute left-14 text-sm text-gray-600 select-none">
        {isActive ? "ACTIVE" : "INACTIVE"}
      </span>
    </button>
  );
}
