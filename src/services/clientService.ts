import { Client, PaginationParams, PaginationResult } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from './mock';
import { generateId } from '@/utils';

export const clientService = {
  async getClients(params?: PaginationParams & { 
    type?: 'individual' | 'enterprise';
    keyword?: string;
  }): Promise<PaginationResult<Client>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let clients = getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);
        
        if (params?.type) {
          clients = clients.filter(c => c.type === params.type);
        }
        if (params?.keyword) {
          const kw = params.keyword.toLowerCase();
          clients = clients.filter(c => 
            c.name.toLowerCase().includes(kw) || 
            c.phone.includes(kw) ||
            (c.contactPerson && c.contactPerson.toLowerCase().includes(kw))
          );
        }

        clients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = clients.length;
        
        if (params?.page && params?.pageSize) {
          const start = (params.page - 1) * params.pageSize;
          clients = clients.slice(start, start + params.pageSize);
        }

        resolve({
          list: clients,
          total,
          page: params?.page || 1,
          pageSize: params?.pageSize || total,
        });
      }, 300);
    });
  },

  async getById(id: string): Promise<Client | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const clients = getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);
        const client = clients.find(c => c.id === id);
        resolve(client || null);
      }, 200);
    });
  },

  async create(data: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const clients = getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);
        const newClient: Client = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        clients.unshift(newClient);
        saveToStorage(STORAGE_KEYS.CLIENTS, clients);
        resolve(newClient);
      }, 300);
    });
  },

  async update(id: string, data: Partial<Client>): Promise<Client | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const clients = getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);
        const index = clients.findIndex(c => c.id === id);
        if (index !== -1) {
          clients[index] = { ...clients[index], ...data };
          saveToStorage(STORAGE_KEYS.CLIENTS, clients);
          resolve(clients[index]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  async delete(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const clients = getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);
        const index = clients.findIndex(c => c.id === id);
        if (index !== -1) {
          clients.splice(index, 1);
          saveToStorage(STORAGE_KEYS.CLIENTS, clients);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300);
    });
  },

  async getStatistics(): Promise<{
    total: number;
    enterprise: number;
    individual: number;
    thisMonth: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const clients = getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);
        const now = new Date();
        const thisMonth = clients.filter(c => {
          const d = new Date(c.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        resolve({
          total: clients.length,
          enterprise: clients.filter(c => c.type === 'enterprise').length,
          individual: clients.filter(c => c.type === 'individual').length,
          thisMonth,
        });
      }, 200);
    });
  },
};
