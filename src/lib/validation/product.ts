// Common product form validation utilities to be shared across components

export const OTHER_CATEGORY = "other" as const;

export type ProductFormFields = {
    productName: string;
    description?: string;
    stock: string;
    selectedCategory: string;
    newCategoryInput: string;
    cost: string;
    price: string;
    imageFile?: File | null;
};

export type ProductValidationOptions = {
    requireImage?: boolean;
};

export type ProductValidationErrors = Partial<{
    productName: string;
    imageFile: string;
    description: string;
    stock: string;
    category: string;
    cost: string;
    price: string;
}>;

export type ProductValidatedValues = {
    name: string;
    description: string | null;
    stock: number;
    category: string;
    cost: number;
    price: number;
};

export function parseMoney(val: string): number {
    return parseFloat(val.replace(",", "."));
}

export function validateProduct(
    fields: ProductFormFields,
    opts: ProductValidationOptions = {}
): { errors: ProductValidationErrors; values?: ProductValidatedValues } {
    const {
        productName,
        description = "",
        stock,
        selectedCategory,
        newCategoryInput,
        cost,
        price,
        imageFile,
    } = fields;

    const errors: ProductValidationErrors = {};

    // Nombre
    if (productName.trim().length < 3) {
        errors.productName = "El nombre es obligatorio (mín. 3 caracteres).";
    }

    // La imagen ahora es siempre opcional
    // Se usarán imágenes por defecto si no se proporciona

    // Stock
    const stockNum = Number.isFinite(Number(stock)) ? parseInt(stock, 10) : NaN;
    if (Number.isNaN(stockNum) || stockNum < 0) {
        errors.stock = "Ingresa un stock válido (entero ≥ 0).";
    }

    // Categoría
    if (!selectedCategory) {
        errors.category = "Selecciona una categoría.";
    } else if (selectedCategory === OTHER_CATEGORY) {
        if (newCategoryInput.trim().length < 3) {
            errors.category = "Escribe la nueva categoría (mín. 3 caracteres).";
        }
    }

    // Costos
    const costNum = parseMoney(cost);
    if (!Number.isFinite(costNum) || costNum < 0) {
        errors.cost = "Ingresa un costo válido (≥ 0).";
    }

    const priceNum = parseMoney(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
        errors.price = "Ingresa un precio válido (> 0).";
    } else if (Number.isFinite(costNum) && priceNum < costNum) {
        errors.price = "El precio debe ser mayor o igual al costo.";
    }

    if (Object.keys(errors).length > 0) {
        return { errors };
    }

    const finalCategory =
        selectedCategory === OTHER_CATEGORY
            ? newCategoryInput.trim()
            : selectedCategory;

    const values: ProductValidatedValues = {
        name: productName.trim(),
        description: description.trim() || null,
        stock: stockNum,
        category: finalCategory,
        cost: Number(costNum.toFixed(2)),
        price: Number(priceNum.toFixed(2)),
    };

    return { errors, values };
}
