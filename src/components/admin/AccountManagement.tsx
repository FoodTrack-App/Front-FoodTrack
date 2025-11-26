"use client";

import { useState, useEffect } from "react";
import { Account, TempOrderItem } from "@/types/accounts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Send, XCircle, FileText, RotateCcw } from "lucide-react";
import ProductSelectionModal from "./ProductSelectionModal";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";
import ConfirmModal from "@/components/ConfirmModal";
import { generateTicketPDF } from "@/lib/ticketPDF";

interface AccountManagementProps {
  accountId: string;
  onClose: () => void;
  onAccountClosed: () => void;
  isMesero?: boolean;
}

export default function AccountManagement({
  accountId,
  onClose,
  onAccountClosed,
  isMesero = false,
}: AccountManagementProps) {
  const [account, setAccount] = useState<Account | null>(null);
  const [tempItems, setTempItems] = useState<TempOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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
      const addResponse = await fetch(`/api/accounts/${accountId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: tempItems }),
      });

      const addData = await addResponse.json();
      if (!addData.success) {
        setErrorMessage(addData.message || "Error al agregar items");
        setShowError(true);
        setComandarLoading(false);
        return;
      }

      const updatedAccount = addData.data;
      const newItemIds = updatedAccount.items
        .slice(-tempItems.length)
        .map((item: any) => item._id);

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
        { method: "DELETE" }
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

  const handleFinalizeAccount = async () => {
    if (!account) return;

    // Validar que no haya items pendientes
    if (tempItems.length > 0) {
      setErrorMessage("Debe comandar todos los items pendientes antes de finalizar");
      setShowError(true);
      return;
    }

    // Validar que haya al menos un item comandado
    if (account.items.length === 0) {
      setErrorMessage("Debe tener al menos un item comandado para finalizar");
      setShowError(true);
      return;
    }

    try {
      const response = await fetch(`/api/accounts/${accountId}/finalize`, {
        method: "PUT",
      });

      const data = await response.json();
      if (data.success) {
        // Generar PDF
        generateTicketPDF({
          restaurante: "FoodTrack",
          numeroTicket: account.numeroTicket,
          mesa: account.mesa,
          mesero: account.mesero,
          fechaApertura: account.fechaApertura,
          items: account.items,
          subtotal: account.subtotal,
        });

        setSuccessMessage("Cuenta finalizada y ticket generado");
        setShowSuccess(true);
        await loadAccount();
      } else {
        setErrorMessage(data.message || "Error al finalizar cuenta");
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage("Error al finalizar cuenta");
      setShowError(true);
    }
  };

  const handleReopenAccount = async () => {
    if (!account) return;

    try {
      const response = await fetch(`/api/accounts/${accountId}/reopen`, {
        method: "PUT",
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage("Cuenta reabierta exitosamente");
        setShowSuccess(true);
        await loadAccount();
      } else {
        setErrorMessage(data.message || "Error al reabrir cuenta");
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage("Error al reabrir cuenta");
      setShowError(true);
    }
  };

  const handleCloseAccount = async (metodoPago: string, montoPagado?: number) => {
    if (!account) return;

    try {
      const response = await fetch(`/api/accounts/${accountId}/close`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metodoPago,
          totalPagado: montoPagado || account.subtotal,
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

  const isOpen = account.estado === "abierta";
  const isFinalized = account.estado === "finalizada";
  const isClosed = account.estado === "cerrada";

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-[#0D1748]">
                  Mesa {account.mesa.numeroMesa}
                </h2>
                {isFinalized && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-xs font-medium">
                    Finalizada
                  </span>
                )}
                {isClosed && (
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-xs font-medium">
                    Cerrada
                  </span>
                )}
              </div>
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
            <h3 className="text-xl font-bold mb-4 text-[#0D1748]">
              Items Comandados
            </h3>
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
                          {!item.comandado && isOpen && (
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
          {tempItems.length > 0 && isOpen && (
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
        <div className="border-t bg-gradient-to-r from-gray-50 to-blue-50 p-6 space-y-4 shadow-lg">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Subtotal Comandado:</span>
            <span className="font-bold text-emerald-600">
              ${account.subtotal.toFixed(2)}
            </span>
          </div>
          {tempItems.length > 0 && isOpen && (
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Pendiente:</span>
              <span className="font-bold text-amber-600">
                ${calculateTempTotal().toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-xl border-t pt-4">
            <span className="font-bold">Total:</span>
            <span className="font-bold text-[#0D1748] text-2xl">
              ${(account.subtotal + calculateTempTotal()).toFixed(2)}
            </span>
          </div>

          {/* Botones según el estado de la cuenta */}
          {isOpen && (
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
                onClick={handleFinalizeAccount}
                disabled={tempItems.length > 0 || account.items.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                title={tempItems.length > 0 ? "Debe comandar todos los items pendientes" : account.items.length === 0 ? "Debe tener al menos un item comandado" : ""}
              >
                <FileText className="mr-2 h-5 w-5" />
                Finalizar
              </Button>
            </div>
          )}

          {isFinalized && !isMesero && (
            <div className="flex gap-2">
              <Button
                onClick={handleReopenAccount}
                variant="outline"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Reabrir Cuenta
              </Button>
            </div>
          )}
        </div>
      </div>

      {showProductSelection && isOpen && (
        <ProductSelectionModal
          isOpen={showProductSelection}
          onClose={() => setShowProductSelection(false)}
          claveRestaurante={account.claveRestaurante}
          onItemsAdded={handleAddItemsToTemp}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          total={account.subtotal}
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

// Payment Modal Component
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (metodoPago: string, montoPagado?: number) => void;
}

function PaymentModal({
  isOpen,
  onClose,
  total,
  onConfirm,
}: PaymentModalProps) {
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [montoPagado, setMontoPagado] = useState<string>(total.toFixed(2));

  const calcularCambio = () => {
    const pagado = parseFloat(montoPagado) || 0;
    return Math.max(0, pagado - total);
  };

  const handleConfirm = () => {
    onConfirm(metodoPago, parseFloat(montoPagado) || total);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-xl">
        <DialogHeader className="bg-gradient-to-r from-green-50 to-emerald-50 -mx-6 -mt-6 px-6 py-4 rounded-t-xl border-b">
          <DialogTitle className="text-[#0D1748]">Cerrar Cuenta - Pago</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total a Pagar:</p>
            <p className="text-4xl font-bold text-[#0D1748]">
              ${total.toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Método de Pago *
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-[#0D1748]"
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          {metodoPago === "efectivo" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Monto Pagado *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={montoPagado}
                  onChange={(e) => setMontoPagado(e.target.value)}
                  placeholder="Ingrese el monto"
                />
              </div>

              {parseFloat(montoPagado) >= total && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Cambio:</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${calcularCambio().toFixed(2)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={metodoPago === "efectivo" && parseFloat(montoPagado) < total}
            className="bg-green-600 hover:bg-green-700"
          >
            Confirmar Cierre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
