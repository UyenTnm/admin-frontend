import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { auth } from "../../lib/auth";
import { Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("123456aA@");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrMsg(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });

      // Lưu token và user đúng định dạng theo auth.ts
      auth.set({
        token: data.access_token,
        user: data.user,
      });
      // Nếu muốn đồng thời lưu token riêng biệt để debug, có thể giữ dòng này:
      // localStorage.setItem("token", data.access_token);

      // Chuyển hướng sau khi đăng nhập thành công
      nav("/", { replace: true });
    } catch (err: any) {
      setErrMsg(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur space-y-4 shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-center">Admin Login</h1>

        {errMsg && (
          <div className="text-sm text-red-500 border border-red-300 dark:border-red-700 rounded-lg px-3 py-2 bg-red-50 dark:bg-red-950/30">
            {errMsg}
          </div>
        )}

        <label className="block text-sm">
          <span className="mb-1 block text-neutral-600 dark:text-neutral-400">
            Email
          </span>
          <input
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@test.com"
          />
        </label>

        {/* Hide / show password  */}
        <label className="block text-sm relative">
          <span className="mb-1 block text-neutral-600 dark:text-neutral-400">
            Password
          </span>
          {/* <input
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          /> */}

          <AnimatePresence mode="wait" initial={false}>
            {showPassword ? (
              <motion.input
                key="text"
                type="text"
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 pr-10"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              />
            ) : (
              <motion.input
                key="password"
                type="password"
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 pr-10"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              />
            )}
          </AnimatePresence>
          {/* button hide + show passwrod */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-[36px] text-neutral-500 hover:text-neutral-700 "
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-2.5 font-medium bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
