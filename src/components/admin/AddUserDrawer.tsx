'use client';
import { ShieldMinimalisticOutline, UserOutline } from "solar-icon-set";
import { useRef, useState } from "react";
import { DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "../ui/drawer";

type AddUserDrawerProps = {
    claveRestaurante: string;
    onUserAdded: (user: any) => void;
    onError: (message: string) => void;
};

function Input({ titulo, holder, type = "text", value, onChange, error }: { titulo: string, holder: string, type?: "text" | "password" | "select", value?: string, onChange?: (value: string) => void, error?: string | null }) {
    return (
        <div className="gap-2 flex flex-col">
            <div className="flex flex-row gap-2 items-center text-navy-900 font-sans text-sm not-italic font-normal leading-none">
                <UserOutline />
                {titulo}
            </div>
            {type === "select" ? (
                <select
                    className="flex px-3 py-1 items-center self-stretch rounded-[14px] border border-gray-300 bg-gray-50"
                    value={value ?? ""}
                    onChange={(e) => onChange?.(e.target.value)}
                >
                    <option value="">Seleccionar rol</option>
                    <option value="Mesero">Mesero</option>
                    <option value="Cajero">Cajero</option>
                </select>
            ) : (
                <input
                    type={type}
                    autoComplete={'new-password'}
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className="flex px-3 py-1 items-center self-stretch rounded-[14px] border border-gray-300 bg-gray-50"
                    placeholder={holder}
                    value={value ?? ""}
                    onChange={(e) => onChange?.(e.target.value)} />
            )}
            {error ? (
                <p className="text-negativo text-sm">{error}</p>
            ) : null}
        </div>
    )
}

export default function AddUserDrawer({ claveRestaurante, onUserAdded, onError }: AddUserDrawerProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<"" | "Mesero" | "Cajero">("");
    const closeRef = useRef<HTMLButtonElement>(null);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmError, setConfirmError] = useState<string | null>(null);
    const [roleError, setRoleError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const clearForm = () => {
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setRole("");
        setUsernameError(null);
        setPasswordError(null);
        setConfirmError(null);
        setRoleError(null);
    };

    const handleAddUser = async () => {
        const name = username.trim();
        let hasError = false;
        if (!name) {
            setUsernameError("El nombre de usuario es obligatorio");
            hasError = true;
        } else {
            setUsernameError(null);
        }
        if (!password || password.length < 8) {
            setPasswordError("La contraseña debe tener al menos 8 caracteres");
            hasError = true;
        } else {
            setPasswordError(null);
        }
        if (password !== confirmPassword) {
            setConfirmError("Las contraseñas no coinciden");
            hasError = true;
        } else {
            setConfirmError(null);
        }
        if (!role) {
            setRoleError("Selecciona un rol (Mesero o Cajero)");
            hasError = true;
        } else {
            setRoleError(null);
        }

        if (hasError) return;

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario: name,
                    contraseña: password,
                    rol: role,
                    claveRestaurante: claveRestaurante,
                }),
            });

            const data = await response.json();

            if (data.success) {
                onUserAdded(data.data);
                closeRef.current?.click();
                clearForm();
            } else {
                onError(data.message || "Error al crear usuario");
            }
        } catch (error) {
            console.error("Error al crear usuario:", error);
            onError("Error de conexión al crear usuario");
        } finally {
            setIsSubmitting(false);
        }
    };
    const description = role === "Mesero"
        ? "Puede tomar órdenes, gestionar mesas y ver comandas asignadas."
        : role === "Cajero"
            ? "Puede cobrar pedidos, gestionar caja y ver pagos."
            : "Selecciona un rol para ver su descripción.";
    return (
        <DrawerContent className="bg-gray-50 flex flex-col" onPointerDownOutside={clearForm} onEscapeKeyDown={clearForm}>
            <DrawerHeader className="px-8 py-6 bg-navy-900 md:sticky md:top-0 md:z-10">
                <DrawerTitle className="text-white font-arial text-[24px] font-bold leading-[32px]">
                    Agregar Nuevo Usuarios
                </DrawerTitle>
            </DrawerHeader>
            <div className="px-5 py-2 gap-5 flex flex-col flex-1 overflow-y-auto">
                <Input
                    titulo="Nombre de Usuario *"
                    holder="Ej. Juan Pérez"
                    value={username}
                    onChange={(v) => { setUsername(v); if (usernameError) setUsernameError(null); }}
                    error={usernameError}
                />
                <Input
                    titulo="Contraseña *"
                    holder="Mínimo 8 caracteres"
                    type="password"
                    value={password}
                    onChange={(v) => { setPassword(v); if (passwordError) setPasswordError(null); }}
                    error={passwordError}
                />
                <Input
                    titulo="Repetir Contraseña *"
                    holder="Mínimo 8 caracteres"
                    type="password"
                    value={confirmPassword}
                    onChange={(v) => { setConfirmPassword(v); if (confirmError) setConfirmError(null); }}
                    error={confirmError}
                />
                <Input
                    titulo="Rol *"
                    holder="Seleccionar rol"
                    type="select"
                    value={role}
                    onChange={(v) => { setRole(v as "" | "Mesero" | "Cajero"); if (roleError) setRoleError(null); }}
                    error={roleError}
                />
                <div className="flex p-4 flex-col items-start self-stretch rounded-2xl border-1 border-Blue-200 bg-Blue-200/20">
                    <div className="text-navy-900 font-sans text-base not-italic font-normal leading-6 flex flex-row gap-2 items-center">
                        <ShieldMinimalisticOutline />
                        Descripción del rol:
                    </div>
                    <p className="text-gray-700 font-sans text-sm not-italic font-normal leading-5">
                        {description}
                    </p>
                </div>
                <div className="flex p-4 flex-col items-start self-stretch rounded-2xl border-1 border-Blue-200 bg-Blue-200/20">
                    <div className="text-navy-900 font-sans text-base not-italic font-normal leading-6 flex flex-row gap-2 items-center">
                        * Campos requeridos
                    </div>
                </div>
            </div>
            <DrawerFooter className="px-8 gap-4 py-4 flex flex-row justify-between items-center border-t-gray-500 border-t-2 w-full bg-gray-100">
                <DrawerClose asChild>
                    <button ref={closeRef} className="hidden" aria-hidden="true" />
                </DrawerClose>
                <DrawerClose asChild>
                    <div 
                        onClick={clearForm}
                        className="w-fit text-gray-700 flex gap-2 items-center border-gray-700/50 border-2 rounded-2xl  py-4 px-3 cursor-pointer">
                        Cancelar
                    </div>
                </DrawerClose>
                <button 
                    onClick={handleAddUser} 
                    disabled={isSubmitting}
                    className="w-full bg-Blue-700 rounded-2xl py-4 px-3 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Agregando..." : "Agregar Usuario"}
                </button>
            </DrawerFooter>
        </DrawerContent>
    );
}