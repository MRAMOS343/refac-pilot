import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TicketModal } from '@/components/modals/TicketModal';
import { TicketCard } from '@/components/modals/TicketCard';
import { TicketFilters } from '@/components/modals/TicketFilters';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockTickets, mockTicketComments } from '@/data/mockData';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '@/types';
import { Plus, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function SoportePage() {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useLocalStorage('autoparts_tickets', mockTickets);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>();

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'todos'>('todos');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'todos'>('todos');
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'todos'>('todos');

  const isAdmin = currentUser?.role === 'admin';

  // Filtrar tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Filtro por usuario (no admins solo ven sus tickets)
      if (!isAdmin && ticket.userId !== currentUser?.id) return false;

      // Búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !ticket.titulo.toLowerCase().includes(query) &&
          !ticket.descripcion.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Filtros
      if (statusFilter !== 'todos' && ticket.estado !== statusFilter) return false;
      if (priorityFilter !== 'todos' && ticket.prioridad !== priorityFilter) return false;
      if (categoryFilter !== 'todos' && ticket.categoria !== categoryFilter) return false;

      return true;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, categoryFilter, isAdmin, currentUser]);

  // Estadísticas
  const stats = useMemo(() => {
    const userTickets = isAdmin 
      ? tickets 
      : tickets.filter((t) => t.userId === currentUser?.id);

    return {
      total: userTickets.length,
      abiertos: userTickets.filter((t) => t.estado === 'abierto').length,
      enProgreso: userTickets.filter((t) => t.estado === 'en_progreso').length,
      resueltos: userTickets.filter((t) => t.estado === 'resuelto').length,
    };
  }, [tickets, isAdmin, currentUser]);

  const handleCreateTicket = (data: any) => {
    const newTicket: Ticket = {
      id: `tk${tickets.length + 1}`,
      ...data,
      estado: 'abierto' as TicketStatus,
      userId: currentUser?.id || '',
      usuarioNombre: currentUser?.nombre || '',
      metadata: {
        navegador: navigator.userAgent,
        dispositivo: /Mobile/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        url: window.location.pathname,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTickets([newTicket, ...tickets]);
  };

  const handleTicketClick = (ticket: Ticket) => {
    toast({
      title: ticket.titulo,
      description: `Estado: ${ticket.estado} | Prioridad: ${ticket.prioridad}`,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('todos');
    setPriorityFilter('todos');
    setCategoryFilter('todos');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Soporte Técnico</h1>
          <p className="text-muted-foreground">
            Gestiona tus tickets y consultas
          </p>
        </div>
        <Button onClick={() => setTicketModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abiertos</CardTitle>
            <AlertCircle className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.abiertos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enProgreso}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resueltos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <TicketFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Tickets ({filteredTickets.length})
          </CardTitle>
          <CardDescription>
            {isAdmin 
              ? 'Todos los tickets de soporte del sistema'
              : 'Tus tickets de soporte'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No hay tickets</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery || statusFilter !== 'todos' || priorityFilter !== 'todos' || categoryFilter !== 'todos'
                  ? 'No se encontraron tickets con los filtros aplicados.'
                  : 'Crea tu primer ticket para empezar.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => handleTicketClick(ticket)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <TicketModal
        open={ticketModalOpen}
        onOpenChange={setTicketModalOpen}
        ticket={selectedTicket}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}
