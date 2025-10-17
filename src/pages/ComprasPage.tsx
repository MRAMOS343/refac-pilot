import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, AlertTriangle, Package, TrendingDown, Download } from 'lucide-react';
import { mockProducts, mockInventory, mockWarehouses, getProductById, getWarehouseById } from '../data/mockData';
import { User, PurchaseSuggestion } from '../types';
import { toast } from '@/hooks/use-toast';

interface ContextType {
  currentWarehouse: string;
  searchQuery: string;
  currentUser: User;
}

export default function ComprasPage() {
  const { currentWarehouse, searchQuery, currentUser } = useOutletContext<ContextType>();
  const [leadTimeDias, setLeadTimeDias] = useState<number>(7);
  const [safetyStockPercent, setSafetyStockPercent] = useState<number>(20);
  const [horizonteSemanas, setHorizonteSemanas] = useState<number>(4);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(currentWarehouse);

  // Generate purchase suggestions
  const purchaseSuggestions: PurchaseSuggestion[] = useMemo(() => {
    const warehouseInventory = mockInventory.filter(inv => inv.warehouseId === selectedWarehouse);
    
    return warehouseInventory
      .map(inv => {
        const product = getProductById(inv.productId);
        if (!product) return null;

        // Simulate demand calculation (in real app, this would come from forecasting service)
        const avgWeeklyDemand = Math.random() * 10 + 2; // Mock average weekly demand
        const demandaEsperada = avgWeeklyDemand * horizonteSemanas;
        const demandaLeadTime = avgWeeklyDemand * (leadTimeDias / 7);
        
        // Calculate safety stock
        const calculatedSafetyStock = Math.max(
          product.safetyStock,
          (avgWeeklyDemand * safetyStockPercent) / 100
        );
        
        // Calculate suggested quantity
        const requiredStock = demandaLeadTime + calculatedSafetyStock;
        const qtySugerida = Math.max(0, Math.ceil(requiredStock - inv.onHand));
        
        // Calculate coverage in days
        const coberturaDias = inv.onHand > 0 ? (inv.onHand / avgWeeklyDemand) * 7 : 0;
        
        return {
          productId: inv.productId,
          warehouseId: inv.warehouseId,
          onHand: inv.onHand,
          reorderPoint: product.reorderPoint,
          demandaEsperada: Math.round(demandaEsperada * 100) / 100,
          coberturaDias: Math.round(coberturaDias * 100) / 100,
          qtySugerida,
          costo: qtySugerida * product.precio
        } as PurchaseSuggestion;
      })
      .filter((suggestion): suggestion is PurchaseSuggestion => suggestion !== null)
      .filter(suggestion => {
        const product = getProductById(suggestion.productId);
        if (!product) return false;
        
        // Apply search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          if (!product.nombre.toLowerCase().includes(searchLower) &&
              !product.sku.toLowerCase().includes(searchLower) &&
              !product.marca.toLowerCase().includes(searchLower)) {
            return false;
          }
        }
        
        // Only show items that need reordering
        return suggestion.qtySugerida > 0;
      })
      .sort((a, b) => {
        // Sort by urgency (lower coverage days first)
        return a.coberturaDias - b.coberturaDias;
      });
  }, [selectedWarehouse, leadTimeDias, safetyStockPercent, horizonteSemanas, searchQuery]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalItems = purchaseSuggestions.length;
    const totalCost = purchaseSuggestions.reduce((sum, item) => sum + (item.costo || 0), 0);
    const urgentItems = purchaseSuggestions.filter(item => item.coberturaDias <= 7).length;
    
    return { totalItems, totalCost, urgentItems };
  }, [purchaseSuggestions]);

  const handleGeneratePreOrder = () => {
    if (currentUser.role === 'cajero') {
      toast({
        title: "Acceso denegado",
        description: "Solo gerentes y administradores pueden generar pre-órdenes.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Función requiere backend",
      description: "La generación de pre-órdenes estará disponible cuando se conecte un backend real.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Exportando sugerencias",
      description: "Generando archivo CSV con las sugerencias de compra...",
    });
  };

  const getUrgencyBadge = (coberturaDias: number) => {
    if (coberturaDias <= 3) {
      return <Badge variant="destructive">Crítico</Badge>;
    } else if (coberturaDias <= 7) {
      return <Badge variant="secondary">Urgente</Badge>;
    } else if (coberturaDias <= 14) {
      return <Badge variant="outline">Normal</Badge>;
    } else {
      return <Badge variant="default">Bajo</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compra Sugerida</h1>
          <p className="text-muted-foreground">
            Sugerencias de reabastecimiento basadas en demanda y stock actual
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button 
            onClick={handleGeneratePreOrder} 
            size="sm"
            disabled={currentUser.role === 'cajero' || purchaseSuggestions.length === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Generar Pre-orden
          </Button>
        </div>
      </div>

      {/* Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Los cálculos son simulados. En producción, estos datos provendrían de sistemas de forecasting y gestión de inventario reales.
        </AlertDescription>
      </Alert>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Cálculo</CardTitle>
          <CardDescription>
            Ajusta los parámetros para el cálculo de sugerencias de compra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse">Sucursal</Label>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockWarehouses.map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leadTime">Lead Time (días)</Label>
              <Input
                id="leadTime"
                type="number"
                value={leadTimeDias}
                onChange={(e) => setLeadTimeDias(Number(e.target.value))}
                min="1"
                max="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="safetyStock">Safety Stock (%)</Label>
              <Input
                id="safetyStock"
                type="number"
                value={safetyStockPercent}
                onChange={(e) => setSafetyStockPercent(Number(e.target.value))}
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horizon">Horizonte (semanas)</Label>
              <Input
                id="horizon"
                type="number"
                value={horizonteSemanas}
                onChange={(e) => setHorizonteSemanas(Number(e.target.value))}
                min="1"
                max="12"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="kpi-card">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Items a Comprar</p>
              <p className="text-2xl font-bold">{summaryMetrics.totalItems}</p>
            </div>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Costo Total Estimado</p>
              <p className="text-2xl font-bold">
                ${summaryMetrics.totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Items Urgentes</p>
              <p className="text-2xl font-bold">{summaryMetrics.urgentItems}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Purchase Suggestions Table */}
      <Card className="data-table">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sugerencias de Compra</CardTitle>
              <CardDescription>
                Productos que requieren reabastecimiento en {getWarehouseById(selectedWarehouse)?.nombre}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {purchaseSuggestions.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No hay sugerencias de compra
              </h3>
              <p className="text-sm text-muted-foreground">
                Todos los productos tienen stock suficiente o ajusta los parámetros de configuración.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Stock Actual</TableHead>
                    <TableHead className="text-right">Punto Reorden</TableHead>
                    <TableHead className="text-right">Demanda Esperada</TableHead>
                    <TableHead className="text-right">Cobertura (días)</TableHead>
                    <TableHead className="text-right">Cantidad Sugerida</TableHead>
                    <TableHead className="text-right">Costo Estimado</TableHead>
                    <TableHead className="text-center">Urgencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseSuggestions.map((suggestion) => {
                    const product = getProductById(suggestion.productId)!;
                    
                    return (
                      <TableRow key={`${suggestion.productId}-${suggestion.warehouseId}`} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.nombre}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.marca} - {product.categoria}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{suggestion.onHand}</TableCell>
                        <TableCell className="text-right">{suggestion.reorderPoint}</TableCell>
                        <TableCell className="text-right">{suggestion.demandaEsperada}</TableCell>
                        <TableCell className="text-right">
                          <span className={suggestion.coberturaDias <= 7 ? 'text-destructive font-medium' : ''}>
                            {suggestion.coberturaDias.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {suggestion.qtySugerida}
                        </TableCell>
                        <TableCell className="text-right">
                          ${suggestion.costo?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell className="text-center">
                          {getUrgencyBadge(suggestion.coberturaDias)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}