"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChatSquare2Outline,
  DollarOutline,
  ChefHatOutline,
  SettingsOutline,
  WidgetOutline,
} from "solar-icon-set";

const tabs = [
  { href: "/cajero", label: "Platillos", icon: ChefHatOutline },
  { href: "/cajero/accounts", label: "Cuentas", icon: WidgetOutline },
  { href: "/cajero/reports", label: "Reportes", icon: ChatSquare2Outline },
  { href: "/cajero/cash", label: "Caja", icon: DollarOutline },
  { href: "/cajero/settings", label: "Ajustes", icon: SettingsOutline },
];

export default function NavTabs() {
  const pathname = usePathname() || "/";

  return (
    <div className="w-full overflow-x-auto bg-gray-50">
      <div className="flex flex-row items-center gap-2 px-4 md:px-10">
        {tabs.map((t) => {
          const active = pathname === t.href;
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex items-center md:px-6 px-3 py-2 md:py-3 gap-2 bg-Blue-50 text-Blue-700 rounded-xl font-semibold shadow-inner"
                  : "flex items-center md:px-6 px-3 py-2 md:py-3 gap-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              }
            >
              <div className="flex flex-row gap-2 md:gap-3 items-center">
                <Icon />
                <span className="font-medium text-sm md:text-base">{t.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
