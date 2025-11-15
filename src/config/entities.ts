import { rest } from "../lib/api";

/* --------------------------------------------
 * Field & Entity Config Types
 * -------------------------------------------- */
export type Field =
  | {
      key: string;
      label: string;
      type: "text" | "textarea" | "number" | "select" | "boolean";
      options?: string[];
    }
  | { key: string; label: string; type: "media" };

export type EntityConfig = {
  name: string;
  label: string;
  api: {
    base: string;
    list?: (params?: any) => Promise<any>;
    get?: (id: string | number) => Promise<any>;
    create?: (data: any) => Promise<any>;
    update?: (id: string | number, data: any) => Promise<any>;
    remove?: (id: string | number) => Promise<any>;
    toggle?: (id: string | number) => Promise<any>;
  };
  fields: Field[];
};

/* --------------------------------------------
 * Helper: Chuẩn hóa payload product
 * -> Chuyển isActive → status cho backend
 * -------------------------------------------- */
function normalizeProductPayload(data: any) {
  if (!data || typeof data !== "object") return data;
  const clone = { ...data };

  if ("isActive" in clone) {
    clone.status = clone.isActive ? "ACTIVE" : "INACTIVE";
    delete clone.isActive;
  }

  if (!clone.status) clone.status = "INACTIVE";
  return clone;
}

/* --------------------------------------------
 * Entity: Users
 * -------------------------------------------- */
const usersEntity: EntityConfig = {
  name: "Users",
  label: "Users",
  api: {
    base: "/users",
    list: () => rest.get("/users"),
    get: (id) => rest.get(`/users/${id}`),
    create: (data) => rest.post("/users", data),
    update: (id, data) => rest.patch(`/users/${id}`, data),
    remove: (id) => rest.delete(`/users/${id}`),
  },
  fields: [
    { key: "name", label: "Name", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "role", label: "Role", type: "select", options: ["admin", "user"] },
    { key: "isActive", label: "Active", type: "boolean" },
  ],
};

/* --------------------------------------------
 * Entity: Categories
 * -------------------------------------------- */
const categoriesEntity: EntityConfig = {
  name: "Categories",
  label: "Categories",
  api: {
    base: "/categories",
    list: () => rest.get("/categories"),
    get: (id) => rest.get(`/categories/${id}`),
    create: (data) => rest.post("/categories", data),
    update: (id, data) => rest.patch(`/categories/${id}`, data),
    remove: (id) => rest.delete(`/categories/${id}`),
  },
  fields: [
    { key: "name", label: "Name", type: "text" },
    { key: "slug", label: "Slug", type: "text" },
  ],
};

/* --------------------------------------------
 * Entity: Products
 * -------------------------------------------- */
const productsEntity: EntityConfig = {
  name: "Products",
  label: "Products",
  api: {
    base: "/products",
    list: () => rest.get("/products"),
    get: (id) => rest.get(`/products/${id}`),
    create: (data) => rest.post("/products", normalizeProductPayload(data)),
    update: (id, data) =>
      rest.patch(`/products/${id}`, normalizeProductPayload(data)),
    remove: (id) => rest.delete(`/products/${id}`),
  },
  fields: [
    { key: "name", label: "Name", type: "text" },
    { key: "slug", label: "Slug", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "price", label: "Price", type: "number" },
    { key: "currency", label: "Currency", type: "text" },
    { key: "stock", label: "Stock", type: "number" },
    { key: "image", label: "Image", type: "media" },
    { key: "video", label: "Video", type: "media" },
  ],
};

/* --------------------------------------------
 * Entity: Brands
 * -------------------------------------------- */

const brandsEntity: EntityConfig = {
  name: "brands",
  label: "Brands",
  api: {
    base: "/brands",
    list: () => rest.get("/brands"),
    get: (id) => rest.get(`/brands/${id}`),
    create: (data) => rest.post("/brands", data),
    update: (id, data) => rest.patch(`/brands/${id}`, data),
    remove: (id) => rest.delete(`/brands/${id}`),
    toggle: (id) => rest.patch(`/brands/${id}/toggle`),
  },
  fields: [
    { key: "name", label: "Name", type: "text" },
    { key: "slug", label: "Slug", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "isActive", label: "Active", type: "boolean" },
  ],
};

/* --------------------------------------------
 * Entity: Order
 * -------------------------------------------- */
const ordersEntity: EntityConfig = {
  name: "orders",
  label: "Orders",
  api: {
    base: "/orders",
    list: () => rest.get("/orders"),
    get: (id) => rest.get(`/orders/${id}`),
    create: (data) => rest.post("/orders", data),
    update: (id, data) => rest.patch(`/orders/${id}`, data),
    remove: (id) => rest.delete(`/orders/${id}`),
  },
  fields: [
    { key: "id", label: "ID", type: "number" },
    { key: "user", label: "User", type: "text" },
    { key: "subtotal", label: "Subtotal", type: "number" },
    { key: "shippingFee", label: "Shipping Fee", type: "number" },
    { key: "total", label: "Total", type: "number" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["PENDING", "PAID", "FULFILLED", "CANCELED"],
    },
  ],
};

/* --------------------------------------------
 * Entity: Posts
 * -------------------------------------------- */
const postsEntity: EntityConfig = {
  name: "posts",
  label: "Posts",
  api: {
    base: "/posts",
    list: () => rest.get("/posts"),
    get: (id) => rest.get(`/posts/${id}`),
    create: (data) => rest.post("/posts", data),
    update: (id, data) => rest.patch(`/posts/${id}`, data),
    remove: (id) => rest.delete(`/posts/${id}`),
    toggle: (id) => rest.patch(`/posts/${id}/toggle`),
  },
  fields: [
    { key: "title", label: "Title", type: "text" },
    { key: "slug", label: "Slug", type: "text" },
    { key: "content", label: "Content", type: "textarea" },
    { key: "coverImage", label: "Cover Image", type: "text" },
    { key: "published", label: "Published", type: "boolean" },
  ],
};

/* --------------------------------------------
 * Entity Export
 * -------------------------------------------- */
export const ENTITIES: EntityConfig[] = [
  usersEntity,
  categoriesEntity,
  productsEntity,
  brandsEntity,
  ordersEntity,
  postsEntity,
];

const ENTITY_MAP: Record<string, EntityConfig> = Object.fromEntries(
  ENTITIES.map((e) => [e.name, e])
);

export function listEntityNames(): string[] {
  return ENTITIES.map((e) => e.name);
}

export function isEntityName(v: string): v is keyof typeof ENTITY_MAP {
  return v in ENTITY_MAP;
}

export function getEntity(name: string): EntityConfig | undefined {
  return ENTITY_MAP[name];
}
