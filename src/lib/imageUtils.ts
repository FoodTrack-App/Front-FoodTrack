/**
 * Obtiene una imagen por defecto basada en la categoría del producto
 * @param categoria - La categoría del producto
 * @returns URL de la imagen por defecto
 */
export function getDefaultProductImage(categoria?: string): string {
  const categoryLower = categoria?.toLowerCase() || "";
  
  // Imágenes por defecto según categoría
  if (categoryLower.includes("bebida") || categoryLower.includes("drink")) {
    return "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=600&fit=crop";
  }
  
  if (categoryLower.includes("postre") || categoryLower.includes("dessert")) {
    return "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop";
  }
  
  if (categoryLower.includes("taco")) {
    return "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop";
  }
  
  if (categoryLower.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop";
  }
  
  if (categoryLower.includes("hamburguesa") || categoryLower.includes("burger")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop";
  }
  
  if (categoryLower.includes("ensalada") || categoryLower.includes("salad")) {
    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop";
  }
  
  if (categoryLower.includes("pasta") || categoryLower.includes("spaghetti")) {
    return "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop";
  }
  
  if (categoryLower.includes("sushi")) {
    return "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop";
  }
  
  if (categoryLower.includes("café") || categoryLower.includes("coffee")) {
    return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop";
  }
  
  // Imagen por defecto general para comida
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop";
}

/**
 * Construye la URL completa de la imagen del producto
 * @param imagenProducto - Ruta de la imagen desde la base de datos
 * @param categoria - Categoría del producto (para imagen por defecto)
 * @returns URL completa de la imagen
 */
import { getBackendURL } from "./backendUtils";

export function getProductImageUrl(imagenProducto?: string, categoria?: string): string {
  // Si no hay imagen, está vacía, o es "default", usar imagen por defecto según categoría
  if (!imagenProducto || imagenProducto.trim() === "" || imagenProducto === "default") {
    return getDefaultProductImage(categoria);
  }
  
  if (imagenProducto.startsWith('http')) {
    return imagenProducto;
  }
  // Si la imagen está en el frontend (public/products), devolver la ruta tal cual
  if (imagenProducto.startsWith('/products/')) {
    return imagenProducto;
  }
  // En otro caso, servida por backend (/uploads/...)
  const backend = getBackendURL();
  return `${backend}${imagenProducto}`;
}
