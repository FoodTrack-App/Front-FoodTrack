"use client";

import Header from "@/components/admin/Header";
import NavTabs from "@/components/cajero/NavTabs";
import {
  CourseDownOutline,
  CourseUpOutline,
  DollarOutline,
  WalletOutline,
} from "solar-icon-set";
import React, { useMemo, useState, useEffect } from "react";
import { Calendar22 } from "@/components/admin/DatePicker";
import MovementCard from "@/components/admin/MovementCard";
import SummaryCard from "@/components/admin/SummaryCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Movement {
  _id: string;
  tipo: "ingreso" | "egreso";
  descripcion: string;
  monto: number;
  metodoPago: "efectivo" | "tarjeta" | "transferencia";
  fecha: string;
  cuentaId?: string;
  esVenta?: boolean;
}

interface CashSummary {
  ingresos: number;
  egresos: number;
  ventasDelDia: number;
  balance: number;
  countIngresos: number;
  countEgresos: number;
}

export default function CajeroCashPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [movements, setMovements] = useState<Movement[]>([]);
  const [summary, setSummary] = useState<CashSummary>({
    ingresos: 0,
    egresos: 0,
    ventasDelDia: 0,
    balance: 0,
    countIngresos: 0,
    countEgresos: 0,
  });
  const [loading, setLoading] = useState(false);
  const [claveRestaurante, setClaveRestaurante] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "ingreso" as "ingreso" | "egreso",
    descripcion: "",
    monto: "",
    metodoPago: "efectivo" as "efectivo" | "tarjeta" | "transferencia",
  });

  useEffect(() => {
    const clave = localStorage.getItem("claveRestaurante");
    if (clave) {
      setClaveRestaurante(clave);
    }
  }, []);

  function formatDateToISO(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const isoDate = useMemo(() => formatDateToISO(selectedDate), [selectedDate]);

  useEffect(() => {
    if (!claveRestaurante) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch movements
        const movementsRes = await fetch(
          `/api/movements/restaurant/${claveRestaurante}?fecha=${isoDate}`
        );
        const movementsData = await movementsRes.json();
        
        if (movementsRes.ok && movementsData.success) {
          setMovements(movementsData.movements || []);
        }

        // Fetch summary
        const summaryRes = await fetch(
          `/api/movements/restaurant/${claveRestaurante}/summary?fecha=${isoDate}`
        );
        const summaryData = await summaryRes.json();
        
        if (summaryRes.ok && summaryData.success) {
          setSummary({
            ingresos: summaryData.ingresos || 0,
            egresos: summaryData.egresos || 0,
            ventasDelDia: summaryData.ventasDelDia || 0,
            balance: summaryData.balance || 0,
            countIngresos: summaryData.countIngresos || 0,
            countEgresos: summaryData.countEgresos || 0,
          });
        }
      } catch (error) {
        console.error("Error al obtener datos de caja:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [claveRestaurante, isoDate]);

  const handleCreateMovement = async () => {
    if (!formData.descripcion || !formData.monto) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      const response = await fetch("/api/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claveRestaurante,
          tipo: formData.tipo,
          descripcion: formData.descripcion,
          monto: parseFloat(formData.monto),
          metodoPago: formData.metodoPago,
        }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({
          tipo: "ingreso",
          descripcion: "",
          monto: "",
          metodoPago: "efectivo",
        });
        // Refresh data
        const movementsRes = await fetch(
          `/api/movements/restaurant/${claveRestaurante}?fecha=${isoDate}`
        );
        const movementsData = await movementsRes.json();
        if (movementsRes.ok && movementsData.success) {
          setMovements(movementsData.movements || []);
        }
        const summaryRes = await fetch(
          `/api/movements/restaurant/${claveRestaurante}/summary?fecha=${isoDate}`
        );
        const summaryData = await summaryRes.json();
        if (summaryRes.ok && summaryData.success) {
          setSummary({
            ingresos: summaryData.ingresos || 0,
            egresos: summaryData.egresos || 0,
            ventasDelDia: summaryData.ventasDelDia || 0,
            balance: summaryData.balance || 0,
            countIngresos: summaryData.countIngresos || 0,
            countEgresos: summaryData.countEgresos || 0,
          });
        }
      } else {
        const data = await response.json();
        alert(data.message || "Error al crear movimiento");
      }
    } catch (error) {
      console.error("Error al crear movimiento:", error);
      alert("Error al crear movimiento");
    }
  };

  return (
    <>
      <Header showSearch={false} />
      <main className="flex flex-col">
        <NavTabs />
        <div className="flex flex-col items-start gap-8 p-4 sm:p-6 lg:p-10 w-full">
          <div className=" flex flex-col gap-6 w-full">
            <div className="flex flex-col md:flex-row md:justify-between">
              <section className="flex flex-row gap-4 items-center w-full flex-1">
                <div className="p-3 bg-Blue-700 text-gray-50 rounded-2xl">
                  <WalletOutline className="w-8 h-8" />
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-900 font-sans text-2xl font-normal leading-9 not-italic">
                    Gestión de Caja
                  </p>
                  <p className="text-gray-700 font-sans text-base font-normal leading-relaxed not-italic">
                    Administra los movimientos de efectivo
                  </p>
                </div>
              </section>
              <section className="flex flex-col items-end gap-3 md:gap-4 md:flex-row md:items-center">
                <div className="text-gray-700 w-fit">
                  <div className="">
                    <Calendar22
                      value={selectedDate}
                      onChange={(d) => setSelectedDate(d)}
                    />
                  </div>
                </div>

              </section>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-10 w-full">
              <SummaryCard
                className="bg-white border-2 border-gray-300"
                icon={
                  <div className="bg-gray-700 rounded-2xl p-3 w-fit h-fit text-gray-50">
                    <WalletOutline className="w-6 h-6" />
                  </div>
                }
                title="Ventas del Día"
                value={
                  summary.ventasDelDia !== 0 ? `$${summary.ventasDelDia}` : "$0"
                }
              />

              <SummaryCard
                className="bg-[#F0FDF4] border-2 border-[#A4F4CF]"
                icon={
                  <div className="bg-[#00A63E] rounded-2xl p-3 w-fit h-fit text-gray-50">
                    <CourseUpOutline className="w-6 h-6" />
                  </div>
                }
                title="Total Ingresos"
                value={summary.ingresos !== 0 ? `+$${summary.ingresos}` : "$0"}
                badge={
                  <p className="bg-estado-exito/10 rounded-2xl text-[#00A63E] h-fit w-fit p-2">
                    +{summary.countIngresos}
                  </p>
                }
              />

              <SummaryCard
                className="bg-[#FFF1F2] border-2 border-[#FFC9C9]"
                icon={
                  <div className="bg-[#C24343] rounded-2xl p-3 w-fit h-fit text-gray-50">
                    <CourseDownOutline className="w-6 h-6" />
                  </div>
                }
                title="Total Egresos"
                value={summary.egresos !== 0 ? `-$${summary.egresos}` : "$0"}
                badge={
                  <p className="bg-[#FFE2E2] rounded-2xl text-[#C24343] h-fit w-fit p-2">
                    -{summary.countEgresos}
                  </p>
                }
              />

              <SummaryCard
                className="bg-[#C5E3EE4D] border-2 border-[#7EC2FD4D]"
                icon={
                  <div className="bg-Blue-700 rounded-2xl p-3 w-fit h-fit text-gray-50">
                    <DollarOutline className="w-6 h-6" />
                  </div>
                }
                title="Balance Actual"
                value={summary.balance !== 0 ? `$${summary.balance}` : "$0"}
              />
            </div>
          </div>
          <div className="bg-white border-2 border-gray-300 rounded-2xl p-4 sm:p-6 lg:p-8 gap-12 w-full">
            <section className="flex flex-col md:flex-row justify-between gap-4 md:gap-0">
              <div className="gap-1 flex flex-col">
                <p className="text-[#151515] font-sans text-xl font-normal leading-[30px] not-italic">
                  Movimientos del Día
                </p>
                <p className="text-[#464646] font-sans text-base font-normal leading-relaxed not-italic">
                  Historial de transacciones registradas
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="self-end md:self-auto bg-Blue-700 h-fit w-fit text-white font-sans text-base font-normal leading-relaxed not-italic py-2 px-4 rounded-2xl hover:bg-Blue-800 transition-colors"
              >
                + Generar Movimiento
              </button>
            </section>
            <section className="gap-6 sm:gap-8 lg:gap-12 flex flex-col">
              {loading ? (
                <p className="text-gray-500">Cargando movimientos...</p>
              ) : movements.length === 0 ? (
                <p className="text-gray-500">
                  No hay movimientos para la fecha seleccionada.
                </p>
              ) : (
                movements.map((m) => {
                  const fecha = new Date(m.fecha);
                  const time = fecha.toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <MovementCard
                      key={m._id}
                      description={m.descripcion}
                      time={time}
                      method={
                        m.metodoPago === "efectivo"
                          ? "Efectivo"
                          : m.metodoPago === "tarjeta"
                          ? "Tarjeta"
                          : "Transferencia"
                      }
                      amount={m.tipo === "ingreso" ? m.monto : -m.monto}
                      type={m.tipo}
                      isVenta={(m as any).esVenta || false}
                    />
                  );
                })
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Modal Generar Movimiento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generar Movimiento</DialogTitle>
            <DialogDescription>
              Registra un nuevo ingreso o egreso de efectivo
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tipo">Tipo de movimiento</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "ingreso" | "egreso") =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                  <SelectItem value="egreso">Egreso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Ej: Compra de insumos, Pago de servicios..."
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="monto">Monto</Label>
              <Input
                id="monto"
                type="number"
                placeholder="0.00"
                value={formData.monto}
                onChange={(e) =>
                  setFormData({ ...formData, monto: e.target.value })
                }
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="metodoPago">Método de pago</Label>
              <Select
                value={formData.metodoPago}
                onValueChange={(
                  value: "efectivo" | "tarjeta" | "transferencia"
                ) => setFormData({ ...formData, metodoPago: value })}
              >
                <SelectTrigger id="metodoPago">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateMovement}
              className="px-4 py-2 rounded-lg bg-Blue-700 text-white hover:bg-Blue-800 transition-colors"
            >
              Generar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
