"use client";
import CardContent from "@/components/admin/Cards";
import { LetterOutline, PhoneOutline, UserOutline } from "solar-icon-set";

type Props = {
  initialFullName: string;
  initialEmail: string;
  initialPhone: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  fullName: string;
  email: string;
  phone: string;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
};

export default function ContactInfoCard({ 
  isEditing,
  onEdit,
  onSave,
  onCancel,
  fullName,
  email,
  phone,
  onFullNameChange,
  onEmailChange,
  onPhoneChange,
}: Props) {
  const PHONE_MAX_DIGITS = 10;

  return (
    <CardContent
      variant={"3"}
      title="Información de Contacto"
      icon={<LetterOutline />}
      isEditing={isEditing}
      onEdit={onEdit}
      onSave={onSave}
      onCancel={onCancel}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-gray-500 font-sans text-sm not-italic font-normal leading-[14px] items-center flex gap-2">
            <UserOutline />
            Nombre Completo
          </p>
          {isEditing ? (
            <input
              type="text"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              className="text-navy-900 font-sans text-base not-italic font-normal leading-6 border-1 bg-white rounded-2xl p-3 border-Blue-700 focus:outline-none focus:ring-2 focus:ring-Blue-700"
              placeholder="Ingresa tu nombre completo"
            />
          ) : (
            <p className="text-navy-900 font-sans text-base not-italic font-normal leading-6 border-1 bg-gray-100 rounded-2xl p-3 border-gray-300">
              {fullName}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-gray-500 font-sans text-sm not-italic font-normal leading-[14px] items-center flex gap-2">
            <LetterOutline />
            Correo Electrónico
          </p>
          {isEditing ? (
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="text-navy-900 font-sans text-base not-italic font-normal leading-6 border-1 bg-white rounded-2xl p-3 border-Blue-700 focus:outline-none focus:ring-2 focus:ring-Blue-700"
              placeholder="correo@ejemplo.com"
            />
          ) : (
            <p className="text-navy-900 font-sans text-base not-italic font-normal leading-6 border-1 bg-gray-100 rounded-2xl p-3 border-gray-300">
              {email}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-gray-500 font-sans text-sm not-italic font-normal leading-[14px] items-center flex gap-2">
            <PhoneOutline />
            Teléfono
          </p>
          {isEditing ? (
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                const v = e.target.value;
                const digitsOnly = v.replace(/\D/g, "").slice(0, PHONE_MAX_DIGITS);
                onPhoneChange(digitsOnly);
              }}
              onKeyDown={(e) => {
                const allowed = new Set([
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                  "Home",
                  "End",
                ]);
                if (allowed.has(e.key)) return;
                const input = e.currentTarget as HTMLInputElement;
                const hasSelection = input.selectionStart !== input.selectionEnd;
                if (!hasSelection && input.value.length >= PHONE_MAX_DIGITS) {
                  e.preventDefault();
                  return;
                }
                if (!/^\d$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              inputMode="numeric"
              pattern="\\d*"
              maxLength={PHONE_MAX_DIGITS}
              className="text-navy-900 font-sans text-base not-italic font-normal leading-6 border-1 bg-white rounded-2xl p-3 border-Blue-700 focus:outline-none focus:ring-2 focus:ring-Blue-700"
              placeholder="+52 55 1234 5678"
            />
          ) : (
            <p className="text-navy-900 font-sans text-base not-italic font-normal leading-6 border-1 bg-gray-100 rounded-2xl p-3 border-gray-300">
              {phone}
            </p>
          )}
        </div>
      </div>
    </CardContent>
  );
}
