"use client";

import { useState, useEffect } from "react";
import { TempOrderItem } from "@/types/accounts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import ProductDetailModal from "./ProductDetailModal";
import { getProductImageUrl } from "@/lib/imageUtils";

interface Product {
  _id: string;
  nombreProducto: string;
  imagenProducto: string;
  descripcion: string;
  stockDisponible: number;
  costo: number;
  precioVenta: number;
  categoria: string;
  extras: Array<{
    _id: string;
    nombreExtra: string;
    costoExtra: number;
    activo: boolean;
  }>;
}

interface Category {
  _id: string;
  nombreCategoria: string;
}

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  claveRestaurante: string;
  onItemsAdded: (items: TempOrderItem[]) => void;
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  claveRestaurante,
  onItemsAdded,
}: ProductSelectionModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      loadCategories();
    }
  }, [isOpen, claveRestaurante]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const loadProducts = async () => {
    try {
      console.log("🔍 Buscando productos para restaurante:", claveRestaurante);
      const response = await fetch(`/api/products/restaurant/${claveRestaurante}`);
      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("📦 Datos recibidos:", data);
      console.log("📊 Total productos:", data.data?.length);
      
      if (data.success) {
        // Filter out products with no stock
        const availableProducts = data.data.filter(
          (p: Product) => p.stockDisponible > 0
        );
        console.log("✅ Productos con stock:", availableProducts.length);
        setProducts(availableProducts);
      }
    } catch (error) {
      console.error("❌ Error al cargar productos:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`/api/categories/restaurant/${claveRestaurante}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setCategories([]);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.categoria === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nombreProducto.toLowerCase().includes(term) ||
          p.descripcion.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddItem = (item: TempOrderItem) => {
    onItemsAdded([item]);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border-0 shadow-2xl p-0">
          <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#0D1748]">Seleccionar Productos</DialogTitle>
            </DialogHeader>
          </div>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                  selectedCategory === "all"
                    ? "bg-[#0D1748] text-white border-transparent shadow"
                    : "bg-white text-[#0D1748] border-gray-200 hover:bg-gray-50"
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.nombreCategoria)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all border whitespace-nowrap ${
                    selectedCategory === cat.nombreCategoria
                      ? "bg-[#0D1748] text-white border-transparent shadow"
                      : "bg-white text-[#0D1748] border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {cat.nombreCategoria}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto px-1">
              {loading ? (
                <div className="text-center py-8">Cargando productos...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron productos disponibles
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product)}
                      className="group border rounded-2xl p-4 cursor-pointer hover:shadow-xl transition-all bg-white/90 hover:bg-white border-gray-100"
                    >
                      <div className="relative aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden">
                        {product.imagenProducto &&
                        product.imagenProducto !== "default" ? (
                          <img
                            src={getProductImageUrl(product.imagenProducto, product.categoria)}
                            alt={product.nombreProducto}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Sin imagen
                          </div>
                        )}
                        <span className="absolute top-2 right-2 text-[11px] px-2 py-0.5 rounded-full bg-white/80 backdrop-blur border border-gray-200 text-gray-700">
                          Stock: {product.stockDisponible}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-[#0D1748]">
                        {product.nombreProducto}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {product.descripcion}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-lg font-bold text-emerald-600">
                          ${product.precioVenta.toFixed(2)}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {product.categoria}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedProduct && (
        <ProductDetailModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          onAddItem={handleAddItem}
        />
      )}
    </>
  );
}
