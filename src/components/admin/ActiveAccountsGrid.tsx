"use client";

import { useState, useEffect } from "react";
import { Account } from "@/types/accounts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Clock } from "lucide-react";

interface ActiveAccountsGridProps {
  onAccountClick: (accountId: string) => void;
  onOpenNewTable: () => void;
  refreshTrigger?: number;
  filterByMesero?: boolean;
}

export default function ActiveAccountsGrid({
  onAccountClick,
  onOpenNewTable,
  refreshTrigger,
  filterByMesero = false,
}: ActiveAccountsGridProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [claveRestaurante, setClaveRestaurante] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");

  useEffect(() => {
    const clave = localStorage.getItem("claveRestaurante");
    if (clave) {
      setClaveRestaurante(clave);
    }

    // Obtener el nombre del usuario actual para filtrar
    const user = localStorage.getItem("user");
    if (user) {
      const userInfo = JSON.parse(user);
      setCurrentUserName(userInfo.nombreContacto || userInfo.usuario || "");
    }
  }, []);

  useEffect(() => {
    if (!claveRestaurante) return;
    loadOpenAccounts();
  }, [claveRestaurante, refreshTrigger]);

  const loadOpenAccounts = async () => {
    try {
      const response = await fetch(
        `/api/accounts/restaurant/${claveRestaurante}/open`
      );
      const data = await response.json();
      if (data.success) {
        // Si filterByMesero es true, filtrar solo cuentas del mesero actual
        let filteredAccounts = data.data;
        if (filterByMesero && currentUserName) {
          filteredAccounts = data.data.filter(
            (account: Account) => account.mesero === currentUserName
          );
        }
        setAccounts(filteredAccounts);
      }
    } catch (error) {
      console.error("Error al cargar cuentas:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="text-center py-8">Cargando cuentas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0D1748]">Cuentas Abiertas</h2>
        <Button onClick={onOpenNewTable} size="lg" className="bg-[#0D1748] hover:bg-[#0f1c5a]">
          <Plus className="mr-2 h-5 w-5" />
          Abrir Mesa Nueva
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="py-12 text-center text-gray-500">
            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg">No hay cuentas abiertas</p>
            <p className="text-sm mt-2">
              Haz clic en "Abrir Mesa Nueva" para comenzar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accounts.map((account) => {
            const isFinalized = account.estado === "finalizada";
            return (
              <Card
                key={account._id}
                className={`rounded-2xl overflow-hidden text-left shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 cursor-pointer ${
                  isFinalized
                    ? "bg-gray-50 border-gray-200 opacity-80"
                    : "bg-white border-gray-100"
                }`}
                onClick={() => onAccountClick(account._id)}
              >
                <div
                  className={`relative h-16 ${
                    isFinalized
                      ? "bg-gradient-to-r from-gray-100 to-gray-200"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50"
                  }`}
                >
                  <div
                    className={`absolute top-2 left-2 h-7 w-7 rounded-md text-white grid place-items-center ${
                      isFinalized ? "bg-gray-500" : "bg-[#0D1748]"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                  </div>
                  <span
                    className={`absolute top-2 right-2 text-[11px] px-2.5 py-1 rounded-full border ${
                      isFinalized
                        ? "bg-gray-200 text-gray-700 border-gray-300"
                        : "bg-blue-50 text-blue-700 border-blue-100"
                    }`}
                  >
                    {account.items.length} items
                  </span>
                  <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-white/70 border border-gray-200 text-gray-700 inline-flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(account.fechaApertura)}
                  </span>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${
                            isFinalized
                              ? "bg-gray-100 text-gray-700 border-gray-200"
                              : "bg-blue-50 text-blue-700 border-blue-100"
                          }`}
                        >
                          Mesa {account.mesa.numeroMesa}
                        </div>
                        {isFinalized && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-medium">
                            Finalizada
                          </span>
                        )}
                      </div>
                      <h3
                        className={`text-sm font-semibold ${
                          isFinalized ? "text-gray-600" : "text-[#0D1748]"
                        }`}
                      >
                        Ticket #{account.numeroTicket}
                      </h3>
                      {account.mesa.nombrePersonalizado && (
                        <p className="text-xs text-gray-500">
                          {account.mesa.nombrePersonalizado}
                        </p>
                      )}
                      <p className="text-xs text-gray-600">
                        Mesero: {account.mesero}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <p
                        className={`text-lg sm:text-xl font-bold mt-1 ${
                          isFinalized ? "text-gray-600" : "text-[#0D1748]"
                        }`}
                      >
                        ${account.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
