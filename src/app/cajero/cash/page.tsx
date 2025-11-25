"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/admin/Header";
import NavTabs from "@/components/cajero/NavTabs";

export default function CajeroCashPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }
    
    const userInfo = JSON.parse(user);
    if (userInfo.rol !== "Cajero") {
      router.push("/login");
      return;
    }
  }, [router]);

  return (
    <>
      <Header showSearch={false} />
      <NavTabs />
      <main className="m-10 flex flex-col gap-8">
        <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh]">
          <h1 className="text-gray-800 text-3xl font-actor font-medium">
            Gestión de Caja
          </h1>
          <div className="mt-8 p-6 bg-Blue-100 rounded-lg max-w-2xl">
            <p className="text-gray-700 text-center">
              Esta sección está en desarrollo. Aquí podrás gestionar apertura/cierre de caja y movimientos.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
