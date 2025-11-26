"use client";

import { useState, useEffect } from "react";
import { Account, TempOrderItem } from "@/types/accounts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, Plus, Send, XCircle } from "lucide-react";
import ProductSelectionModal from "./ProductSelectionModal";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";
import ConfirmModal from "@/components/ConfirmModal";

interface AccountManagementProps {
  accountId: string;
  onClose: () => void;
  onAccountClosed: () => void;
}

export default function AccountManagement({
  accountId,
  onClose,
  onAccountClosed,
}: AccountManagementProps) {
  const [account, setAccount] = useState<Account | null>(null);
  const [tempItems, setTempItems] = useState<TempOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmComandar, setShowConfirmComandar] = useState(false);
  const [comandarLoading, setComandarLoading] = useState(false);

  useEffect(() => {
    loadAccount();
  }, [accountId]);

  const loadAccount = async () => {
    try {
      const response = await fetch(`/api/accounts/${accountId}`);
      const data = await response.json();
      if (data.success) {
        setAccount(data.data);
      }
    } catch (error) {
      console.error("Error al cargar cuenta:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemsToTemp = (items: TempOrderItem[]) => {
    setTempItems([...tempItems, ...items]);
  };

  const handleRemoveTempItem = (index: number) => {
    setTempItems(tempItems.filter((_, i) => i !== index));
  };

  const handleComandar = async () => {
    if (tempItems.length === 0) {
      setErrorMessage("No hay items para comandar");
      setShowError(true);
      return;
    }

    setShowConfirmComandar(true);
  };

  const confirmComandar = async () => {
    setShowConfirmComandar(false);
    setComandarLoading(true);

    try {
      // Paso 1: Agregar items a la cuenta (sin comandar)
      const addResponse = await fetch(
        `/api/accounts/${accountId}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: tempItems }),
        }
      );

      const addData = await addResponse.json();
      if (!addData.success) {
        setErrorMessage(addData.message || "Error al agregar items");
        setShowError(true);
        setComandarLoading(false);
        return;
      }

      // Paso 2: Obtener los IDs de los items recién agregados
      const updatedAccount = addData.data;
      const newItemIds = updatedAccount.items
        .slice(-tempItems.length)
        .map((item: any) => item._id);

      // Paso 3: Comandar esos items
      const comandarResponse = await fetch(
        `/api/accounts/${accountId}/send-to-kitchen`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemIds: newItemIds }),
        }
      );

      const comandarData = await comandarResponse.json();
      if (comandarData.success) {
        setSuccessMessage("Items comandados exitosamente");
        setShowSuccess(true);
        setTempItems([]);
        await loadAccount();
      } else {
        setErrorMessage(comandarData.message || "Error al comandar items");
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage("Error al comandar items");
      setShowError(true);
    } finally {
      setComandarLoading(false);
    }
  };

  const handleDeleteComandedItem = async (itemId: string) => {
    try {
      const response = await fetch(
        `/api/accounts/${accountId}/items/${itemId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (data.success) {
        setSuccessMessage("Item eliminado");
        setShowSuccess(true);
        await loadAccount();
      } else {
        setErrorMessage(
          data.message || "Solo se pueden eliminar items no comandados"
        );
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage("Error al eliminar item");
      setShowError(true);
    }
  };

  const handleCloseAccount = async (metodoPago: string) => {
    if (!account) return;

    try {
      const response = await fetch(`/api/accounts/${accountId}/close`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metodoPago,
          totalPagado: account.subtotal,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage("Cuenta cerrada exitosamente");
        setShowSuccess(true);
        setTimeout(() => {
          onAccountClosed();
        }, 1500);
      } else {
        setErrorMessage(data.message || "Error al cerrar cuenta");
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage("Error al cerrar cuenta");
      setShowError(true);
    }
  };

  const calculateTempTotal = () => {
    return tempItems.reduce((sum, item) => sum + item.precioTotal, 0);
  };

  if (loading || !account) {
    return <div className="text-center py-8">Cargando cuenta...</div>;
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#0D1748]">
                Mesa {account.mesa.numeroMesa}
              </h2>
              {account.mesa.nombrePersonalizado && (
                <p className="text-gray-600">
                  {account.mesa.nombrePersonalizado}
                </p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Ticket: #{account.numeroTicket} | Mesero: {account.mesero}
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <XCircle className="mr-2 h-4 w-4" />
              Cerrar
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Comandado Items */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#0D1748]">Items Comandados</h3>
            {account.items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay items comandados aún
              </p>
            ) : (
              <div className="space-y-2">
                {account.items.map((item) => (
                  <Card key={item._id} className="border-gray-100">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#0D1748]">
                            {item.nombreProducto} x{item.cantidad}
                          </h4>
                          {item.extras.length > 0 && (
                            <div className="text-sm text-gray-600 mt-1">
                              Extras:{" "}
                              {item.extras
                                .map((e) => `${e.nombreExtra} (+$${e.costoExtra})`)
                                .join(", ")}
                            </div>
                          )}
                          {item.comentarios && (
                            <p className="text-sm text-gray-500 italic mt-1">
                              {item.comentarios}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-emerald-600">
                            ${item.precioTotal.toFixed(2)}
                          </p>
                          {!item.comandado && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComandedItem(item._id!)}
                              className="mt-2"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Temporary Items */}
          {tempItems.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4">
                Items Pendientes (Sin Comandar)
              </h3>
              <div className="space-y-2">
                {tempItems.map((item, index) => (
                  <Card key={index} className="border-amber-300 bg-amber-50/70">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#0D1748]">
                            {item.nombreProducto} x{item.cantidad}
                          </h4>
                          {item.extras.length > 0 && (
                            <div className="text-sm text-gray-600 mt-1">
                              Extras:{" "}
                              {item.extras
                                .map((e) => `${e.nombreExtra} (+$${e.costoExtra})`)
                                .join(", ")}
                            </div>
                          )}
                          {item.comentarios && (
                            <p className="text-sm text-gray-500 italic mt-1">
                              {item.comentarios}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold">${item.precioTotal.toFixed(2)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTempItem(index)}
                            className="mt-2"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer con totales y botones */}
        <div className="border-t bg-gray-50 p-6 space-y-4">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Subtotal Comandado:</span>
            <span className="font-bold text-emerald-600">
              ${account.subtotal.toFixed(2)}
            </span>
          </div>
          {tempItems.length > 0 && (
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Pendiente:</span>
              <span className="font-bold text-amber-600">
                ${calculateTempTotal().toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-xl border-t pt-4">
            <span className="font-bold">Total:</span>
            <span className="font-bold text-blue-600">
              ${(account.subtotal + calculateTempTotal()).toFixed(2)}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowProductSelection(true)}
              className="flex-1"
              variant="outline"
            >
              <Plus className="mr-2 h-5 w-5" />
              Agregar Productos
            </Button>
            <Button
              onClick={handleComandar}
              disabled={tempItems.length === 0 || comandarLoading}
              className="flex-1 bg-[#0D1748] hover:bg-[#0f1c5a]"
            >
              <Send className="mr-2 h-5 w-5" />
              {comandarLoading ? "Comandando..." : "Comandar"}
            </Button>
            <Button
              onClick={() => setShowCloseModal(true)}
              variant="destructive"
              className="flex-1"
            >
              Cerrar Cuenta
            </Button>
          </div>
        </div>
      </div>

      {showProductSelection && (
        <ProductSelectionModal
          isOpen={showProductSelection}
          onClose={() => setShowProductSelection(false)}
          claveRestaurante={account.claveRestaurante}
          onItemsAdded={handleAddItemsToTemp}
        />
      )}

      {showCloseModal && (
        <CloseAccountModal
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          total={account.subtotal + calculateTempTotal()}
          onConfirm={handleCloseAccount}
        />
      )}

      {showConfirmComandar && (
        <ConfirmModal
          isOpen={showConfirmComandar}
          onClose={() => setShowConfirmComandar(false)}
          title="Confirmar Comandar"
          message={`¿Está seguro de comandar ${tempItems.length} items? Esta acción actualizará el stock de los productos.`}
          onConfirm={confirmComandar}
        />
      )}

      {showError && (
        <ErrorModal message={errorMessage} onClose={() => setShowError(false)} />
      )}
      {showSuccess && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </>
  );
}

// Close Account Modal Component
interface CloseAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (metodoPago: string) => void;
}

function CloseAccountModal({
  isOpen,
  onClose,
  total,
  onConfirm,
}: CloseAccountModalProps) {
  const [metodoPago, setMetodoPago] = useState("efectivo");

  const handleConfirm = () => {
    onConfirm(metodoPago);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cerrar Cuenta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total a Pagar:</p>
            <p className="text-4xl font-bold text-green-600">
              ${total.toFixed(2)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Método de Pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar Cierre</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
