"use client";
import Header from "@/components/admin/Header";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavTabs from "@/components/admin/NavTabs";
import IconBox from "@/components/ui/iconBox";
import { Bill } from "@solar-icons/react";
import { UserPlusOutline, UsersGroupRoundedOutline } from "solar-icon-set";
import UserStatCard from "@/components/admin/users/UserStatCard";
import UserCard from "@/components/admin/users/UserCard";
import UserFilters from "@/components/admin/users/UserFilters";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import AddUserDrawer from "@/components/admin/AddUserDrawer";
import EditUserDrawer from "@/components/admin/EditUserDrawer";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";

export default function UsersPage() {
    const router = useRouter();
    const [roleFilter, setRoleFilter] = useState<'all' | 'meseros' | 'cajeros'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const isMd = useMediaQuery("(min-width: 768px)");
    const [open, setOpen] = useState(false); // Add User Drawer
    const [openEdit, setOpenEdit] = useState(false); // Edit User Drawer
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userList, setUserList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [claveRestaurante, setClaveRestaurante] = useState("");
    
    // Estados para modales
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const restaurant = localStorage.getItem("restaurant");
            if (!restaurant) {
                router.push("/activate");
                return;
            }

            const restaurantInfo = JSON.parse(restaurant);
            const clave = restaurantInfo.claveRestaurante;
            setClaveRestaurante(clave);

            console.log("Cargando usuarios para restaurante:", clave);

            const response = await fetch(`/api/users/restaurant/${clave}`);
            const data = await response.json();

            console.log("Respuesta del servidor:", data);
            console.log("Usuarios recibidos:", data.data);

            if (data.success) {
                setUserList(data.data);
                console.log("Total de usuarios cargados:", data.data.length);
            } else {
                setErrorMessage(data.message || "Error al cargar usuarios");
                setShowErrorModal(true);
            }

            setLoading(false);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            setErrorMessage("Error de conexión al cargar usuarios");
            setShowErrorModal(true);
            setLoading(false);
        }
    };

    // Filtrar usuarios
    const filteredUsers = useMemo(() => {
        return userList.filter(user => {
            // Filtro por búsqueda
            const matchesSearch = (user.usuario || "").toLowerCase().includes(searchTerm.toLowerCase());

            // Filtro por rol
            const matchesRole =
                roleFilter === 'all' ||
                (roleFilter === 'meseros' && user.rol === 'Mesero') ||
                (roleFilter === 'cajeros' && user.rol === 'Cajero');

            return matchesSearch && matchesRole;
        });
    }, [userList, searchTerm, roleFilter]);

    // Calcular totales
    const totalUsers = userList.length;
    const totalMeseros = userList.filter(u => u.rol === 'Mesero').length;
    const totalCajeros = userList.filter(u => u.rol === 'Cajero').length;

    if (loading) {
        return (
            <>
                <Header showSearch={false} />
                <NavTabs />
                <main className="m-10 flex items-center justify-center">
                    <p className="text-gray-500">Cargando usuarios...</p>
                </main>
            </>
        );
    }

    return (
        <>
            {showErrorModal && (
                <ErrorModal message={errorMessage} onClose={() => setShowErrorModal(false)} />
            )}
            {showSuccessModal && (
                <SuccessModal message={successMessage} onClose={() => setShowSuccessModal(false)} />
            )}
            <Drawer direction={isMd ? "right" : "bottom"} open={open} onOpenChange={setOpen}>
                <Header showSearch={false} />
                <NavTabs />
                <main className="m-10 flex flex-col gap-8">
                    <section className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 ">
                        <div className="flex flex-row gap-4">
                            <IconBox
                                icon={<UsersGroupRoundedOutline className="w-10 h-10" />}
                                bgClass="bg-Blue-700"
                                textClass="text-white"
                            />
                            <div className="flex flex-col">
                                <p className="text-gray-900 font-sans text-2xl not-italic font-normal leading-9">
                                    Gestión de Usuarios
                                </p>
                                <p className="text-gray-500 font-sans text-base not-italic font-normal leading-6">
                                    Administra el personal del restaurante
                                </p>
                            </div>
                        </div>
                        <DrawerTrigger>
                            <div className="bg-Blue-700 hover:bg-navy-900 rounded-2xl p-3 text-white gap-4 flex flex-row items-center">
                                <UserPlusOutline />
                                Agregar Usuario
                            </div>
                        </DrawerTrigger>
                    </section>
                    <section className="flex flex-col md:grid md:grid-cols-3 gap-4">
                        <UserStatCard
                            title="Total Usuarios"
                            totalUsers={totalUsers}
                            icon={<UsersGroupRoundedOutline className="h-8 w-8" />} />
                        <UserStatCard
                            title="Meseros"
                            totalUsers={totalMeseros}
                            icon={<img src="/spoon-and-fork.svg" className="h-8 w-8" />} />
                        <UserStatCard
                            title="Cajeros"
                            totalUsers={totalCajeros}
                            icon={<Bill weight="Outline" className="h-8 w-8" />} />
                    </section>
                    <UserFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        roleFilter={roleFilter}
                        onRoleFilterChange={setRoleFilter}
                    />
                    <section className="flex flex-col md:grid md:grid-cols-3 gap-4">
                        {filteredUsers.map(user => (
                            <UserCard
                                key={user._id}
                                userName={user.usuario}
                                contactName={user.nombreContacto}
                                userRol={user.rol}
                                userPhone={user.telefonoContacto || "Sin teléfono"}
                                onClick={() => {
                                    setSelectedUser(user);
                                    setOpenEdit(true);
                                }}
                            />
                        ))}
                    </section>
                </main>
                <AddUserDrawer 
                    claveRestaurante={claveRestaurante}
                    onUserAdded={(newUser) => {
                        setUserList(prev => [...prev, newUser]);
                        setSuccessMessage("Usuario agregado exitosamente");
                        setShowSuccessModal(true);
                        setOpen(false);
                    }}
                    onError={(message) => {
                        setErrorMessage(message);
                        setShowErrorModal(true);
                    }}
                />
            </Drawer>
            {/* Drawer edición usuario */}
            <Drawer direction={isMd ? "right" : "bottom"} open={openEdit} onOpenChange={setOpenEdit}>
                <EditUserDrawer
                    user={selectedUser}
                    onSave={(updated) => {
                        setUserList(prev => prev.map(u => 
                            u._id === updated._id ? updated : u
                        ));
                        setSuccessMessage("Usuario actualizado exitosamente");
                        setShowSuccessModal(true);
                        setOpenEdit(false);
                        setSelectedUser(null);
                    }}
                    onDelete={(id) => {
                        setUserList(prev => prev.filter(u => u._id !== id));
                        setSuccessMessage("Usuario eliminado exitosamente");
                        setShowSuccessModal(true);
                        setOpenEdit(false);
                        setSelectedUser(null);
                    }}
                    onError={(message) => {
                        setErrorMessage(message);
                        setShowErrorModal(true);
                    }}
                />
            </Drawer>
        </>)
}