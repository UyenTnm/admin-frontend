import ProductForm from "@/components/form/ProductForm_legacy";
import React from "react";
import ProductList from "./ProductList";

export default function ProductsPage() {
  return (
    <>
      <ProductForm onSuccess={() => refetchProducts()} />
      <ProductList />
    </>
  );
}
