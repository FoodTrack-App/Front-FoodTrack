"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavTabs from "@/components/mesero/NavTabs";
import Header from "@/components/admin/Header";
import IconBox from "@/components/ui/iconBox";
import { WalletMoneyOutline } from "solar-icon-set";
import ProfileCard from "@/components/admin/settings/ProfileCard";
import RestaurantInfoCard from "@/components/admin/settings/RestaurantInfoCard";
import UserAccountCard from "@/components/admin/settings/UserAccountCard";
import ContactInfoCard from "@/components/admin/settings/ContactInfoCard";
import PasswordSecurityCard from "@/components/admin/settings/PasswordSecurityCard";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";

export default function SettingsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para edición de contacto
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    nombreContacto: "",
    correoContacto: "",
    telefonoContacto: "",
  });

  // Estados para cambio de contraseña
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Estados para modales
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = localStorage.getItem("user");
      const restaurant = localStorage.getItem("restaurant");

      if (!user) {
        router.push("/login");
        return;
      }

      const userInfo = JSON.parse(user);
      const restaurantInfo = restaurant ? JSON.parse(restaurant) : null;

      if (!userInfo._id && !userInfo.id) {
        setErrorMessage("Sesión inválida. Por favor inicia sesión nuevamente.");
        setShowErrorModal(true);
        setTimeout(() => {
          localStorage.clear();
          router.push("/login");
        }, 2000);
        return;
      }

      // Obtener datos actualizados del backend
      const userId = userInfo._id || userInfo.id;
      const response = await fetch(`/api/user/${userId}`);
      const data = await response.json();

      if (data.success) {
        // Asegurar que el _id esté presente
        const updatedUserData = { ...data.data, _id: userId };
        setUserData(updatedUserData);
        setContactForm({
          nombreContacto: data.data.nombreContacto || "",
          correoContacto: data.data.correoContacto || "",
          telefonoContacto: data.data.telefonoContacto || "",
        });
      } else {
        // Asegurar que el _id esté presente
        const fallbackUserData = { ...userInfo, _id: userId };
        setUserData(fallbackUserData);
        setContactForm({
          nombreContacto: userInfo.nombreContacto || "",
          correoContacto: userInfo.correoContacto || "",
          telefonoContacto: userInfo.telefonoContacto || "",
        });
      }

      setRestaurantData(restaurantInfo);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setLoading(false);
    }
  };

  const handleUpdateContact = async () => {
    try {
      if (!contactForm.nombreContacto || !contactForm.correoContacto || !contactForm.telefonoContacto) {
        setErrorMessage("Todos los campos son requeridos");
        setShowErrorModal(true);
        return;
      }

      const userId = userData._id || userData.id;

      const response = await fetch(`/api/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data.data);
        setIsEditingContact(false);
        setSuccessMessage("Información actualizada correctamente");
        setShowSuccessModal(true);

        // Actualizar localStorage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...storedUser, ...data.data }));
      } else {
        setErrorMessage(data.message || "Error al actualizar información");
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage("Error de conexión. Por favor intenta nuevamente.");
      setShowErrorModal(true);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setErrorMessage("Todos los campos son requeridos");
        setShowErrorModal(true);
        return;
      }

      if (passwordForm.newPassword.length < 8) {
        setErrorMessage("La nueva contraseña debe tener al menos 8 caracteres");
        setShowErrorModal(true);
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setErrorMessage("Las contraseñas no coinciden");
        setShowErrorModal(true);
        return;
      }

      const userId = userData._id || userData.id;
      
      const response = await fetch(`/api/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsChangingPassword(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setSuccessMessage("Contraseña actualizada correctamente");
        setShowSuccessModal(true);
      } else {
        setErrorMessage(data.message || "Error al cambiar contraseña");
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage("Error de conexión. Por favor intenta nuevamente.");
      setShowErrorModal(true);
    }
  };

  if (loading) {
    return (
      <>
        <Header showSearch={false} />
        <NavTabs />
        <div className="m-10 flex justify-center items-center min-h-[400px]">
          <p className="text-gray-500">Cargando...</p>
        </div>
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

      <Header showSearch={false} />
      <NavTabs />
      <main className="m-10 gap-8 flex flex-col">
        <section className="flex flex-row gap-4">
          <IconBox
            icon={<WalletMoneyOutline className="w-10 h-10" />}
            bgClass="bg-Blue-700"
            textClass="text-white"
          />
          <div className="flex flex-col">
            <p className="text-gray-900 font-sans text-2xl not-italic font-normal leading-9">
              Configuración de Cuenta
            </p>
            <p className="text-gray-500 font-sans text-base not-italic font-normal leading-6">
              Gestiona tu información personal y seguridad
            </p>
          </div>
        </section>

        <section className="flex flex-col md:grid md:grid-cols-3 gap-8">
          <div className="col-span-1 gap-8 flex flex-col">
            <ProfileCard user={userData} />
            <RestaurantInfoCard restaurant={restaurantData} />
            <UserAccountCard user={userData} />
          </div>
          <div className="col-span-2 gap-8 flex flex-col">
            <ContactInfoCard
              initialFullName={userData?.nombreContacto || ""}
              initialEmail={userData?.correoContacto || ""}
              initialPhone={userData?.telefonoContacto || ""}
              isEditing={isEditingContact}
              onEdit={() => setIsEditingContact(true)}
              onSave={handleUpdateContact}
              onCancel={() => {
                setIsEditingContact(false);
                setContactForm({
                  nombreContacto: userData.nombreContacto || "",
                  correoContacto: userData.correoContacto || "",
                  telefonoContacto: userData.telefonoContacto || "",
                });
              }}
              fullName={contactForm.nombreContacto}
              email={contactForm.correoContacto}
              phone={contactForm.telefonoContacto}
              onFullNameChange={(value) => setContactForm({ ...contactForm, nombreContacto: value })}
              onEmailChange={(value) => setContactForm({ ...contactForm, correoContacto: value })}
              onPhoneChange={(value) => setContactForm({ ...contactForm, telefonoContacto: value })}
            />
            <PasswordSecurityCard
              lastPasswordChangeDays={30}
              isChanging={isChangingPassword}
              onModify={() => setIsChangingPassword(true)}
              onUpdatePassword={handleChangePassword}
              onCancel={() => {
                setIsChangingPassword(false);
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
              }}
              currentPassword={passwordForm.currentPassword}
              newPassword={passwordForm.newPassword}
              confirmPassword={passwordForm.confirmPassword}
              onCurrentPasswordChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })}
              onNewPasswordChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })}
              onConfirmPasswordChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })}
            />
          </div>
        </section>
      </main>
    </>
  );
}
