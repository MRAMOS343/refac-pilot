import { useState, useEffect } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';
import { userSchema } from '@/schemas/userSchema';
import { logger } from '@/utils/logger';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('autoparts_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Validar con Zod para prevenir datos corruptos
        const validationResult = userSchema.safeParse(parsedUser);
        
        if (validationResult.success) {
          setCurrentUser(validationResult.data as User);
          logger.info('Usuario cargado desde localStorage', { userId: validationResult.data.id });
        } else {
          logger.warn('Usuario en localStorage tiene datos inválidos, limpiando...', validationResult.error.errors);
          localStorage.removeItem('autoparts_user');
        }
      } catch (error) {
        logger.error('Error al parsear usuario de localStorage', error);
        localStorage.removeItem('autoparts_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    // Mock login - in real app, this would be an API call
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('autoparts_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('autoparts_user');
    localStorage.removeItem('autoparts_warehouse');
  };

  const updateUserRole = (role: 'admin' | 'gerente' | 'cajero') => {
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      localStorage.setItem('autoparts_user', JSON.stringify(updatedUser));
    }
  };

  return {
    currentUser,
    isLoading,
    login,
    logout,
    updateUserRole,
    isAuthenticated: !!currentUser
  };
}