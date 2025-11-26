// Table Types
export interface Table {
  _id: string;
  numeroMesa: number;
  nombrePersonalizado?: string;
  claveRestaurante: string;
  activa: boolean;
  fechaRegistro: Date;
}

// Account Types
export interface AccountItem {
  _id?: string;
  productoId: string;
  nombreProducto: string;
  imagenProducto?: string;
  precioBase: number;
  cantidad: number;
  extras: Array<{
    nombreExtra: string;
    costoExtra: number;
  }>;
  comentarios?: string;
  precioTotal: number;
  comandado: boolean;
  fechaComandado?: Date;
}

export interface Account {
  _id: string;
  numeroTicket: number;
  mesa: {
    numeroMesa: number;
    nombrePersonalizado?: string;
  };
  mesero: string;
  items: AccountItem[];
  subtotal: number;
  estado: "abierta" | "finalizada" | "cerrada" | "cancelada";
  claveRestaurante: string;
  fechaApertura: Date;
  fechaCierre?: Date;
  metodoPago?: string;
  totalPagado?: number;
}

// Temporary order item (before commanding)
export interface TempOrderItem {
  productoId: string;
  nombreProducto: string;
  imagenProducto?: string;
  precioBase: number;
  cantidad: number;
  extras: Array<{
    nombreExtra: string;
    costoExtra: number;
  }>;
  comentarios?: string;
  precioTotal: number;
}
