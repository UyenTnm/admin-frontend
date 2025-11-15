import { Navigate, Outlet, useLocation } from "react-router-dom";
import { auth } from "@/lib/auth";

export default function ProtectedRoute() {
  const loc = useLocation();
  const session = auth.get();

  // Lấy token thật (string) hoặc null
  const token =
    typeof window !== "undefined"
      ? typeof session?.token === "string"
        ? session.token
        : session?.token?.token || null
      : null;

  // Nếu không có token → chuyển về login
  if (!token) {
    const redirectTo = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?next=${redirectTo}`} replace />;
  }

  // Có token → cho phép render trang con
  return <Outlet />;
}
