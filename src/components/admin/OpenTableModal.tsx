"use client";

import { useState, useEffect } from "react";
import { Table } from "@/types/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ErrorModal from "@/components/ErrorModal";

interface OpenTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: (accountId: string) => void;
}

export default function OpenTableModal({
  isOpen,
  onClose,
  onAccountCreated,
}: OpenTableModalProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null); // puede ser número como string o 'custom'
  const [customName, setCustomName] = useState("");
  const [mesero, setMesero] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [claveRestaurante, setClaveRestaurante] = useState("");

  useEffect(() => {
    const clave = localStorage.getItem("claveRestaurante");
    if (clave) {
      setClaveRestaurante(clave);
    }
  }, []);

  useEffect(() => {
    if (isOpen && claveRestaurante) {
      loadAvailableTables();
      loadUsers();
    }
  }, [isOpen, claveRestaurante]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`/api/users/restaurant/${claveRestaurante}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  const loadAvailableTables = async () => {
    try {
      const response = await fetch(
        `/api/tables/restaurant/${claveRestaurante}`
      );
      const data = await response.json();
      if (data.success) {
        // Filter only available tables
        const availableTables = data.data.filter(
          (table: Table) => !table.activa
        );
        setTables(availableTables);
      }
    } catch (error) {
      console.error("Error al cargar mesas:", error);
    }
  };

  const handleCreateAccount = async () => {
    if (!selectedTable) {
      setErrorMessage("Debe seleccionar una mesa");
      setShowError(true);
      return;
    }
    if (!mesero) {
      setErrorMessage("Debe seleccionar un mesero");
      setShowError(true);
      return;
    }

    // Si es mesa personalizada, el nombre es obligatorio
    if (selectedTable === "custom" && !customName.trim()) {
      setErrorMessage("Debe ingresar el nombre personalizado");
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      // Determinar número de mesa real: si es 'custom' tomamos la primera disponible
      const numeroMesaReal = selectedTable === "custom"
        ? tables[0]?.numeroMesa
        : parseInt(selectedTable);

      if (!numeroMesaReal) {
        setErrorMessage("No hay mesas disponibles para asignar");
        setShowError(true);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claveRestaurante,
          numeroMesa: numeroMesaReal,
          nombrePersonalizado: selectedTable === "custom" ? customName.trim() : undefined,
          mesero: mesero,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onAccountCreated(data.data._id);
        handleClose();
      } else {
        setErrorMessage(data.message || "Error al crear cuenta");
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage("Error al crear cuenta");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTable(null);
    setCustomName("");
    setMesero("");
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] rounded-xl">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 -mt-6 px-6 py-4 rounded-t-xl border-b">
            <DialogTitle className="text-[#0D1748]">Abrir Nueva Mesa</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Seleccionar Mesa *</label>
              <Select
                value={selectedTable || ''}
                onValueChange={(value) => setSelectedTable(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una mesa disponible" />
                </SelectTrigger>
                <SelectContent>
                  {tables.length === 0 && (
                    <div className="px-2 py-1 text-sm text-gray-500">
                      No hay mesas disponibles
                    </div>
                  )}
                  {tables.map((table) => (
                    <SelectItem key={table._id} value={table.numeroMesa.toString()}>
                      Mesa {table.numeroMesa}
                      {table.nombrePersonalizado && ` - ${table.nombrePersonalizado}`}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Mesa personalizada</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedTable === 'custom'
                  ? 'Se asignará automáticamente la primera mesa disponible.'
                  : 'Solo se muestran mesas disponibles.'}
              </p>
            </div>

            {selectedTable === 'custom' && (
              <div>
                <label className="block text-sm font-medium mb-2">Nombre Personalizado *</label>
                <Input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ej: Cumpleaños Juan"
                />
                <p className="text-xs text-gray-500 mt-1">Este nombre será obligatorio para mesa personalizada.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Mesero *</label>
              <Select
                value={mesero || ''}
                onValueChange={(value) => setMesero(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un mesero" />
                </SelectTrigger>
                <SelectContent>
                  {users.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-gray-500">No hay usuarios</div>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user._id} value={user.nombreContacto || user.usuario}>
                        {user.nombreContacto || user.usuario}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Lista basada en usuarios del restaurante.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAccount} disabled={loading} className="bg-[#0D1748] hover:bg-[#0f1c5a]">
              {loading ? "Creando..." : "Abrir Mesa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showError && (
        <ErrorModal message={errorMessage} onClose={() => setShowError(false)} />
      )}
    </>
  );
}
