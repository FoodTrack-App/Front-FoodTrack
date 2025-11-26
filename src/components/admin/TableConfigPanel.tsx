"use client";

import { useState, useEffect } from "react";
import { Table } from "@/types/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";
import { Check } from "lucide-react";

export default function TableConfigPanel() {
  const [tables, setTables] = useState<Table[]>([]);
  const [totalMesas, setTotalMesas] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [claveRestaurante, setClaveRestaurante] = useState("");
  const [editingNames, setEditingNames] = useState<{ [key: string]: string }>({});
  const [savingTable, setSavingTable] = useState<string | null>(null);

  useEffect(() => {
    const clave = localStorage.getItem("claveRestaurante");
    if (clave) {
      setClaveRestaurante(clave);
    }
  }, []);

  useEffect(() => {
    if (!claveRestaurante) return;
    loadTables();
  }, [claveRestaurante]);

  const loadTables = async () => {
    try {
      const response = await fetch(
        `/api/tables/restaurant/${claveRestaurante}`
      );
      const data = await response.json();
      if (data.success) {
        setTables(data.data);
        setTotalMesas(data.data.length);
      }
    } catch (error) {
      console.error("Error al cargar mesas:", error);
    }
  };

  const handleConfigureTables = async () => {
    if (totalMesas < 1) {
      setErrorMessage("Debe haber al menos 1 mesa");
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/tables/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claveRestaurante, totalMesas }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage(
          `Mesas configuradas correctamente. Total: ${totalMesas}`
        );
        setShowSuccess(true);
        await loadTables();
      } else {
        setErrorMessage(data.message || "Error al configurar mesas");
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage("Error al configurar mesas");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (tableId: string, newName: string) => {
    setEditingNames((prev) => ({
      ...prev,
      [tableId]: newName,
    }));
  };

  const handleSaveTableName = async (tableId: string) => {
    const newName = editingNames[tableId];
    if (newName === undefined) return;

    setSavingTable(tableId);
    try {
      const response = await fetch(`/api/tables/${tableId}/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombrePersonalizado: newName }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage("Nombre de mesa actualizado");
        setShowSuccess(true);
        await loadTables();
        // Limpiar el estado de edición
        setEditingNames((prev) => {
          const newState = { ...prev };
          delete newState[tableId];
          return newState;
        });
      } else {
        setErrorMessage(data.message || "Error al actualizar nombre");
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage("Error al actualizar nombre de mesa");
      setShowError(true);
    } finally {
      setSavingTable(null);
    }
  };

  const getDisplayValue = (table: Table) => {
    return editingNames[table._id] !== undefined
      ? editingNames[table._id]
      : table.nombrePersonalizado || "";
  };

  const hasChanges = (table: Table) => {
    return (
      editingNames[table._id] !== undefined &&
      editingNames[table._id] !== (table.nombrePersonalizado || "")
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-[#0D1748]">Configuración de Mesas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Número Total de Mesas
              </label>
              <Input
                type="number"
                min="1"
                value={totalMesas}
                onChange={(e) => setTotalMesas(parseInt(e.target.value) || 0)}
                placeholder="Ej: 10"
              />
            </div>
            <Button onClick={handleConfigureTables} disabled={loading} className="bg-[#0D1748] hover:bg-[#0f1c5a]">
              {loading ? "Configurando..." : "Configurar Mesas"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card
            key={table._id}
            className={`border border-gray-100 hover:shadow-sm transition bg-white`}
          >
            <CardHeader>
              <CardTitle className="text-lg text-[#0D1748] flex items-center justify-between">
                <span>Mesa {table.numeroMesa}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${table.activa ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                  {table.activa ? "Ocupada" : "Disponible"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-gray-600">Configura un nombre para ubicarla fácilmente.</div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre personalizado:
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={getDisplayValue(table)}
                    onChange={(e) => handleNameChange(table._id, e.target.value)}
                    placeholder="Ej: Terraza"
                    className="text-sm flex-1"
                  />
                  {hasChanges(table) && (
                    <Button
                      size="sm"
                      onClick={() => handleSaveTableName(table._id)}
                      disabled={savingTable === table._id}
                      className="bg-green-600 hover:bg-green-700 text-white px-3"
                    >
                      {savingTable === table._id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showError && (
        <ErrorModal message={errorMessage} onClose={() => setShowError(false)} />
      )}
      {showSuccess && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}
