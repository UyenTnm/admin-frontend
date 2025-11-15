export const API_BASE_URL = "http://localhost:3000";

export const getImageUrl = (path: string) => {
  if (!path) return "/placeholder.png";
  return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
};
