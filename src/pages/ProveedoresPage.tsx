import { useState } from "react";
import { Truck, Search, Mail, Phone, MapPin, FileText, Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockSuppliers } from "@/data/mockData";
import { Supplier } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function ProveedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    rfc: "",
    categorias: "",
    activo: true
  });

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "todos" || 
      (statusFilter === "activos" && supplier.activo) ||
      (statusFilter === "inactivos" && !supplier.activo);

    return matchesSearch && matchesStatus;
  });

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        nombre: supplier.nombre,
        contacto: supplier.contacto,
        telefono: supplier.telefono,
        email: supplier.email,
        direccion: supplier.direccion || "",
        rfc: supplier.rfc || "",
        categorias: supplier.categorias.join(", "),
        activo: supplier.activo
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        nombre: "",
        contacto: "",
        telefono: "",
        email: "",
        direccion: "",
        rfc: "",
        categorias: "",
        activo: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveSupplier = () => {
    if (!formData.nombre.trim()) {
      toast.error("El nombre del proveedor es requerido");
      return;
    }
    if (!formData.contacto.trim()) {
      toast.error("El nombre de contacto es requerido");
      return;
    }
    if (!formData.telefono.trim()) {
      toast.error("El teléfono es requerido");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("El email es requerido");
      return;
    }

    const categoriasArray = formData.categorias
      .split(",")
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (editingSupplier) {
      setSuppliers(suppliers.map(s =>
        s.id === editingSupplier.id
          ? {
              ...editingSupplier,
              nombre: formData.nombre,
              contacto: formData.contacto,
              telefono: formData.telefono,
              email: formData.email,
              direccion: formData.direccion,
              rfc: formData.rfc,
              categorias: categoriasArray,
              activo: formData.activo
            }
          : s
      ));
      toast.success("Proveedor actualizado correctamente");
    } else {
      const newSupplier: Supplier = {
        id: `s${suppliers.length + 1}`,
        nombre: formData.nombre,
        contacto: formData.contacto,
        telefono: formData.telefono,
        email: formData.email,
        direccion: formData.direccion,
        rfc: formData.rfc,
        categorias: categoriasArray,
        activo: formData.activo
      };
      setSuppliers([...suppliers, newSupplier]);
      toast.success("Proveedor creado correctamente");
    }

    setIsDialogOpen(false);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers(suppliers.filter(s => s.id !== supplierId));
    toast.success("Proveedor eliminado correctamente");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proveedores</h1>
          <p className="text-muted-foreground mt-1">Directorio de proveedores y contactos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? "Editar Proveedor" : "Agregar Nuevo Proveedor"}</DialogTitle>
              <DialogDescription>
                {editingSupplier ? "Actualiza los datos del proveedor" : "Completa la información del nuevo proveedor"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Proveedor *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Autopartes del Bajío S.A. de C.V."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto">Nombre de Contacto *</Label>
                  <Input
                    id="contacto"
                    value={formData.contacto}
                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                    placeholder="Ej: Ing. Roberto González"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="555-1234-567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ventas@proveedor.com.mx"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Av. Industria 456, León, Guanajuato"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rfc">RFC</Label>
                <Input
                  id="rfc"
                  value={formData.rfc}
                  onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                  placeholder="ABC890123-XYZ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categorias">Categorías (separadas por coma)</Label>
                <Textarea
                  id="categorias"
                  value={formData.categorias}
                  onChange={(e) => setFormData({ ...formData, categorias: e.target.value })}
                  placeholder="Frenos, Suspensión, Motor"
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                />
                <Label htmlFor="activo">Proveedor Activo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveSupplier}>
                {editingSupplier ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="activos">Activos</SelectItem>
            <SelectItem value="inactivos">Inactivos</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-sm">
          {filteredSuppliers.length} {filteredSuppliers.length === 1 ? "proveedor" : "proveedores"}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Categorías</TableHead>
                  <TableHead>RFC</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Truck className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{supplier.nombre}</p>
                          {supplier.direccion && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="line-clamp-1">{supplier.direccion}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{supplier.contacto}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a 
                          href={`tel:${supplier.telefono}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {supplier.telefono}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${supplier.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {supplier.email}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {supplier.categorias.slice(0, 2).map((cat, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                        {supplier.categorias.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{supplier.categorias.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-mono text-foreground">{supplier.rfc}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.activo ? "default" : "secondary"}>
                        {supplier.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(supplier)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredSuppliers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No se encontraron proveedores</p>
            <p className="text-sm text-muted-foreground mt-1">
              Intenta con otro término de búsqueda o ajusta los filtros
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
