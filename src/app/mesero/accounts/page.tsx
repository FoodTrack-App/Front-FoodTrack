"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/admin/Header";
import NavTabs from "@/components/mesero/NavTabs";

export default function MeseroAccountsPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }
    
    const userInfo = JSON.parse(user);
    if (userInfo.rol !== "Mesero") {
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
            Gestión de Cuentas
          </h1>
          <div className="mt-8 p-6 bg-Blue-100 rounded-lg max-w-2xl">
            <p className="text-gray-700 text-center">
              Esta sección está en desarrollo. Aquí podrás ver y gestionar las cuentas de tus mesas.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
