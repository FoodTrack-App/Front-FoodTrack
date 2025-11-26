"use client";
import {
    useEffect,
    useRef,
    useState,
    useCallback,
    type ReactNode,
    type ChangeEvent,
    type KeyboardEvent,
} from "react";
import {
    BoxOutline,
    DollarMinimalisticOutline,
    DollarOutline,
    FileTextOutline,
    GalleryOutline,
    TagOutline,
    TrashBinTrashOutline,
} from "solar-icon-set";
import { DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "../ui/drawer";
import { useAutoResizeTextArea } from "@/hooks/useAutoResizeTextArea";
import { OTHER_CATEGORY, validateProduct, type ProductValidationErrors } from "@/lib/validation/product";
import { getProductImageUrl } from "@/lib/imageUtils";
import FileDropzone from "./FileDropzone";
import SuccessModal from "../SuccessModal";
import ErrorModal from "../ErrorModal";
import ConfirmModal from "../ConfirmModal";

type Product = {
  _id: string;
  nombreProducto: string;
  imagenProducto: string;
  descripcion: string;
  stockDisponible: number;
  costo: number;
  precioVenta: number;
  margenGanancia: number;
  categoria: string;
  claveRestaurante: string;
  fechaRegistro: string;
  extras?: Array<{
    _id?: string;
    nombreExtra: string;
    costoExtra: number;
    activo: boolean;
  }>;
};

type SubTitleProps = {
    title: string;
    icon: ReactNode;
};

function SubTitle({ icon, title }: SubTitleProps) {
    return (
        <div className="flex flex-row items-center text-navy-900 gap-2">
            <div className="flex items-center justify-center w-5 h-5">{icon}</div>
            <p className="text-[#0D1748] font-arial text-[14px] font-normal leading-[14px]">
                {title}
            </p>
        </div>
    );
}

type Props = {
    product?: Product | null;
    onProductUpdated?: () => void;
    onProductDeleted?: () => void;
    onModalStateChange?: (isOpen: boolean) => void;
};

export default function ProductDetailsDrawerContent({ product, onProductUpdated, onProductDeleted, onModalStateChange }: Props) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    // Estado de formulario controlado
    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [stock, setStock] = useState<string>("");
    
    type CategoryWithId = {
        _id: string;
        nombreCategoria: string;
    };
    const [categories, setCategories] = useState<CategoryWithId[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [newCategoryInput, setNewCategoryInput] = useState("");
    const [cost, setCost] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // Extras existentes (los que ya están en la BD)
    type ExistingExtra = {
        _id: string;
        nombreExtra: string;
        costoExtra: number;
        activo: boolean;
    };
    const [existingExtras, setExistingExtras] = useState<ExistingExtra[]>([]);
    const [loadingExtras, setLoadingExtras] = useState(false);

    // Modales
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showConfirmDeleteCategory, setShowConfirmDeleteCategory] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Errores de validación
    const [errors, setErrors] = useState<ProductValidationErrors>({});

    const imageUrl = getProductImageUrl(product?.imagenProducto, product?.categoria);

    // Limpiar errores automáticamente cuando el usuario corrige los campos
    useEffect(() => {
        if (productName && errors.productName) {
            setErrors(prev => ({ ...prev, productName: undefined }));
        }
    }, [productName, errors.productName]);

    useEffect(() => {
        if (description && errors.description) {
            setErrors(prev => ({ ...prev, description: undefined }));
        }
    }, [description, errors.description]);

    useEffect(() => {
        if (stock && errors.stock) {
            setErrors(prev => ({ ...prev, stock: undefined }));
        }
    }, [stock, errors.stock]);

    useEffect(() => {
        if (cost && errors.cost) {
            setErrors(prev => ({ ...prev, cost: undefined }));
        }
    }, [cost, errors.cost]);

    useEffect(() => {
        if (price && errors.price) {
            setErrors(prev => ({ ...prev, price: undefined }));
        }
    }, [price, errors.price]);

    useEffect(() => {
        if ((selectedCategory || newCategoryInput) && errors.category) {
            setErrors(prev => ({ ...prev, category: undefined }));
        }
    }, [selectedCategory, newCategoryInput, errors.category]);

    useEffect(() => {
        if (imageFile && errors.imageFile) {
            setErrors(prev => ({ ...prev, imageFile: undefined }));
        }
    }, [imageFile, errors.imageFile]);

    // Cargar categorías
    const loadCategories = useCallback(async () => {
        try {
            const claveRestaurante = localStorage.getItem("claveRestaurante");
            if (!claveRestaurante) return;

            const response = await fetch(`/api/categories/restaurant/${claveRestaurante}`);
            const data = await response.json();

            if (data.success && data.data) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error("Error al cargar categorías:", error);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    // Función para limpiar errores
    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    // Cargar extras existentes del producto
    const loadExtras = useCallback((productExtras: any[]) => {
        try {
            setLoadingExtras(true);
            console.log("Cargando extras del producto:", productExtras);
            
            if (productExtras && Array.isArray(productExtras)) {
                setExistingExtras(productExtras);
                console.log("Extras cargados:", productExtras.length);
            } else {
                setExistingExtras([]);
            }
        } catch (error) {
            console.error("Error al cargar extras:", error);
            setExistingExtras([]);
        } finally {
            setLoadingExtras(false);
        }
    }, []);

    // Actualizar estado de un extra
    const toggleExtraStatus = useCallback(async (extraId: string, currentStatus: boolean) => {
        if (!product?._id) return;

        const newStatus = !currentStatus;
        console.log("=== TOGGLE EXTRA ===");
        console.log("Extra ID:", extraId);
        console.log("Estado actual:", currentStatus, "→ Nuevo:", newStatus);

        // Actualización optimista (UI inmediata)
        setExistingExtras(prev => prev.map(extra =>
            extra._id === extraId ? { ...extra, activo: newStatus } : extra
        ));

        try {
            const response = await fetch(`/api/products/${product._id}/extras/${extraId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ activo: newStatus }),
            });

            const data = await response.json();
            
            if (data.success) {
                console.log("✓ Toggle exitoso en BD");
            } else {
                console.error("✗ Error del servidor:", data.message);
                // Revertir cambio optimista si falla
                setExistingExtras(prev => prev.map(extra =>
                    extra._id === extraId ? { ...extra, activo: currentStatus } : extra
                ));
            }
        } catch (error) {
            console.error("✗ Error en petición:", error);
            // Revertir cambio optimista si falla
            setExistingExtras(prev => prev.map(extra =>
                extra._id === extraId ? { ...extra, activo: currentStatus } : extra
            ));
        }
    }, [product]);

    // Ref para rastrear el ID del producto actual
    const currentProductIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!product) {
            // Limpiar el formulario cuando no hay producto
            setProductName("");
            setDescription("");
            setStock("");
            setSelectedCategory("");
            setCost("");
            setPrice("");
            setImageFile(null);
            setExistingExtras([]);
            clearErrors();
            currentProductIdRef.current = null;
            return;
        }
        
        // Solo limpiar extras si es un producto DIFERENTE
        const isNewProduct = currentProductIdRef.current !== product._id;
        if (isNewProduct) {
            currentProductIdRef.current = product._id;
        }
        
        // Cargar datos del producto seleccionado
        console.log("Cargando producto en drawer:", product);
        setProductName(product.nombreProducto || "");
        setDescription(product.descripcion || "");
        setStock(String(product.stockDisponible ?? 0));
        setSelectedCategory(product.categoria || "");
        setCost(
            typeof product.costo === "number" && !Number.isNaN(product.costo)
                ? product.costo.toFixed(2)
                : ""
        );
        setPrice(
            typeof product.precioVenta === "number" && !Number.isNaN(product.precioVenta)
                ? product.precioVenta.toFixed(2)
                : ""
        );
        setImageFile(null);

        // Cargar extras del producto (están embebidos en el producto)
        loadExtras(product.extras || []);
    }, [product, loadExtras, clearErrors]);

    // Auto-resize del textarea con hook robusto
    useAutoResizeTextArea(textareaRef, description);

    // Handlers reutilizables con tipos
    const handleIntegerKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            const blocked = new Set([".", ",", "e", "E", "-"]);
            if (blocked.has(event.key)) event.preventDefault();
        },
        []
    );

    const handleMonetaryKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            // Permitimos decimales (',' o '.') pero bloqueamos '-' y notación científica
            const blocked = new Set(["e", "E", "-"]);
            if (blocked.has(event.key)) event.preventDefault();
        },
        []
    );

    const handleCategoryChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value;
            setSelectedCategory(value);
            if (value !== OTHER_CATEGORY) setNewCategoryInput("");
        },
        []
    );

    const handleAddCategory = useCallback(() => {
        const trimmed = newCategoryInput.trim();
        if (trimmed && !categories.find(cat => cat.nombreCategoria === trimmed)) {
            // La creación se maneja en handleEdit
            setSelectedCategory(trimmed);
            setNewCategoryInput("");
        }
    }, [newCategoryInput, categories]);

    const handleDeleteCategory = useCallback(() => {
        if (!categoryToDelete) return;

        onModalStateChange?.(true);

        fetch(`/api/categories/${categoryToDelete.id}`, {
            method: "DELETE",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setCategories((prev) => prev.filter((cat) => cat._id !== categoryToDelete.id));
                    if (selectedCategory === categoryToDelete.name) {
                        setSelectedCategory("");
                    }
                    setShowConfirmDeleteCategory(false);
                    setCategoryToDelete(null);
                    setSuccessMessage("Categoría eliminada exitosamente");
                    setShowSuccessModal(true);
                } else {
                    setErrorMessage(data.message || "Error al eliminar la categoría");
                    setShowErrorModal(true);
                }
            })
            .catch((error) => {
                console.error("Error al eliminar categoría:", error);
                setErrorMessage("Error al eliminar la categoría");
                setShowErrorModal(true);
            })
            .finally(() => {
                onModalStateChange?.(false);
            });
    }, [categoryToDelete, selectedCategory, onModalStateChange]);

    const onDeleteCategoryClick = useCallback(() => {
        const category = categories.find((cat) => cat.nombreCategoria === selectedCategory);
        if (category) {
            setCategoryToDelete({ id: category._id, name: category.nombreCategoria });
            setShowConfirmDeleteCategory(true);
        }
    }, [categories, selectedCategory]);

    const margin = (() => {
        const c = parseFloat(cost.replace(",", ".")) || 0;
        const p = parseFloat(price.replace(",", ".")) || 0;
        if (p <= 0) return 0;
        const m = ((p - c) / p) * 100;
        return Number.isFinite(m) ? m : 0;
    })();

    const handleEdit = useCallback(async () => {
        const { errors: nextErrors, values } = validateProduct({
            productName,
            description,
            stock,
            selectedCategory,
            newCategoryInput,
            cost,
            price,
            imageFile,
        }, { requireImage: false }); // La imagen es opcional al editar

        setErrors(nextErrors);
        if (!values) {
            console.warn("[Producto - Editar] Validación fallida:", nextErrors);
            return;
        }

        if (!product?._id) {
            setErrorMessage("No se encontró el ID del producto");
            setShowErrorModal(true);
            return;
        }

        try {
            setLoading(true);

            // Si hay una nueva categoría, crearla primero
            let finalCategory = values.category;
            if (newCategoryInput.trim()) {
                const claveRestaurante = localStorage.getItem("claveRestaurante");
                const categoryResponse = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nombreCategoria: newCategoryInput.trim(),
                        claveRestaurante,
                    }),
                });

                const categoryData = await categoryResponse.json();
                if (categoryData.success) {
                    finalCategory = newCategoryInput.trim();
                    await loadCategories();
                }
            }

            // Crear FormData para actualizar el producto
            const formData = new FormData();
            formData.append("nombreProducto", productName); // Usar el estado directamente
            formData.append("descripcion", description);
            formData.append("stockDisponible", stock);
            formData.append("costo", cost);
            formData.append("precioVenta", price);
            formData.append("categoria", finalCategory);
            if (imageFile) {
                formData.append("imagen", imageFile);
            }

            console.log("Actualizando producto con:", {
                nombreProducto: productName,
                descripcion: description,
                stockDisponible: stock,
                costo: cost,
                precioVenta: price,
                categoria: finalCategory,
                tieneImagen: !!imageFile
            });

            // Verificar contenido del FormData
            console.log("→ Contenido FormData:");
            for (let pair of formData.entries()) {
                console.log(`  ${pair[0]}:`, pair[1]);
            }

            const response = await fetch(`/api/products/${product._id}`, {
                method: "PUT",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                console.log("✓ Producto actualizado exitosamente");
                console.log("Producto actualizado con extras:", data.data);
                
                const extrasActualizados = Array.isArray(data.data?.extras) ? data.data.extras.length : 0;
                console.log(`✓ Total extras en producto: ${extrasActualizados}`);

                // Actualizar estado local con los extras del backend
                if (Array.isArray(data.data?.extras)) {
                    setExistingExtras(data.data.extras);
                }

                // Cerrar drawer primero
                closeRef.current?.click();
                
                // Mostrar modal después de cerrar drawer
                setTimeout(() => {
                    setSuccessMessage("Producto actualizado exitosamente");
                    setShowSuccessModal(true);
                }, 100);
                
                onProductUpdated?.();
            } else {
                console.error("✗ Error al actualizar:", data.message);
                setErrorMessage(data.message || "Error al actualizar el producto");
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error("Error al actualizar producto:", error);
            setErrorMessage("Error al conectar con el servidor");
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    }, [product?._id, productName, description, stock, selectedCategory, newCategoryInput, cost, price, imageFile, onProductUpdated, loadCategories]);

    const handleConfirmModalClose = useCallback(() => {
        setShowConfirmDelete(false);
        onModalStateChange?.(false);
    }, [onModalStateChange]);

    const handleDelete = useCallback(() => {
        setShowConfirmDelete(true);
        onModalStateChange?.(true);
    }, [onModalStateChange]);

    const confirmDelete = useCallback(async () => {
        if (!product?._id) {
            setErrorMessage("No se encontró el ID del producto");
            setShowErrorModal(true);
            return;
        }

        // Cerrar modal de confirmación primero
        handleConfirmModalClose();

        try {
            setLoading(true);

            const response = await fetch(`/api/products/${product._id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (data.success) {
                // Cerrar drawer primero
                closeRef.current?.click();
                
                // Mostrar modal después de cerrar drawer
                setTimeout(() => {
                    setSuccessMessage("Producto eliminado exitosamente");
                    setShowSuccessModal(true);
                }, 100);
                
                onProductDeleted?.();
            } else {
                setErrorMessage(data.message || "Error al eliminar el producto");
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            setErrorMessage("Error al conectar con el servidor");
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    }, [product?._id, onProductDeleted, handleConfirmModalClose]);

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
    };

    return (
        <>
            {showSuccessModal && (
                <SuccessModal
                    message={successMessage}
                    onClose={handleSuccessModalClose}
                />
            )}

            {showErrorModal && (
                <ErrorModal
                    message={errorMessage}
                    onClose={() => setShowErrorModal(false)}
                />
            )}

            {showConfirmDelete && (
                <ConfirmModal
                    isOpen={showConfirmDelete}
                    onClose={handleConfirmModalClose}
                    onConfirm={confirmDelete}
                    title="Eliminar Producto"
                    message="¿Estás seguro de que deseas eliminar este producto?"
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                />
            )}

            <DrawerContent className={`bg-gray-50 flex flex-col ${showConfirmDelete ? 'pointer-events-none' : ''}`}>
            <DrawerHeader className="px-8 py-6 bg-navy-900 md:sticky md:top-0 md:z-10">
                <DrawerTitle className="text-white font-arial text-[24px] font-bold leading-[32px]">
                    Detalles del Producto
                </DrawerTitle>
            </DrawerHeader>
            <div className="px-5 py-2 gap-5 flex flex-col flex-1 overflow-y-auto">
                <img
                    src={imageUrl}
                    alt={productName || "Imagen del producto"}
                    className="w-full h-70 rounded-2xl object-cover"
                />
                <div className="flex justify-center items-center px-3 py-1 rounded-2xl bg-Blue-50 w-fit">
                    <p className="text-navy-900 font-arial text-[16px] font-normal leading-[24px]">
                        {selectedCategory || "—"}
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <SubTitle icon={<GalleryOutline />} title="Cambiar Imagen (Opcional)" />
                    <FileDropzone
                        accept="image/png,image/jpeg,image/gif"
                        maxSizeMB={5}
                        onFileSelect={(file) => {
                            setImageFile((Array.isArray(file) ? file[0] : file) ?? null);
                        }}
                        className="bg-gray-100"
                    />
                    {imageFile && (
                        <p className="text-sm text-gray-600">Nueva imagen seleccionada: {imageFile.name}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <SubTitle icon={<TagOutline />} title="Nombre del Producto" />
                    <input
                        type="text"
                        autoCapitalize="off"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Ej. Tacos al Pastor"
                        aria-invalid={!!errors.productName}
                        className={`bg-gray-100 rounded-2xl px-4 py-3 text-gray-900 placeholder:text-gray-500 border ${errors.productName ? "border-negativo" : "border-gray-300"}`}
                    />
                    {errors.productName && (
                        <p className="text-negativo text-sm">{errors.productName}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <SubTitle icon={<FileTextOutline />} title="Descripción" />
                    <textarea
                        ref={textareaRef}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe el producto..."
                        className="bg-gray-100 border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder:text-gray-500 resize-none  min-h-[48px] leading-6 h-full"
                        rows={5}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <SubTitle icon={<BoxOutline />} title="Stock Disponible" />
                    <input
                        type="number"
                        autoCapitalize="off"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="Ej. 10"
                        aria-invalid={!!errors.stock}
                        className={`bg-gray-100 rounded-2xl px-4 py-3 text-gray-900 placeholder:text-gray-500 border ${errors.stock ? "border-negativo" : "border-gray-300"}`}
                        step={1}
                        onKeyDown={handleIntegerKeyDown}
                    />
                    {errors.stock && (
                        <p className="text-negativo text-sm">{errors.stock}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <SubTitle icon={<TagOutline />} title="Categoría" />
                    <div className="flex gap-2 items-center">
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            aria-invalid={!!errors.category}
                            className={`flex-grow bg-gray-100 rounded-2xl px-4 py-3 text-gray-900 placeholder:text-gray-500 appearance-none border ${errors.category ? "border-negativo" : "border-gray-300"}`}
                        >
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat.nombreCategoria}>
                                    {cat.nombreCategoria}
                                </option>
                            ))}
                            <option value={OTHER_CATEGORY}>— Otra / Agregar Nueva...</option>
                        </select>
                        {selectedCategory && selectedCategory !== OTHER_CATEGORY && (
                            <button
                                type="button"
                                onClick={onDeleteCategoryClick}
                                className="bg-negativo text-white rounded-2xl p-3 hover:bg-red-700 transition-colors flex items-center justify-center"
                                title="Eliminar categoría"
                            >
                                <TrashBinTrashOutline size={20} />
                            </button>
                        )}
                    </div>
                    {selectedCategory === OTHER_CATEGORY && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newCategoryInput}
                                onChange={(e) => setNewCategoryInput(e.target.value)}
                                placeholder="Escribe la nueva categoría"
                                aria-invalid={!!errors.category}
                                className={`flex-grow bg-gray-100 rounded-2xl px-4 py-3 text-gray-900 placeholder:text-gray-500 border ${errors.category ? "border-negativo" : "border-gray-300"}`}
                            />
                            <button
                                onClick={handleAddCategory}
                                className="bg-navy-900 text-white rounded-2xl px-4 py-3 w-28 text-center disabled:opacity-50"
                                disabled={newCategoryInput.trim() === ""}
                            >
                                Agregar
                            </button>
                        </div>
                    )}
                    {errors.category && (
                        <p className="text-negativo text-sm">{errors.category}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="gap-2 flex flex-col col-span-1">
                        <SubTitle icon={<DollarOutline />} title="Costo" />
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900">
                                $
                            </span>
                            <input
                                type="number"
                                autoCapitalize="off"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                placeholder="Ej. 10.00"
                                aria-invalid={!!errors.cost}
                                className={`bg-gray-100 rounded-2xl px-4 py-3 pl-8 pr-16 text-gray-900 placeholder:text-gray-500 w-full border ${errors.cost ? "border-negativo" : "border-gray-300"}`}
                                step="0.01"
                                min="0"
                                onKeyDown={handleMonetaryKeyDown}
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                MXN
                            </span>
                        </div>
                        {errors.cost && (
                            <p className="text-negativo text-sm">{errors.cost}</p>
                        )}
                    </div>
                    <div className=" gap-2 flex flex-col col-span-1">
                        <SubTitle
                            icon={<DollarMinimalisticOutline />}
                            title="Precio de Venta"
                        />
                        <div className="relative text-Blue-700">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-Blue-700">
                                $
                            </span>
                            <input
                                type="number"
                                autoCapitalize="off"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Ej. 15.00"
                                aria-invalid={!!errors.price}
                                className={`bg-Blue-200/20 rounded-2xl px-4 py-3 pl-8 pr-16 text-Blue-700 placeholder:text-gray-500 w-full border ${errors.price ? "border-negativo" : "border-Blue-200"}`}
                                step="0.01"
                                min="0"
                                onKeyDown={handleMonetaryKeyDown}
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-Blue-700 text-sm">
                                MXN
                            </span>
                        </div>
                        {errors.price && (
                            <p className="text-negativo text-sm">{errors.price}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 items-start self-stretch px-[16px] py-[12px] rounded-2xl border border-Blue-200 bg-Blue-200/20">
                    <p className="text-navy-900 font-arial text-[16px] font-normal leading-[24px] col-span-2">
                        Margen de Ganancia
                    </p>
                    <p className="text-Blue-700 font-arial text-[16px] font-normal leading-[24px] col-span-1">
                        {margin.toFixed(1)}%
                    </p>
                </div>

                {/* Sección de Extras Existentes */}
                <div className="flex flex-col gap-3">
                    <SubTitle icon={<DollarOutline />} title="Extras del Producto" />
                    
                    {loadingExtras ? (
                        <div className="text-center py-4 text-gray-500">
                            Cargando extras...
                        </div>
                    ) : existingExtras.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 bg-gray-100 rounded-xl">
                            No hay extras para este producto
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {existingExtras.map((extra) => (
                                <div
                                    key={extra._id}
                                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                                        extra.activo
                                            ? "bg-white border-Blue-200"
                                            : "bg-gray-50 border-gray-300 opacity-60"
                                    }`}
                                >
                                    <div className="flex-1">
                                        <p className={`font-semibold ${extra.activo ? "text-navy-900" : "text-gray-500"}`}>
                                            {extra.nombreExtra}
                                        </p>
                                        <p className={`text-sm ${extra.activo ? "text-Blue-700" : "text-gray-400"}`}>
                                            + ${extra.costoExtra.toFixed(2)} MXN
                                        </p>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <span className={`text-sm font-medium ${extra.activo ? "text-navy-900" : "text-gray-500"}`}>
                                            {extra.activo ? "Activo" : "Inactivo"}
                                        </span>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={extra.activo}
                                                onChange={() => toggleExtraStatus(extra._id, extra.activo)}
                                                className="sr-only peer"
                                            />
                                            <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-Blue-200 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                                                extra.activo 
                                                    ? "bg-Blue-700 after:translate-x-full after:border-white" 
                                                    : "bg-gray-300"
                                            }`}></div>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <DrawerFooter className="px-8 gap-4 py-4 flex flex-row justify-between items-center border-t-gray-500 border-t-2 w-full bg-gray-100">
                <button 
                    onClick={handleDelete} 
                    disabled={loading}
                    className="w-fit text-negativo flex gap-2 items-center border-negativo/50 border-2 rounded-2xl py-4 px-3 disabled:opacity-50"
                >
                    <TrashBinTrashOutline />{loading ? "Eliminando..." : "Eliminar"}
                </button>
                <button 
                    onClick={handleEdit} 
                    disabled={loading}
                    className="w-full bg-Blue-700 rounded-2xl py-4 px-3 text-white disabled:opacity-50"
                >
                    {loading ? "Guardando..." : "Editar Producto"}
                </button>
                <DrawerClose asChild>
                    <button ref={closeRef} className="hidden" aria-hidden onClick={clearErrors} />
                </DrawerClose>
            </DrawerFooter>
        </DrawerContent>

        {/* Modal de confirmación para eliminar categoría */}
        <ConfirmModal
            isOpen={showConfirmDeleteCategory}
            onClose={() => {
                setShowConfirmDeleteCategory(false);
                setCategoryToDelete(null);
            }}
            onConfirm={handleDeleteCategory}
            title="Eliminar Categoría"
            message={`¿Estás seguro de que deseas eliminar la categoría "${categoryToDelete?.name}"? Esta acción no se puede deshacer.`}
            confirmText="Eliminar"
            cancelText="Cancelar"
        />
        </>
    );
}
