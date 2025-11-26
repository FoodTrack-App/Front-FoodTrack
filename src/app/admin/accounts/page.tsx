"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TableConfigPanel from "@/components/admin/TableConfigPanel";
import ActiveAccountsGrid from "@/components/admin/ActiveAccountsGrid";
import OpenTableModal from "@/components/admin/OpenTableModal";
import AccountManagement from "@/components/admin/AccountManagement";
import Header from "@/components/admin/Header";
import NavTabs from "@/components/admin/NavTabs";

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState("accounts");
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
            isMesero={false}
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="accounts">Cuentas Abiertas</TabsTrigger>
              <TabsTrigger value="config">Configuración de Mesas</TabsTrigger>
            </TabsList>

            <TabsContent value="accounts">
              <ActiveAccountsGrid
                onAccountClick={handleAccountClick}
                onOpenNewTable={() => setShowOpenTableModal(true)}
                refreshTrigger={refreshTrigger}
                filterByMesero={false}
              />
            </TabsContent>

            <TabsContent value="config">
              <TableConfigPanel />
            </TabsContent>
          </Tabs>

          <OpenTableModal
            isOpen={showOpenTableModal}
            onClose={() => setShowOpenTableModal(false)}
            onAccountCreated={handleAccountCreated}
            isMesero={false}
          />
        </div>
      </main>
    </>
  );
}
