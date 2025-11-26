"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActiveAccountsGrid from "@/components/admin/ActiveAccountsGrid";
import OpenTableModal from "@/components/admin/OpenTableModal";
import AccountManagement from "@/components/admin/AccountManagement";
import Header from "@/components/admin/Header";
import NavTabs from "@/components/mesero/NavTabs";

export default function MeseroAccountsPage() {
  const [showOpenTableModal, setShowOpenTableModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAccountCreated = (accountId: string) => {
    setRefreshTrigger((prev) => prev + 1);
    setSelectedAccountId(accountId);
  };

  const handleAccountClosed = () => {
    setSelectedAccountId(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAccountClick = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  if (selectedAccountId) {
    return (
      <>
        <Header placeholder="Buscar Mesa/ Pedido" value="" onSearch={() => {}} />
        <main className="flex flex-col">
          <NavTabs />
          <AccountManagement
            accountId={selectedAccountId}
            onClose={() => setSelectedAccountId(null)}
            onAccountClosed={handleAccountClosed}
            isMesero={true}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <Header placeholder="Buscar Mesa/ Pedido" value="" onSearch={() => {}} />
      <main className="flex flex-col">
        <NavTabs />
        <div className="py-6 md:py-8 px-4 md:px-10">
          <ActiveAccountsGrid
            onAccountClick={handleAccountClick}
            onOpenNewTable={() => setShowOpenTableModal(true)}
            refreshTrigger={refreshTrigger}
            filterByMesero={true}
          />

          <OpenTableModal
            isOpen={showOpenTableModal}
            onClose={() => setShowOpenTableModal(false)}
            onAccountCreated={handleAccountCreated}
            isMesero={true}
          />
        </div>
      </main>
    </>
  );
}
