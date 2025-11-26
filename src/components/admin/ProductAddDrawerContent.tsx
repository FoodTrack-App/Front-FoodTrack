"use client";
import {
    useRef,
    useState,
    useEffect,
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
import {
    OTHER_CATEGORY,
    validateProduct,
    type ProductValidationErrors,
} from "@/lib/validation/product";
import FileDropzone from "./FileDropzone";
import SuccessModal from "../SuccessModal";
import ErrorModal from "../ErrorModal";
import ConfirmModal from "../ConfirmModal";

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

type ProductAddDrawerContentProps = {
    onProductAdded?: () => void;
};

export default function ProductAddDrawerContent({ onProductAdded }: ProductAddDrawerContentProps) {
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

    // Extras (sin id temporal)
    type Extra = {
        nombreExtra: string;
        costoExtra: string;
    };
    const [extras, setExtras] = useState<Extra[]>([]);

    // Modales
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showConfirmDeleteCategory, setShowConfirmDeleteCategory] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);

    // Errores de validación
    const [errors, setErrors] = useState<ProductValidationErrors>({});

    // Auto-resize del textarea con hook robusto
    useAutoResizeTextArea(textareaRef, description);

    // Función para limpiar errores y formulario
    const resetForm = useCallback(() => {
        setProductName("");
        setDescription("");
        setStock("");
        setSelectedCategory("");
        setNewCategoryInput("");
        setCost("");
        setPrice("");
        setImageFile(null);
        setExtras([]);
        setErrors({});
    }, []);

    // Funciones para manejar extras (usando índices)
    const addExtra = useCallback(() => {
        const newExtra: Extra = {
            nombreExtra: "",
            costoExtra: "",
        };
        setExtras(prev => [...prev, newExtra]);
    }, []);

    const removeExtra = useCallback((index: number) => {
        setExtras(prev => prev.filter((_, i) => i !== index));
    }, []);

    const updateExtra = useCallback((index: number, field: keyof Extra, value: string) => {
        setExtras(prev => prev.map((extra, i) =>
            i === index ? { ...extra, [field]: value } : extra
        ));
    }, []);

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

    // Cargar categorías al montar
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

    // Cargar categorías al inicio
    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    // Handlers reutilizables con tipos
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

    const handleAddCategory = useCallback(async () => {
        const trimmed = newCategoryInput.trim();
        
        if (!trimmed) {
            setErrorMessage("El nombre de la categoría no puede estar vacío");
            setShowErrorModal(true);
            return;
        }
        
        if (categories.find(cat => cat.nombreCategoria === trimmed)) {
            setErrorMessage("Esta categoría ya existe");
            setShowErrorModal(true);
            return;
        }

        try {
            const claveRestaurante = localStorage.getItem("claveRestaurante");
            
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombreCategoria: trimmed,
                    claveRestaurante,
                }),
            });

            const data = await response.json();

            if (data.success) {
                console.log("✓ Categoría creada:", data.data);
                // Recargar categorías
                await loadCategories();
                // Seleccionar la nueva categoría
                setSelectedCategory(trimmed);
                setNewCategoryInput("");
            } else {
                setErrorMessage(data.message || "Error al crear la categoría");
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error("Error al crear categoría:", error);
            setErrorMessage("Error al conectar con el servidor");
            setShowErrorModal(true);
        }
    }, [newCategoryInput, categories, loadCategories]);

    const handleDeleteCategory = useCallback(async () => {
        if (!categoryToDelete) return;

        try {
            const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (data.success) {
                console.log("✓ Categoría eliminada:", categoryToDelete.name);
                // Actualizar lista de categorías
                setCategories((prev) => prev.filter((cat) => cat._id !== categoryToDelete.id));
                // Si la categoría eliminada estaba seleccionada, limpiar selección
                if (selectedCategory === categoryToDelete.name) {
                    setSelectedCategory("");
                }
                // Cerrar modal de confirmación
                setShowConfirmDeleteCategory(false);
                setCategoryToDelete(null);
                // Mostrar mensaje de éxito
                setSuccessMessage("Categoría eliminada exitosamente");
                setShowSuccessModal(true);
            } else {
                setShowConfirmDeleteCategory(false);
                setCategoryToDelete(null);
                setErrorMessage(data.message || "Error al eliminar la categoría");
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
            setShowConfirmDeleteCategory(false);
            setCategoryToDelete(null);
            setErrorMessage("Error al conectar con el servidor");
            setShowErrorModal(true);
        }
    }, [categoryToDelete, selectedCategory]);

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

    const handleSubmit = useCallback(async () => {
        console.log("🔵 handleSubmit llamado");
        
        const { values, errors: nextErrors } = validateProduct(
            {
                productName,
                description,
                stock,
                selectedCategory,
                newCategoryInput,
                cost,
                price,
                imageFile,
            },
            { requireImage: false } // La imagen es opcional
        );

        console.log("Validación:", { values, errors: nextErrors });
        setErrors(nextErrors);
        
        if (!values) {
            console.log("❌ Validación falló - no se puede continuar");
            return;
        }
        
        console.log("✅ Validación exitosa - continuando...");

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
                    await loadCategories(); // Recargar categorías
                }
            }

            // Validar que los valores numéricos sean válidos
            const stockNum = parseInt(stock);
            const costNum = parseFloat(cost);
            const priceNum = parseFloat(price);

            if (isNaN(stockNum) || isNaN(costNum) || isNaN(priceNum)) {
                setErrorMessage("Los valores de stock, costo y precio deben ser números válidos");
                setShowErrorModal(true);
                return;
            }

            // Preparar extras - sin validación estricta
            const validExtras = extras
                .map(extra => ({
                    nombreExtra: extra.nombreExtra.trim(),
                    costoExtra: parseFloat(extra.costoExtra.replace(",", ".")),
                    activo: true,
                }));

            console.log("✓ Extras a enviar:", extras.length);
            console.log("✓ Extras array:", extras);

            // Crear FormData para el producto CON extras incluidos
            const formData = new FormData();
            formData.append("nombreProducto", productName.trim());
            formData.append("descripcion", description.trim() || "Sin descripción");
            formData.append("stockDisponible", stockNum.toString());
            formData.append("costo", costNum.toString());
            formData.append("precioVenta", priceNum.toString());
            formData.append("categoria", finalCategory);
            formData.append("claveRestaurante", localStorage.getItem("claveRestaurante") || "");
            
            // CRÍTICO: Enviar extras como JSON string en campo de texto
            // Multer procesa bien campos de texto, incluso con archivos
            const extrasJSON = JSON.stringify(extras);
            formData.append("extrasData", extrasJSON); // Nombre diferente para evitar conflictos
            console.log("→ Extras JSON a enviar:", extrasJSON);
            console.log("→ Cantidad de extras:", extras.length);
            
            if (imageFile) {
                formData.append("imagen", imageFile);
            }

            console.log("Enviando producto:", {
                nombreProducto: productName.trim(),
                descripcion: description.trim(),
                stockDisponible: stockNum,
                costo: costNum,
                precioVenta: priceNum,
                categoria: finalCategory,
                claveRestaurante: localStorage.getItem("claveRestaurante"),
                tieneImagen: !!imageFile,
                cantidadExtras: extras.length
            });

            // Verificar contenido del FormData
            console.log("→ Contenido FormData:");
            for (let pair of formData.entries()) {
                console.log(`  ${pair[0]}:`, pair[1]);
            }

            const response = await fetch("/api/products", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            console.log("Respuesta del servidor:", data);

            if (data.success) {
                console.log("✓ Producto creado exitosamente");
                console.log("Producto con extras:", data.data);
                
                const extrasCreados = Array.isArray(data.data?.extras) ? data.data.extras.length : 0;
                console.log(`✓ Extras guardados en BD: ${extrasCreados}`);

                // Limpiar formulario
                resetForm();

                // Cerrar drawer primero
                closeRef.current?.click();
                
                // Mostrar modal de éxito después de un pequeño delay
                setTimeout(() => {
                    setSuccessMessage("Producto agregado exitosamente");
                    setShowSuccessModal(true);
                }, 100);
                
                // Notificar al componente padre
                onProductAdded?.();
            } else {
                console.error("✗ Error del servidor:", data.message);
                setErrorMessage(data.message || "Error al crear el producto");
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error("Error al crear producto:", error);
            setErrorMessage("Error al conectar con el servidor");
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    }, [productName, imageFile, stock, selectedCategory, newCategoryInput, cost, price, description, onProductAdded, loadCategories, resetForm]);

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
    };

    return (
        <>
            {showSuccessModal && (
                <SuccessModal
                    message={successMessage || "Producto agregado exitosamente"}
                    onClose={handleSuccessModalClose}
                />
            )}

            {showErrorModal && (
                <ErrorModal
                    message={errorMessage}
                    onClose={() => setShowErrorModal(false)}
                />
            )}

            <DrawerContent className="bg-gray-50 flex flex-col" aria-describedby="add-product-description">
            <DrawerHeader className="px-8 py-6 bg-navy-900 md:sticky md:top-0 md:z-10">
                <DrawerTitle className="text-white font-arial text-[24px] font-bold leading-[32px]">
                    Agregar Nuevo Producto
                </DrawerTitle>
                <p id="add-product-description" className="sr-only">
                    Formulario para agregar un nuevo producto al menú del restaurante
                </p>
            </DrawerHeader>
            <div className="px-5 py-2 gap-5 flex flex-col flex-1 overflow-y-auto">
                <div className="flex flex-col gap-2">
                    <SubTitle icon={<TagOutline />} title="Nombre del Producto" />
                    <input
                        type="text"
                        value={productName}
                        autoCapitalize="off"
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
                    <SubTitle icon={<GalleryOutline />} title="Imagen del Producto (Opcional)" />
                    <FileDropzone
                        accept="image/png,image/jpeg,image/gif"
                        maxSizeMB={5}
                        onFileSelect={(file) => {
                            setImageFile((Array.isArray(file) ? file[0] : file) ?? null);
                        }}
                        className="bg-gray-100"
                    />
                    {errors.imageFile && (
                        <p className="text-negativo text-sm">{errors.imageFile}</p>
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
                        value={stock}
                        autoCapitalize="off"
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="Ej. 10"
                        aria-invalid={!!errors.stock}
                        className={`bg-gray-100 rounded-2xl px-4 py-3 text-gray-900 placeholder:text-gray-500 border ${errors.stock ? "border-negativo" : "border-gray-300"}`}
                        step={1}
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
                            <option value="" disabled>
                                Selecciona una categoría
                            </option>
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
                                value={cost}
                                autoCapitalize="off"
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
                                value={price}
                                autoCapitalize="off"
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

                {/* Sección de Extras */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <SubTitle icon={<DollarOutline />} title="Extras (Opcional)" />
                        <button
                            type="button"
                            onClick={addExtra}
                            className="bg-navy-900 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-navy-800 transition-colors"
                        >
                            + Agregar Extra
                        </button>
                    </div>
                    
                    {extras.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {extras.map((extra, index) => (
                                <div key={index} className="flex gap-2 items-start bg-gray-100 p-3 rounded-xl">
                                    <div className="flex-1 flex flex-col gap-2">
                                        <input
                                            type="text"
                                            value={extra.nombreExtra}
                                            onChange={(e) => updateExtra(index, 'nombreExtra', e.target.value)}
                                            placeholder="Nombre del extra (Ej. Extra queso)"
                                            className="bg-white rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 border border-gray-300"
                                        />
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 text-sm">
                                                $
                                            </span>
                                            <input
                                                type="number"
                                                value={extra.costoExtra}
                                                onChange={(e) => updateExtra(index, 'costoExtra', e.target.value)}
                                                placeholder="Costo"
                                                className="bg-white rounded-xl px-3 py-2 pl-6 pr-12 text-sm text-gray-900 placeholder:text-gray-500 w-full border border-gray-300"
                                                step="0.01"
                                                min="0"
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                                                MXN
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeExtra(index)}
                                        className="text-negativo hover:text-red-700 p-2 mt-1"
                                        title="Eliminar extra"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <DrawerFooter className="px-8 gap-4 py-4 flex flex-row justify-between items-center border-t-gray-500 border-t-2 w-full bg-gray-100">
                <DrawerClose asChild>
                    <div 
                        onClick={resetForm}
                        className="w-fit text-gray-700 flex gap-2 items-center border-gray-700/50 border-2 rounded-2xl  py-4 px-3 cursor-pointer"
                    >
                        Cancelar
                    </div>
                </DrawerClose>
                <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="w-full bg-Blue-700 rounded-2xl py-4 px-3 text-white disabled:opacity-50"
                >
                    {loading ? "Agregando..." : "Agregar"}
                </button>
                <DrawerClose asChild>
                    <button ref={closeRef} className="hidden" aria-hidden onClick={resetForm} />
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
