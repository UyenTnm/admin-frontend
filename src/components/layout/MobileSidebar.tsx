import { Link, useLocation } from "react-router-dom";
import { ENTITIES } from "../../config/entities";

export function MobileSidebar({
  open,
  onClose,
  onClickLogout,
}: {
  open: boolean;
  onClose: () => void;
  onClickLogout?: () => void;
}) {
  const loc = useLocation();
  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute left-0 top-0 h-full w-72 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 p-4 transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile menu"
      >
        <div className="text-xl font-semibold mb-6">KWI Admin</div>
        <nav className="space-y-1">
          <Link
            to="/"
            onClick={onClose}
            className={`block px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
              loc.pathname === "/" ? "bg-neutral-100 dark:bg-neutral-800" : ""
            }`}
          >
            Dashboard
          </Link>
          {ENTITIES.map((e) => (
            <Link
              key={e.name}
              to={`/entities/${e.name}`}
              onClick={onClose}
              className={`block px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                loc.pathname.startsWith("/entities/" + e.name)
                  ? "bg-neutral-100 dark:bg-neutral-800"
                  : ""
              }`}
            >
              {e.name}
            </Link>
          ))}
        </nav>

        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => {
              onClose();
              onClickLogout?.();
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
}
