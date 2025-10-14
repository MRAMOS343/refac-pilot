import { createContext, useContext, ReactNode } from 'react';
import { 
  mockProducts, 
  mockSales, 
  mockInventory, 
  mockWarehouses, 
  mockUsers,
  mockSuppliers,
  mockTeams,
  mockTickets,
  mockTicketComments,
  getProductById,
  getWarehouseById
} from '@/data/mockData';
import { Product, Sale, Inventory, Warehouse, User, Supplier, Team, Ticket, TicketComment } from '@/types';

interface DataContextType {
  products: Product[];
  sales: Sale[];
  inventory: Inventory[];
  warehouses: Warehouse[];
  users: User[];
  suppliers: Supplier[];
  teams: Team[];
  tickets: Ticket[];
  ticketComments: TicketComment[];
  getProductById: (id: string) => Product | undefined;
  getWarehouseById: (id: string) => Warehouse | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const value: DataContextType = {
    products: mockProducts,
    sales: mockSales,
    inventory: mockInventory,
    warehouses: mockWarehouses,
    users: mockUsers,
    suppliers: mockSuppliers,
    teams: mockTeams,
    tickets: mockTickets,
    ticketComments: mockTicketComments,
    getProductById,
    getWarehouseById,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
