"use client";
import { useState, useMemo, useEffect } from "react";
import ProductCard from "./ProductCard";
import CategoryButton from "./CategoryButton";
import { Drawer, DrawerTrigger } from "../ui/drawer";
import ProductDetailsDrawerContent from "./ProductDetailsDrawerContent";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type Product = {
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
  extras?: Array<{
    _id: string;
    nombreExtra: string;
    costoExtra: number;
    activo: boolean;
  }>;
};

type Props = {
  products: Product[];
  searchTerm?: string;
  loading?: boolean;
  onProductUpdated?: () => void;
  onProductDeleted?: () => void;
  readOnly?: boolean;
};

export default function ProductGrid({ products, searchTerm = "", loading = false, onProductUpdated, onProductDeleted, readOnly = false }: Props) {
  const [filter, setFilter] = useState<string>("Todos");
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMd = useMediaQuery("(min-width: 768px)");

  // Extraer categorías únicas de los productos
  useEffect(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.categoria)));
    setCategories(["Todos", ...uniqueCategories.sort()]);
  }, [products]);

  const filteredByCategory = filter === "Todos" ? products : products.filter((p) => p.categoria === filter);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return filteredByCategory;
    return filteredByCategory.filter((p) => 
      p.nombreProducto.toLowerCase().includes(term) || 
      p.categoria.toLowerCase().includes(term)
    );
  }, [searchTerm, filteredByCategory]);

  // Limpiar producto seleccionado cuando el drawer se cierra
  const handleOpenChange = (isOpen: boolean) => {
    // No permitir cerrar si hay un modal activo
    if (!isOpen && isModalOpen) {
      return;
    }
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedProduct(null);
    }
  };

  if (loading) {
    return (
      <div className="py-6 md:py-8 px-4 md:px-10 flex items-center justify-center">
        <p className="text-gray-500">Cargando productos...</p>
      </div>
    );
  }

  return (
    <Drawer direction={isMd ? "right" : "bottom"} open={open} onOpenChange={handleOpenChange}>
      <div className="py-6 md:py-8 px-4 md:px-10 flex flex-col gap-5">
        <div className="overflow-x-auto">
          <div className="flex flex-row gap-3 md:gap-4 w-max">
            {categories.map((c) => (
              <CategoryButton key={c} label={c} active={c === filter} onClick={() => setFilter(c)} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No se encontraron productos
            </div>
          ) : (
            filtered.map((p) => (
              <DrawerTrigger key={p._id} onClick={() => setSelectedProduct(p)}>
                <ProductCard product={p} />
              </DrawerTrigger>
            ))
          )}
        </div>
      </div>

      <ProductDetailsDrawerContent 
        product={selectedProduct} 
        onProductUpdated={onProductUpdated}
        onProductDeleted={onProductDeleted}
        onModalStateChange={setIsModalOpen}
        readOnly={readOnly}
      />
    </Drawer>
  );
}
