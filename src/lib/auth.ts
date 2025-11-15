export const AUTH_STORAGE_KEY = "kwi_auth";

export const auth = {
  // Lấy thông tin đăng nhập
  get() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Lưu token và user
  set(data: { token: string; user?: any }) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem("token", data.token);
  },

  // Xóa thông tin khi logout
  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("token");
  },

  // Kiểm tra login
  isLoggedIn() {
    const s = auth.get();
    return !!s?.token;
  },

  // Lấy token nhanh
  getToken() {
    const s = auth.get();
    return s?.token || null;
  },
};
