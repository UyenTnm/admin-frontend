/**
 * formatCurrency - chuẩn hóa hiển thị giá tiền
 * @param value: số hoặc chuỗi (có thể là "1000" hoặc 1000)
 * @param currency: mã tiền tệ (USD, VND, EUR, v.v.)
 * @returns Chuỗi định dạng, ví dụ: "$1,000.00" hoặc "₫1.000.000"
 */

export function formatCurrency(
  value: number | string | undefined | null,
  currency: string = "USD"
): string {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (isNaN(num)) return String(value);

  // Xác định locale theo currency
  let locale = "en-US";
  if (currency === "VND") locale = "vi-VN";
  if (currency === "EUR") locale = "de-DE";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    // fallback nếu currency sai
    return `${num.toFixed(2)} ${currency}`;
  }
}
