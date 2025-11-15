import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  Package,
  ReceiptCentIcon,
  TagIcon,
} from "lucide-react";

export default function Sidebar() {
  const items = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    { to: "/users", label: "Users", icon: <Users size={18} /> },
    { to: "/categories", label: "Categories", icon: <FolderTree size={18} /> },
    { to: "/products", label: "Products", icon: <Package size={18} /> },
    { to: "/brands", label: "Brands", icon: <TagIcon size={18} /> },
    { to: "/orders", label: "Orders", icon: <ReceiptCentIcon size={18} /> },
  ];

  console.log("Sidebar items:", items);
  return (
    <aside className="w-56 border-r border-neutral-200 dark:border-neutral-800 h-screen p-4 bg-white dark:bg-gray-950">
      <h2 className="text-lg font-semibold mb-4 text-neutral-700 dark:text-neutral-200">
        Admin Panel
      </h2>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
