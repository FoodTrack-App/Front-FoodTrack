"use client";

import React from "react";
import {
  ClockCircleOutline,
  BanknoteOutline,
  CardOutline,
  DollarOutline,
} from "solar-icon-set";

type Props = {
  id?: string;
  description: string;
  time: string;
  method: "Efectivo" | "Tarjeta" | "Transferencia" | "Otro";
  amount: number;
  type: "ingreso" | "egreso";
  isVenta?: boolean;
};

export default function MovementCard({
  description,
  time,
  method,
  amount,
  type,
  isVenta = false,
}: Props) {
  return (
    <div
      className={`p-5 gap-5 flex flex-row items-center ${
        isVenta 
          ? "bg-white border-gray-300" 
          : type === "ingreso"
          ? "bg-[#F0FDF4] border-[#A4F4CF]"
          : "bg-[#FFF1F2] border-[#FFC9C9]"
        } border-2 rounded-2xl`}
    >
      <div
        className={`relative ${
          isVenta
            ? "bg-gray-700 text-white"
            : type === "ingreso"
            ? "bg-[#00A63E] text-white"
            : "bg-[#EC003F] text-white"
          } p-4 rounded-2xl inline-flex items-center justify-center w-fit`}
      >
        <DollarOutline className="h-5 w-5" />
        <div
          className={`absolute -top-2 -right-2 p-1 bg-white ${
            isVenta 
              ? "text-gray-700" 
              : type === "ingreso" ? "text-[#009966]" : "text-[#EC003F]"
            } rounded-full w-6 h-6 flex items-center justify-center shadow-md`}
        >
          {type === "ingreso" ? (
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12l5 5L20 7"
              />
            </svg>
          ) : (
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 12H5"
              />
            </svg>
          )}
        </div>
      </div>
      <div className="w-full">
        <p
          className={`${
            isVenta 
              ? "text-gray-900" 
              : type === "ingreso" ? "text-[#004F3B]" : "text-[#82181A]"
            } font-sans text-base font-normal leading-relaxed not-italic`}
        >
          {description}
        </p>
        <p
          className={`font-sans text-base font-normal leading-relaxed not-italic ml-auto w-fit ${
            isVenta 
              ? "text-gray-700" 
              : type === "ingreso" ? "text-[#007A55]" : "text-[#C10007]"
            }`}
        >
          {type === "ingreso" ? `+$${amount}` : `-$${Math.abs(amount)}`}
        </p>
        <div className="flex md:flex-row flex-col md:gap-6 gap-1 mt-2">
          <div className="flex flex-row items-center gap-1 text-[#464646]">
            <ClockCircleOutline />
            <p className="text-[#464646]">{time}</p>
          </div>
          <div
            className={`flex flex-row items-center w-fit px-3 gap-2 rounded-2xl ${
              method === "Efectivo"
                ? "bg-[#D0FAE5] text-[#007A55]"
                : method === "Tarjeta"
                  ? "bg-[#EEF2FF] text-[#1E40AF]"
                  : "bg-[#FFF3E0] text-[#92400E]"
              }`}
          >
            {method === "Efectivo" ? (
              <BanknoteOutline />
            ) : method === "Tarjeta" ? (
              <CardOutline />
            ) : (
              <BanknoteOutline />
            )}
            <p>{method}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
