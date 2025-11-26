"use client";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/admin/Header";
import NavTabs from "@/components/mesero/NavTabs";
import ProductGrid from "@/components/admin/ProductGrid";

export type Product = {
  _id: string;
  nombreProducto: string;
  imagenProducto: string;
  descripcion: string;
  stockDisponible: number;
  costo: number;
  precioVenta: number;
  margenGanancia: number;
  categoria: string;
  claveRestaurante: string;
  fechaRegistro: string;
};

export default function MeseroDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const claveRestaurante = localStorage.getItem("claveRestaurante");
      
      if (!claveRestaurante) {
        console.error("No hay clave de restaurante");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/products/restaurant/${claveRestaurante}`);
      const data = await response.json();

      if (data.success && data.data) {
        setProducts(data.data);
      } else {
        console.error("Error al obtener productos:", data.message);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <>
      <Header 
        placeholder={`Buscar entre ${products.length} productos...`} 
        value={search} 
        onSearch={setSearch} 
      />
      <main className="flex flex-col">
        <NavTabs />
        <div className="py-6 md:py-8 px-4 md:px-10">
          <ProductGrid 
            products={products} 
            searchTerm={search} 
            loading={loading}
            onProductUpdated={loadProducts}
            onProductDeleted={loadProducts}
            readOnly={true}
          />
        </div>
      </main>
    </>
  );
}
