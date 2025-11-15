import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { AppLayout } from "./ui/AppLayout";
import CategoryList from "./pages/categories/CategoryList";
import ProductList from "./pages/products/ProductList";
import Login from "./pages/login/Login";
import ProtectedRoute from "./pages/ProtectedRoute";
import Dashboard from "./pages/dashboard/Dashboard";
import CategoryForm from "./pages/categories/CategoryForm";
import UserList from "./pages/users/UserList";
import UserForm from "./pages/users/UserForm";
import BrandList from "./pages/brands/BrandList";
import BrandForm from "./pages/brands/BrandForm";
import ProductForm from "./pages/products/ProductForm";
import { Toaster } from "react-hot-toast";
import OrderList from "./pages/orders/OrderList";
import OrderDetail from "./pages/orders/OrderDetail";
import PostList from "./pages/posts/PostList";
import PostForm from "./pages/posts/PostForm";

/* ----------------------------------------------------------------
  PATCH 1 — Dọn sạch warning khó chịu khi dev
   (findDOMNode từ ReactQuill + future flag từ React Router)
---------------------------------------------------------------- */
if (import.meta.env.DEV) {
  const origError = console.error;
  const origWarn = console.warn;

  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("findDOMNode is deprecated")
    ) {
      return;
    }
    origError(...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("React Router Future Flag Warning")
    ) {
      return;
    }
    origWarn(...args);
  };
}

/* ----------------------------------------------------------------
  Router config
---------------------------------------------------------------- */
function DefaultError() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-lg w-full space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Oops — 404 Not Found</h1>
        <p className="text-neutral-600">
          The page you requested does not exist. Please check the path or return
          to the dashboard.
        </p>
        <a
          href="/"
          className="inline-block rounded-xl px-4 py-2 bg-black text-white dark:bg-white dark:text-black"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}

const router = createBrowserRouter(
  [
    // Public route
    { path: "/login", element: <Login /> },

    // Protected routes
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: "/",
          element: <AppLayout />,
          errorElement: <DefaultError />,
          children: [
            // Dashboard
            { index: true, element: <Dashboard /> },
            { path: "dashboard", element: <Dashboard /> },

            // Users
            { path: "users", element: <UserList /> },
            { path: "users/new", element: <UserForm /> },
            { path: "users/:id", element: <UserForm /> },

            // Categories
            { path: "categories", element: <CategoryList /> },
            {
              path: "categories/create",
              element: <CategoryForm mode="create" />,
            },
            {
              path: "categories/edit/:id",
              element: <CategoryForm mode="edit" />,
            },

            // Products
            { path: "products", element: <ProductList /> },
            { path: "products/new", element: <ProductForm mode="create" /> },
            { path: "products/:id", element: <ProductForm mode="edit" /> },

            // Brands
            { path: "brands", element: <BrandList /> },
            { path: "brands/new", element: <BrandForm /> },
            { path: "brands/:id", element: <BrandForm /> },

            // Orders
            { path: "orders", element: <OrderList /> },
            { path: "orders/:id", element: <OrderDetail /> },

            // Posts
            { path: "posts", element: <PostList /> },
            { path: "posts/new", element: <PostForm /> },
            { path: "posts/:id", element: <PostForm /> },
          ],
        },
      ],
    },

    // Fallback route
    { path: "*", element: <DefaultError /> },
  ],
  {
    // Opt-in cho React Router v7 Transition Mode (hiệu năng tốt hơn)
    future: { v7_startTransition: true },
  }
);

/* ----------------------------------------------------------------
   Smart StrictMode Switcher
   - Dev: StrictMode OFF (tắt cảnh báo findDOMNode, render mượt)
   - Build: StrictMode ON (đảm bảo an toàn)
---------------------------------------------------------------- */
const isDev = import.meta.env.DEV;

const RootApp = (
  <>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#333",
          color: "#fff",
          borderRadius: "8px",
        },
        success: { iconTheme: { primary: "#4ade80", secondary: "#1a1a1a" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "#1a1a1a" } },
      }}
    />
    <RouterProvider router={router} />
  </>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  isDev ? RootApp : <React.StrictMode>{RootApp}</React.StrictMode>
);
