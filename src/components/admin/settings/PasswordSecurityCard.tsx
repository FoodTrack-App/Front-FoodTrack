"use client";
import CardContent from "@/components/admin/Cards";
import { LockOutline } from "solar-icon-set";

type Props = {
  lastPasswordChangeDays: number;
  isChanging: boolean;
  onModify: () => void;
  onUpdatePassword: () => void;
  onCancel: () => void;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
};

export default function PasswordSecurityCard({ 
  lastPasswordChangeDays,
  isChanging,
  onModify,
  onUpdatePassword,
  onCancel,
  currentPassword,
  newPassword,
  confirmPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
}: Props) {

  return (
    <CardContent
      variant={"4"}
      title="Seguridad de la Cuenta"
      icon={<LockOutline />}
      isEditingPassword={isChanging}
      onModify={onModify}
      onUpdatePassword={onUpdatePassword}
      onCancelPassword={onCancel}
    >
      {!isChanging ? (
        <div className="flex flex-col py-10 gap-3 items-center justify-center">
          <div className="text-negativo bg-negativo/10 rounded-full p-6">
            <LockOutline className="w-10 h-10" />
          </div>
          <p className="text-gray-700 text-center font-sans text-base not-italic font-normal leading-6">
            Tu contraseña está protegida
          </p>
          <p className="text-gray-500 text-center font-sans text-base not-italic font-normal leading-6">
            Última modificación: hace {lastPasswordChangeDays} días
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-gray-500 font-sans text-sm not-italic font-normal leading-[14px] items-center flex gap-2">
              Contraseña Actual
            </p>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
              className="text-navy-900 font-sans text-base not-italic font-normal leading-6 border-1 bg-white rounded-2xl p-3 border-negativo focus:outline-none focus:ring-2 focus:ring-negativo"
              placeholder="Ingresa tu contraseña actual"
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-gray-500 font-sans text-sm not-italic font-normal leading-[14px] items-center flex gap-2">
              Nueva Contraseña
            </p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              className="text-navy-900 font-sans text-base not-italic font-normal leading-6 border-1 bg-white rounded-2xl p-3 border-negativo focus:outline-none focus:ring-2 focus:ring-negativo"
              placeholder="Ingresa tu nueva contraseña"
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-gray-500 font-sans text-sm not-italic font-normal leading-[14px] items-center flex gap-2">
              Confirmar Nueva Contraseña
            </p>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              className="text-navy-900 font-sans text-base not-italic font-normal leading-6 border-1 bg-white rounded-2xl p-3 border-negativo focus:outline-none focus:ring-2 focus:ring-negativo"
              placeholder="Confirma tu nueva contraseña"
            />
          </div>
          <div className="text-navy-900 font-sans text-base not-italic font-normal leading-6 border-1 bg-Blue-200/20 rounded-2xl p-3 border-Blue-200/50 w-full">
            <p>
              La contraseña debe cumplir:
            </p>
            <ul className="list-disc list-inside ml-2">
              <li>Mínimo 8 caracteres</li>
              <li>Las contraseñas coinciden</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={onUpdatePassword}
              className="bg-[#009966] text-white rounded-2xl px-4 py-3 hover:bg-[#008855] transition-colors"
            >
              Actualizar Contraseña
            </button>
            <button
              onClick={onCancel}
              className="border-2 border-gray-700/50 text-gray-700 rounded-2xl px-4 py-3 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </CardContent>
  );
}
