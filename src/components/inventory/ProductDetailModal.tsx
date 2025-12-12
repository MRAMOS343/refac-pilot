import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Plus, X, Edit2, Check, Trash2 } from 'lucide-react';
import { Product, Inventory } from '@/types';
import { cn } from '@/lib/utils';
import { showSuccessToast } from '@/utils/toastHelpers';

interface InventoryWithProduct extends Inventory {
  product: Product;
}

interface Specification {
  id: string;
  label: string;
  value: string;
}

interface Compatibility {
  marca: string;
  modelo: string;
  año: string;
}

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryWithProduct | null;
}

// Mock data for specifications - in production this would come from DB
const getInitialSpecs = (product: Product): Specification[] => [
  { id: '1', label: 'Voltaje', value: '12 V' },
  { id: '2', label: 'Corriente', value: '100 A' },
  { id: '3', label: 'Material', value: 'Aluminio' },
  { id: '4', label: 'Peso', value: '2.5 kg' },
];

const getInitialCompatibility = (): Compatibility => ({
  marca: 'Honda',
  modelo: 'Accord',
  año: '2018',
});

const getInitialEquivalences = (): string[] => [
  'Bosch',
  'Denso',
  'Valeo',
];

export function ProductDetailModal({ open, onOpenChange, item }: ProductDetailModalProps) {
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [compatibility, setCompatibility] = useState<Compatibility>(getInitialCompatibility());
  const [equivalences, setEquivalences] = useState<string[]>([]);
  const [editingSpecId, setEditingSpecId] = useState<string | null>(null);
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [showAddSpec, setShowAddSpec] = useState(false);
  const [newEquivalence, setNewEquivalence] = useState('');
  const [showAddEquivalence, setShowAddEquivalence] = useState(false);

  // Initialize data when modal opens with a new item
  const initializeData = () => {
    if (item) {
      setSpecifications(getInitialSpecs(item.product));
      setCompatibility(getInitialCompatibility());
      setEquivalences(getInitialEquivalences());
    }
  };

  // Reset state when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && item) {
      initializeData();
    }
    onOpenChange(newOpen);
  };

  if (!item) return null;

  const { product, onHand } = item;

  const handleAddSpecification = () => {
    if (newSpecLabel.trim() && newSpecValue.trim()) {
      const newSpec: Specification = {
        id: Date.now().toString(),
        label: newSpecLabel.trim(),
        value: newSpecValue.trim(),
      };
      setSpecifications([...specifications, newSpec]);
      setNewSpecLabel('');
      setNewSpecValue('');
      setShowAddSpec(false);
      showSuccessToast('Especificación agregada', `${newSpecLabel} ha sido agregada.`);
    }
  };

  const handleRemoveSpecification = (id: string) => {
    setSpecifications(specifications.filter(spec => spec.id !== id));
    showSuccessToast('Especificación eliminada', 'La especificación ha sido eliminada.');
  };

  const handleUpdateSpecification = (id: string, newValue: string) => {
    setSpecifications(specifications.map(spec => 
      spec.id === id ? { ...spec, value: newValue } : spec
    ));
    setEditingSpecId(null);
  };

  const handleAddEquivalence = () => {
    if (newEquivalence.trim() && !equivalences.includes(newEquivalence.trim())) {
      setEquivalences([...equivalences, newEquivalence.trim()]);
      setNewEquivalence('');
      setShowAddEquivalence(false);
      showSuccessToast('Equivalencia agregada', `${newEquivalence} ha sido agregada.`);
    }
  };

  const handleRemoveEquivalence = (equiv: string) => {
    setEquivalences(equivalences.filter(e => e !== equiv));
    showSuccessToast('Equivalencia eliminada', 'La equivalencia ha sido eliminada.');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-bold">{product.nombre}</DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>SKU: {product.sku}</span>
            <span>•</span>
            <span>{product.marca}</span>
            <span>•</span>
            <Badge variant="outline">{product.categoria}</Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column: Image and Compatibility */}
              <div className="space-y-6">
                {/* Product Image */}
                <div className="aspect-square bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                  <Package className="w-24 h-24 text-muted-foreground/30" />
                </div>

                {/* Compatibility Section */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-primary">Compatibilidad</h3>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-muted-foreground text-sm">Marca</Label>
                      <p className="font-medium">{compatibility.marca}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Modelo</Label>
                      <p className="font-medium">{compatibility.modelo}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Año</Label>
                      <p className="font-medium">{compatibility.año}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Stock</Label>
                      <p className="font-medium">{onHand} {product.unidad}</p>
                    </div>
                  </div>
                </div>

                {/* Equivalences Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Equivalencias</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddEquivalence(true)}
                      className="h-8 px-2"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                  <Separator />
                  
                  {showAddEquivalence && (
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Nueva equivalencia (ej: Bosch)"
                        value={newEquivalence}
                        onChange={(e) => setNewEquivalence(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddEquivalence()}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleAddEquivalence}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setShowAddEquivalence(false);
                          setNewEquivalence('');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <ul className="space-y-2">
                    {equivalences.map((equiv, index) => (
                      <li 
                        key={index} 
                        className="flex items-center justify-between group py-1.5 px-2 rounded-md hover:bg-muted/50"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {equiv}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveEquivalence(equiv)}
                        >
                          <X className="w-3 h-3 text-destructive" />
                        </Button>
                      </li>
                    ))}
                    {equivalences.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        No hay equivalencias registradas
                      </p>
                    )}
                  </ul>
                </div>
              </div>

              {/* Right Column: Technical Specifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary">Ficha Técnica</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddSpec(true)}
                    className="h-8 px-2"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                <Separator />

                {showAddSpec && (
                  <div className="flex gap-2 mb-3 p-3 bg-muted/50 rounded-lg">
                    <Input
                      placeholder="Etiqueta"
                      value={newSpecLabel}
                      onChange={(e) => setNewSpecLabel(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Valor"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSpecification()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleAddSpecification}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setShowAddSpec(false);
                        setNewSpecLabel('');
                        setNewSpecValue('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="space-y-1">
                  {specifications.map((spec) => (
                    <div 
                      key={spec.id}
                      className={cn(
                        "flex items-center justify-between py-3 px-3 rounded-lg group",
                        "hover:bg-muted/50 transition-colors"
                      )}
                    >
                      <span className="text-muted-foreground font-medium min-w-[100px]">
                        {spec.label}:
                      </span>
                      
                      {editingSpecId === spec.id ? (
                        <div className="flex items-center gap-2 flex-1 ml-4">
                          <Input
                            defaultValue={spec.value}
                            className="h-8"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateSpecification(spec.id, e.currentTarget.value);
                              } else if (e.key === 'Escape') {
                                setEditingSpecId(null);
                              }
                            }}
                            autoFocus
                          />
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditingSpecId(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium flex-1 text-right">{spec.value}</span>
                          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => setEditingSpecId(spec.id)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveSpecification(spec.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  
                  {specifications.length === 0 && (
                    <p className="text-sm text-muted-foreground italic py-4 text-center">
                      No hay especificaciones registradas
                    </p>
                  )}
                </div>

                {/* Price Info */}
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Precio:</span>
                    <span className="text-xl font-bold">${product.precio.toLocaleString('es-MX')} MXN</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">IVA ({product.iva}%):</span>
                    <span>${(product.precio * product.iva / 100).toLocaleString('es-MX')} MXN</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Total:</span>
                    <span className="text-lg font-bold text-primary">
                      ${(product.precio * (1 + product.iva / 100)).toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                </div>

                {/* Description */}
                {product.descripcion && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Descripción</h4>
                    <p className="text-sm text-muted-foreground">{product.descripcion}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
