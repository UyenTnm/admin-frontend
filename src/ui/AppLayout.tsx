import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Moon,
  Sun,
  BarChart3,
  Package,
  Layers,
  LogOut,
  Users,
  Tag,
  ReceiptText,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { ENTITIES } from "../config/entities";
import { BRAND } from "../config/brand";
import { auth } from "../lib/auth";
import { ConfirmDialog } from "./ConfirmDialog";
import { MobileSidebar } from "@/components/layout/MobileSidebar";

/* -------------------- Splash Screen -------------------- */
function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <div className="flex flex-col items-center gap-4">
        <img
          src={BRAND.assets.logoLight}
          alt={BRAND.short}
          className="h-12 w-auto dark:hidden"
        />
        <img
          src={BRAND.assets.logoDark}
          alt={BRAND.short}
          className="h-12 w-auto hidden dark:block"
        />
        <div className="animate-pulse text-sm opacity-70">
          Loading {BRAND.short ?? "KWI"}…
        </div>
      </div>
    </div>
  );
}

/* -------------------- Main Layout -------------------- */
export function AppLayout() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [booting, setBooting] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();
  const lenisRef = useRef<Lenis | null>(null);
  const rafId = useRef<number | null>(null);

  /* ---------- Theme ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  /* ---------- Preload Brand Images ---------- */
  useEffect(() => {
    const urls = [
      BRAND.assets.logoLight,
      BRAND.assets.logoDark,
      BRAND.assets.illoPng,
    ].filter(Boolean) as string[];
    const tasks = urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = img.onerror = () => resolve();
          img.src = src;
        })
    );
    Promise.race([
      Promise.all(tasks),
      new Promise<void>((r) => setTimeout(() => r(), 800)),
    ]).then(() => setBooting(false));
  }, []);

  /* ---------- Smooth Scroll ---------- */
  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true, smoothTouch: false });
    lenisRef.current = lenis;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId.current = requestAnimationFrame(raf);
    };
    rafId.current = requestAnimationFrame(raf);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      lenis.destroy?.();
      lenisRef.current = null;
    };
  }, []);
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { lock: false });
  }, [loc.pathname]);

  /* ---------- Body Lock khi mở Sidebar ---------- */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* ---------- Logout ---------- */
  const openLogoutDialog = () => setConfirmOpen(true);
  const confirmLogout = () => {
    setConfirmOpen(false);
    auth.logout();
    navigate("/login");
  };

  if (booting) return <SplashScreen />;

  return (
    <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr] bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* ---------- Sidebar (desktop) ---------- */}
      <aside className="hidden lg:flex lg:flex-col border-r border-neutral-200 dark:border-neutral-800 p-4 bg-white/70 dark:bg-neutral-950/50 backdrop-blur min-h-svh">
        <div className="flex items-center gap-2 mb-6">
          <img
            src={BRAND.assets.logoLight}
            alt="Kwi"
            className="h-6 w-auto dark:hidden"
          />
          <img
            src={BRAND.assets.logoDark}
            alt="Kwi"
            className="h-6 w-auto hidden dark:block"
          />
          <span className="font-semibold text-lg">Kwi Admin</span>
        </div>

        <nav className="space-y-1">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded-xl transition ${
                isActive
                  ? "bg-neutral-200 dark:bg-neutral-800 font-medium"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`
            }
          >
            <span className="inline-flex items-center gap-2">
              <BarChart3 size={18} /> Dashboard
            </span>
          </NavLink>

          {/* Auto render từ ENTITIES */}
          {ENTITIES.map((e) => (
            <NavLink
              key={e.name}
              to={`/${e.name}`}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl transition ${
                  isActive
                    ? "bg-neutral-200 dark:bg-neutral-800 font-medium"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`
              }
            >
              <span className="inline-flex items-center gap-2">
                {getEntityIcon(e.name)} {toTitleCase(e.label)}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Logout (desktop) */}
        <div className="mt-auto pt-4">
          <button
            onClick={openLogoutDialog}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ---------- Header + Content ---------- */}
      <div className="flex flex-col min-h-svh">
        <header className="flex items-center gap-2 justify-between border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 sticky top-0 bg-white/70 dark:bg-neutral-950/70 backdrop-blur z-10">
          <button
            className="lg:hidden inline-flex items-center rounded-xl px-3 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            onClick={() => setOpen(true)}
          >
            <Menu size={16} />
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <span className="font-semibold">Kwi Admin</span>
          </div>

          <div className="flex-1" />
          <button
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            onClick={() => setDark((d) => !d)}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
          </button>
        </header>

        <main id="main" role="main" className="relative p-4 grow">
          <Outlet />
        </main>
      </div>

      {/* ---------- Mobile Sidebar ---------- */}
      <MobileSidebar
        open={open}
        onClose={() => setOpen(false)}
        onClickLogout={openLogoutDialog}
      />

      {/* ---------- Confirm Dialog ---------- */}
      <ConfirmDialog
        open={confirmOpen}
        title="Logout"
        description="Do you want to logout Kwi Admin?"
        confirmText="Logout"
        cancelText="Cancel"
        variant="danger"
        icon="logout"
        onConfirm={confirmLogout}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

/* ---------- Helpers ---------- */
function toTitleCase(s: string) {
  return s.replace(/\b\w/g, (t) => t.toUpperCase());
}

function getEntityIcon(name: string) {
  switch (name) {
    case "users":
      return <Users size={18} />;
    case "categories":
      return <Tag size={18} />;
    case "products":
      return <Package size={18} />;
    case "brands":
      return <Package size={18} />;
    case "orders":
      return <ReceiptText size={18} />;
    default:
      return <Layers size={18} />;
  }
}
