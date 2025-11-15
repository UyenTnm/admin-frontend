// src/lib/slugify.ts
export function slugify(input: string) {
  if (!input) return "";
  // Chuẩn hóa tiếng Việt
  let str = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Đổi đ/Đ
  str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
  // lowercase, thay khoảng trắng bởi '-', bỏ ký tự không hợp lệ, gọn nhiều '-'
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
