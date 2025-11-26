"use client";
import { useState } from "react";
import Header from "./Header";
import AdminNavTabs from "./NavTabs";
import CajeroNavTabs from "../cajero/NavTabs";
import { Drawer, DrawerTrigger } from "../ui/drawer";
import ProductAddDrawerContent from "./ProductAddDrawerContent";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type Props = {
  children?: React.ReactNode;
  search: string;
  onSearchChange: (search: string) => void;
  productsCount: number;
  onProductAdded?: () => void;
  isCajero?: boolean;
};

export default function DashboardShell({ children, search, onSearchChange, productsCount, onProductAdded, isCajero = false }: Props) {
  const isMd = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);
  const NavTabs = isCajero ? CajeroNavTabs : AdminNavTabs;

  return (
    <Drawer direction={isMd ? "right" : "bottom"} open={open} onOpenChange={setOpen}>
      <Header 
        placeholder={`Buscar entre ${productsCount} productos...`} 
        value={search} 
        onSearch={onSearchChange} 
      />
      <main className="flex flex-col">
        <NavTabs />
        {children}
        <DrawerTrigger>
          <div className="fixed right-4 md:right-6 bottom-4 md:bottom-6 z-50">
            <div
              title="Agregar platillo"
              aria-label="Agregar platillo"
              className="bg-Blue-700 hover:bg-Blue-600 active:scale-95 transform-gpu transition-all rounded-full p-0 shadow-2xl text-white flex items-center justify-center h-14 w-14 md:h-20 md:w-20 focus:outline-none focus:ring-4 focus:ring-Blue-300/40"
            >
              <span className="text-white text-3xl md:text-4xl leading-none font-extrabold select-none">+</span>
              <span className="sr-only">Agregar platillo</span>
            </div>
          </div>
        </DrawerTrigger>
      </main>
      <ProductAddDrawerContent onProductAdded={onProductAdded} />
    </Drawer>
  );
}
