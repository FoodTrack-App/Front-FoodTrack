"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/buttons/button";
import InputComponent from "@/components/InputComponent/InputComponent";
import LoginLoadingModal from "@/components/LoginLoadingModal";
import ErrorModal from "@/components/ErrorModal";
import { LockKeyholeBold, UserBold, KeyBold } from "solar-icon-set";

export default function LoginPage() {
  const router = useRouter();
  const userRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const [restaurantKey, setRestaurantKey] = useState<string>("");
  const [showLoading, setShowLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);
  const [targetRoute, setTargetRoute] = useState<string>("/");

  useEffect(() => {
    // Obtener la clave del restaurante del localStorage
    const restaurantData = localStorage.getItem("restaurant");
    if (restaurantData) {
      try {
        const restaurant = JSON.parse(restaurantData);
        setRestaurantKey(restaurant.claveRestaurante || "");
      } catch (error) {
        console.error("Error al leer datos del restaurante:", error);
      }
    } else {
      // Si no hay clave, redirigir a la página de activación
      router.push("/activate");
    }
  }, [router]);

  const handleLogin = async () => {
    const username = userRef.current?.value;
    const password = passRef.current?.value;

    // Validar que se ingresen usuario y contraseña
    if (!username || !password) {
      setErrorMessage("Por favor ingresa usuario y contraseña");
      setShowErrorModal(true);
      return;
    }

    if (!restaurantKey) {
      setErrorMessage("No se encontró la clave del restaurante. Por favor regresa a la pantalla de activación.");
      setShowErrorModal(true);
      setTimeout(() => {
        router.push("/activate");
      }, 2000);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          password,
          claveRestaurante: restaurantKey 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Guardar información del usuario en localStorage
        localStorage.setItem("user", JSON.stringify(data.data));
        
        // Guardar claveRestaurante por separado para fácil acceso
        localStorage.setItem("claveRestaurante", data.data.claveRestaurante);
        
        // Determinar la ruta según el rol
        const rol = data.data.rol;
        let route = "/";
        
        if (rol === "Administrador") {
          route = "/admin";
        } else if (rol === "Mesero") {
          route = "/mesero";
        } else if (rol === "Cajero") {
          route = "/cajero";
        }
        
        // Mostrar modal de carga
        setUserData(data.data);
        setTargetRoute(route);
        setShowLoading(true);
      } else {
        setErrorMessage(data.message ?? "Credenciales incorrectas");
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("No se pudo conectar con el servidor de autenticación.");
      setShowErrorModal(true);
    }
  };

  const handleLoadingComplete = () => {
    router.push(targetRoute);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

  return (
    <>
      {showLoading && userData && (
        <LoginLoadingModal
          userName={userData.nombreContacto || userData.usuario}
          userRole={userData.rol}
          onComplete={handleLoadingComplete}
        />
      )}

      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={handleCloseErrorModal}
        />
      )}
      
      <div className="min-h-screen w-full flex items-center justify-center bg-Blue-50 px-4 py-8">
        <div className="w-full max-w-md md:max-w-lg lg:max-w-2xl bg-gray-50 rounded-2xl shadow-lg p-8 md:p-12 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <img className="w-36 md:w-44" src="/FoodTrack.svg" alt="FoodTrack logo" />
          <h1 className="text-gray-800 text-xl md:text-2xl font-actor font-medium">Bienvenido</h1>
          <p className="text-gray-600 text-center text-sm md:text-base">Ingresa tus credenciales para acceder a tu cuenta</p>
        </div>

        <div className="w-full grid gap-6">
          <InputComponent 
            ref={undefined} 
            placeholder="Clave del restaurante" 
            icon={<KeyBold/>}
            value={restaurantKey}
            disabled={true}
            className="bg-gray-100 cursor-not-allowed"
          />

          <InputComponent ref={userRef} placeholder="Usuario" icon={<UserBold/>} />

          <InputComponent ref={passRef} type="password" placeholder="Contraseña" icon={<LockKeyholeBold/>} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Button onClick={handleLogin} className="w-full">Iniciar Sesión</Button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
