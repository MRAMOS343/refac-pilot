import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sale, Inventory, Product } from '@/types';

/**
 * Definiciones memoizadas de columnas para tablas
 * Evita recrear objetos en cada render
 */

export const getVentasColumns = (getProductName: (id: string) => string) => [
  {
    key: 'fecha',
    label: 'Fecha',
    render: (sale: Sale) => format(new Date(sale.fechaISO), "dd/MM/yyyy HH:mm", { locale: es }),
  },
  {
    key: 'id',
    label: 'ID',
    render: (sale: Sale) => <span className="font-mono text-sm">{sale.id.slice(0, 8)}</span>,
  },
  {
    key: 'items',
    label: 'Productos',
    render: (sale: Sale) => (
      <div className="max-w-xs">
        {sale.items.slice(0, 2).map((item, idx) => (
          <div key={idx} className="text-sm text-muted-foreground truncate">
            {getProductName(item.productId)}
          </div>
        ))}
        {sale.items.length > 2 && (
          <span className="text-xs text-muted-foreground">
            +{sale.items.length - 2} más
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'total',
    label: 'Total',
    render: (sale: Sale) => (
      <span className="font-semibold text-success">
        ${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    key: 'metodoPago',
    label: 'Método de Pago',
    render: (sale: Sale) => {
      const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
        efectivo: 'default',
        tarjeta: 'secondary',
        transferencia: 'outline',
      };
      return (
        <Badge variant={variants[sale.metodoPago] || 'default'}>
          {sale.metodoPago}
        </Badge>
      );
    },
  },
];

export const getInventoryColumns = (
  getProductName: (id: string) => string,
  getWarehouseName: (id: string) => string
) => [
  {
    key: 'producto',
    label: 'Producto',
    render: (inv: Inventory) => getProductName(inv.productId),
  },
  {
    key: 'sucursal',
    label: 'Sucursal',
    render: (inv: Inventory) => getWarehouseName(inv.warehouseId),
  },
  {
    key: 'disponible',
    label: 'Disponible',
    render: (inv: Inventory) => (
      <span className="font-semibold">{inv.onHand - inv.reserved}</span>
    ),
  },
  {
    key: 'reservado',
    label: 'Reservado',
    render: (inv: Inventory) => (
      <span className="text-muted-foreground">{inv.reserved}</span>
    ),
  },
  {
    key: 'total',
    label: 'Total',
    render: (inv: Inventory) => <span className="font-semibold">{inv.onHand}</span>,
  },
  {
    key: 'estado',
    label: 'Estado',
    render: (inv: Inventory) => {
      const disponible = inv.onHand - inv.reserved;
      return (
        <Badge variant={disponible > 10 ? 'default' : disponible > 0 ? 'secondary' : 'destructive'}>
          {disponible > 10 ? 'En stock' : disponible > 0 ? 'Bajo' : 'Agotado'}
        </Badge>
      );
    },
  },
];

export const getProductsColumns = () => [
  {
    key: 'nombre',
    label: 'Nombre',
    render: (product: Product) => (
      <div>
        <div className="font-medium">{product.nombre}</div>
        <div className="text-sm text-muted-foreground">{product.marca}</div>
      </div>
    ),
  },
  {
    key: 'sku',
    label: 'SKU',
    render: (product: Product) => (
      <span className="font-mono text-sm">{product.sku}</span>
    ),
  },
  {
    key: 'categoria',
    label: 'Categoría',
    render: (product: Product) => <Badge variant="outline">{product.categoria}</Badge>,
  },
  {
    key: 'precio',
    label: 'Precio',
    render: (product: Product) => (
      <span className="font-semibold text-success">
        ${product.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </span>
    ),
  },
];
