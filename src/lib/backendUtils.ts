// Obtener la URL base del backend desde variables de entorno
export const getBackendURL = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
};

// Construir URL completa para una imagen de producto
export const getProductImageFullUrl = (imagePath: string) => {
  if (!imagePath || imagePath === 'default') {
    return null;
  }
  // Si la imagen está en el frontend (Next.js public), devolver tal cual
  if (imagePath.startsWith('/products/')) {
    return imagePath;
  }
  const backendURL = getBackendURL();
  return `${backendURL}${imagePath}`;
};
