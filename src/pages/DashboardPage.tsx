import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockSales, mockInventory, mockProducts, mockWarehouses } from "@/data/mockData";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { TrendingUp, ShoppingCart, Package, DollarSign, AlertTriangle, Plus } from "lucide-react";
import { Sale, User, KPIData } from "@/types";

interface ContextType {
  currentWarehouse: string;
  searchQuery: string;
  currentUser: User;
}

export default function DashboardPage() {
  const { currentWarehouse, currentUser } = useOutletContext<ContextType>();

  // Global KPIs calculation
  const globalKPIs = useMemo((): KPIData[] => {
    const totalSales = mockSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProducts = mockProducts.length;
    const lowStockItems = mockInventory.filter(inv => inv.onHand <= 10).length;
    const avgTicket = totalSales / mockSales.length;

    return [
      {
        label: "Ventas Totales",
        value: totalSales,
        format: "currency",
        change: 12.5,
        changeType: "positive"
      },
      {
        label: "Productos Únicos",
        value: totalProducts,
        format: "number",
        change: 2.1,
        changeType: "positive"
      },
      {
        label: "Ticket Promedio",
        value: avgTicket,
        format: "currency",
        change: -1.2,
        changeType: "negative"
      },
      {
        label: "Stock Bajo",
        value: lowStockItems,
        format: "number",
        change: 5.3,
        changeType: "negative"
      }
    ];
  }, []);

  // Sales trend data (last 7 days)
  const salesTrendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTotal = mockSales
        .filter(sale => sale.fechaISO.startsWith(date))
        .reduce((sum, sale) => sum + sale.total, 0);
      
      return {
        date: new Date(date).toLocaleDateString('es-MX', { weekday: 'short' }),
        value: dayTotal
      };
    });
  }, []);

  // Payment methods distribution
  const paymentMethodsData = useMemo(() => {
    const methods = mockSales.reduce((acc, sale) => {
      acc[sale.metodoPago] = (acc[sale.metodoPago] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(methods).map(([method, count]) => ({
      name: method.charAt(0).toUpperCase() + method.slice(1),
      value: count,
      percentage: (count / mockSales.length * 100).toFixed(1)
    }));
  }, []);

  // Top products by sales
  const topProducts = useMemo(() => {
    const productSales = mockSales.reduce((acc, sale) => {
      sale.items.forEach(item => {
        const product = mockProducts.find(p => p.id === item.productId);
        if (product) {
          if (!acc[product.id]) {
            acc[product.id] = { product, totalSold: 0, revenue: 0 };
          }
          acc[product.id].totalSold += item.qty;
          acc[product.id].revenue += item.qty * item.unitPrice;
        }
      });
      return acc;
    }, {} as Record<string, { product: any; totalSold: number; revenue: number }>);

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, []);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general del sistema - {mockWarehouses.find(w => w.id === currentWarehouse)?.nombre || 'Todas las sucursales'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Venta
          </Button>
          <Button variant="outline">
            <Package className="w-4 h-4 mr-2" />
            Agregar Producto
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {globalKPIs.map((kpi, index) => (
          <KPICard key={index} data={kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tendencia de Ventas (7 días)
            </CardTitle>
            <CardDescription>
              Evolución de las ventas en los últimos 7 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [
                    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value),
                    'Ventas'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Métodos de Pago
            </CardTitle>
            <CardDescription>
              Distribución de métodos de pago utilizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Productos Más Vendidos
            </CardTitle>
            <CardDescription>
              Top 5 productos por ingresos generados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((item, index) => (
                <div key={item.product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.product.nombre}</p>
                      <p className="text-sm text-muted-foreground">{item.product.marca}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.revenue)}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.totalSold} vendidos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertas del Sistema
            </CardTitle>
            <CardDescription>
              Notificaciones importantes que requieren atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Stock Bajo</p>
                  <p className="text-xs text-muted-foreground">
                    {globalKPIs[3].value} productos por debajo del punto de reorden
                  </p>
                </div>
                <Badge variant="destructive">Urgent</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Ventas en Declive</p>
                  <p className="text-xs text-muted-foreground">
                    El ticket promedio ha disminuido 1.2% esta semana
                  </p>
                </div>
                <Badge variant="secondary">Info</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Crecimiento Positivo</p>
                  <p className="text-xs text-muted-foreground">
                    Las ventas totales han aumentado 12.5% este mes
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">Good</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}