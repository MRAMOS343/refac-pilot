import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { mockProducts } from "@/data/mockData";
import { Product, SaleItem } from "@/types";
import { Trash2, Plus, Search } from "lucide-react";

const saleItemSchema = z.object({
  productId: z.string().min(1, "Producto es requerido"),
  qty: z.number().min(1, "La cantidad debe ser mayor a 0"),
  unitPrice: z.number().min(0.01, "El precio debe ser mayor a 0"),
  discount: z.number().min(0, "El descuento no puede ser negativo").max(100, "El descuento no puede ser mayor a 100%").optional(),
});

const saleSchema = z.object({
  metodoPago: z.enum(['efectivo', 'tarjeta', 'transferencia', 'credito'], {
    required_error: "Método de pago es requerido",
  }),
  cliente: z.string().max(100, "Nombre del cliente debe tener máximo 100 caracteres").optional(),
  items: z.array(saleItemSchema).min(1, "Debe agregar al menos un producto"),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId: string;
  onSave: (sale: SaleFormData) => void;
}

export function SaleModal({ open, onOpenChange, warehouseId, onSave }: SaleModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [productSearch, setProductSearch] = useState("");

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      metodoPago: 'efectivo',
      cliente: "",
      items: [],
    },
  });

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product =>
      product.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.marca.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const discount = item.discount || 0;
      const itemTotal = item.qty * item.unitPrice;
      return sum + (itemTotal - (itemTotal * discount / 100));
    }, 0);
    
    const iva = subtotal * 0.16; // 16% IVA
    const total = subtotal + iva;

    return { subtotal, iva, total };
  }, [items]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        metodoPago: 'efectivo',
        cliente: "",
        items: [],
      });
      setItems([]);
      setSelectedProductId("");
      setQuantity(1);
      setProductSearch("");
    }
  }, [open, form]);

  const addItem = () => {
    if (!selectedProductId || quantity <= 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar un producto y cantidad válida.",
        variant: "destructive",
      });
      return;
    }

    const product = mockProducts.find(p => p.id === selectedProductId);
    if (!product) return;

    // Check if product already exists in items
    const existingItemIndex = items.findIndex(item => item.productId === selectedProductId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex].qty += quantity;
      setItems(updatedItems);
    } else {
      // Add new item
      const newItem: SaleItem = {
        productId: selectedProductId,
        qty: quantity,
        unitPrice: product.precio,
        discount: 0,
      };
      setItems([...items, newItem]);
    }

    setSelectedProductId("");
    setQuantity(1);
    setProductSearch("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, qty: number) => {
    if (qty <= 0) return;
    const updatedItems = [...items];
    updatedItems[index].qty = qty;
    setItems(updatedItems);
  };

  const updateItemDiscount = (index: number, discount: number) => {
    if (discount < 0 || discount > 100) return;
    const updatedItems = [...items];
    updatedItems[index].discount = discount;
    setItems(updatedItems);
  };

  const onSubmit = async (data: SaleFormData) => {
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un producto a la venta.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const saleData = {
        ...data,
        items,
      };
      await onSave(saleData);
      toast({
        title: "Venta registrada",
        description: `Venta por ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totals.total)} registrada exitosamente.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al registrar la venta.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductName = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    return product ? `${product.nombre} - ${product.marca}` : "Producto no encontrado";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Venta</DialogTitle>
          <DialogDescription>
            Registra una nueva venta agregando productos y especificando el método de pago.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Sale Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metodoPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="credito">Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Add Product Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold">Agregar Productos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Buscar Producto</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, SKU o marca..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  {productSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {filteredProducts.slice(0, 5).map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                          onClick={() => {
                            setSelectedProductId(product.id);
                            setProductSearch(`${product.nombre} - ${product.marca}`);
                          }}
                        >
                          <div>
                            <span className="font-medium">{product.nombre}</span>
                            <span className="text-muted-foreground"> - {product.marca}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            SKU: {product.sku} | ${product.precio}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Cantidad</label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    placeholder="1"
                  />
                </div>

                <Button type="button" onClick={addItem} disabled={!selectedProductId}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>

            {/* Items Table */}
            {items.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="w-24">Cantidad</TableHead>
                      <TableHead className="w-28">Precio Unit.</TableHead>
                      <TableHead className="w-24">Desc. %</TableHead>
                      <TableHead className="w-28">Subtotal</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const subtotal = item.qty * item.unitPrice;
                      const discount = item.discount || 0;
                      const total = subtotal - (subtotal * discount / 100);
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="text-sm">
                              {getProductName(item.productId)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              ${item.unitPrice.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount || 0}
                              onChange={(e) => updateItemDiscount(index, parseFloat(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              ${total.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Totals */}
            {items.length > 0 && (
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (16%):</span>
                    <span>${totals.iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || items.length === 0}>
                {isSubmitting ? "Registrando..." : "Registrar Venta"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}