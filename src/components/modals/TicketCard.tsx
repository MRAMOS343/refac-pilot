import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '@/types';
import { 
  Bug, 
  HelpCircle, 
  Lightbulb, 
  LifeBuoy, 
  FileText,
  Clock,
  User
} from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

const categoriaIcons: Record<TicketCategory, typeof Bug> = {
  bug: Bug,
  consulta: HelpCircle,
  sugerencia: Lightbulb,
  soporte: LifeBuoy,
  reporte: FileText,
};

const estadoColors: Record<TicketStatus, string> = {
  abierto: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  en_progreso: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  resuelto: 'bg-green-500/10 text-green-700 dark:text-green-400',
  cerrado: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
};

const estadoLabels: Record<TicketStatus, string> = {
  abierto: 'Abierto',
  en_progreso: 'En Progreso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
};

const prioridadColors: Record<TicketPriority, string> = {
  baja: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  media: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  alta: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  urgente: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

const prioridadLabels: Record<TicketPriority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
};

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const CategoriaIcon = categoriaIcons[ticket.categoria];
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-1">
              <CategoriaIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight line-clamp-2">
                {ticket.titulo}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {ticket.descripcion}
              </p>
            </div>
          </div>
          <Badge className={prioridadColors[ticket.prioridad]}>
            {prioridadLabels[ticket.prioridad]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge className={estadoColors[ticket.estado]} variant="outline">
            {estadoLabels[ticket.estado]}
          </Badge>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(ticket.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{ticket.usuarioNombre}</span>
          </div>

          {ticket.asignadoA && (
            <Badge variant="secondary" className="text-xs">
              Asignado: {ticket.asignadoA}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
