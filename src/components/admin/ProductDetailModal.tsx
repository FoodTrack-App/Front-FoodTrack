"use client";

import { useState } from "react";
import { TempOrderItem } from "@/types/accounts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus } from "lucide-react";
import { getProductImageUrl } from "@/lib/imageUtils";

interface Product {
  _id: string;
  nombreProducto: string;
  imagenProducto: string;
  descripcion: string;
  stockDisponible: number;
  precioVenta: number;
  extras: Array<{
    _id: string;
    nombreExtra: string;
    costoExtra: number;
    activo: boolean;
  }>;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddItem: (item: TempOrderItem) => void;
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onAddItem,
}: ProductDetailModalProps) {
  const [cantidad, setCantidad] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [comentarios, setComentarios] = useState("");

  // Filter only active extras
  const activeExtras = product.extras.filter((e) => e.activo);

  const handleExtraToggle = (extraId: string) => {
    const newSelected = new Set(selectedExtras);
    if (newSelected.has(extraId)) {
      newSelected.delete(extraId);
    } else {
      newSelected.add(extraId);
    }
    setSelectedExtras(newSelected);
  };

  const calculateTotal = () => {
    let total = product.precioVenta;
    activeExtras.forEach((extra) => {
      if (selectedExtras.has(extra._id)) {
        total += extra.costoExtra;
      }
    });
    return total * cantidad;
  };

  const handleAdd = () => {
    const selectedExtrasArray = activeExtras
      .filter((extra) => selectedExtras.has(extra._id))
      .map((extra) => ({
        nombreExtra: extra.nombreExtra,
        costoExtra: extra.costoExtra,
      }));

    const item: TempOrderItem = {
      productoId: product._id,
      nombreProducto: product.nombreProducto,
      imagenProducto: product.imagenProducto,
      precioBase: product.precioVenta,
      cantidad,
      extras: selectedExtrasArray,
      comentarios: comentarios.trim() || undefined,
      precioTotal: calculateTotal(),
    };

    onAddItem(item);
    handleClose();
  };

  const handleClose = () => {
    setCantidad(1);
    setSelectedExtras(new Set());
    setComentarios("");
    onClose();
  };

  const incrementQuantity = () => {
    if (cantidad < product.stockDisponible) {
      setCantidad(cantidad + 1);
    }
  };

  const decrementQuantity = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 rounded-2xl border-0 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Imagen */}
          <div className="relative bg-gray-100 md:rounded-l-2xl overflow-hidden">
            {product.imagenProducto && product.imagenProducto !== "default" ? (
              <img
                src={getProductImageUrl(product.imagenProducto)}
                alt={product.nombreProducto}
                className="w-full h-[240px] md:h-full object-cover"
              />
            ) : (
              <div className="w-full h-[240px] md:h-full flex items-center justify-center text-gray-400">
                Sin imagen
              </div>
            )}
            <span className="absolute top-3 right-3 text-[11px] px-2 py-0.5 rounded-full bg-white/85 backdrop-blur border border-gray-200 text-gray-700">
              Stock: {product.stockDisponible}
            </span>
          </div>

          {/* Detalle */}
          <div className="p-6 space-y-5">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#0D1748]">{product.nombreProducto}</DialogTitle>
            </DialogHeader>

            <div>
              <p className="text-gray-600 text-sm leading-relaxed">{product.descripcion}</p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">
                ${product.precioVenta.toFixed(2)}
              </p>
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium mb-2">Cantidad</label>
              <div className="inline-flex items-center gap-3 rounded-full border border-gray-200 px-3 py-1.5">
                <button
                  onClick={decrementQuantity}
                  disabled={cantidad <= 1}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-lg font-semibold w-8 text-center">
                  {cantidad}
                </span>
                <button
                  onClick={incrementQuantity}
                  disabled={cantidad >= product.stockDisponible}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Extras */}
            {activeExtras.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-3">
                  Extras disponibles
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {activeExtras.map((extra) => (
                    <label
                      key={extra._id}
                      className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl cursor-pointer transition-colors ${
                        selectedExtras.has(extra._id)
                          ? "bg-indigo-50 border-indigo-200"
                          : "bg-white hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedExtras.has(extra._id)}
                          onCheckedChange={() => handleExtraToggle(extra._id)}
                        />
                        <span className="font-medium text-sm">{extra.nombreExtra}</span>
                      </div>
                      <span className="text-emerald-600 font-semibold text-sm">
                        +${extra.costoExtra.toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Comentarios */}
            <div>
              <label className="block text-sm font-medium mb-2">Comentarios (opcional)</label>
              <Textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Ej: Sin cebolla, bien cocido..."
                rows={3}
                className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
              />
            </div>

            {/* Footer */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-bold text-blue-600">
                  ${calculateTotal().toFixed(2)}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" onClick={handleClose} className="rounded-xl">
                  Cancelar
                </Button>
                <Button onClick={handleAdd} className="rounded-xl bg-[#0D1748] hover:bg-[#0f1c5a]">
                  Agregar al pedido
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
