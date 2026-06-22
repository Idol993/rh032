import { RiskTicket, RiskLevel, RiskStatus, PaginationParams, PaginationResult } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from './mock';
import { generateId } from '@/utils';

export const riskTicketService = {
  async getTickets(params?: PaginationParams & { 
    level?: RiskLevel;
    status?: RiskStatus;
    type?: string;
    caseId?: string;
  }): Promise<PaginationResult<RiskTicket>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let tickets = getFromStorage<RiskTicket[]>(STORAGE_KEYS.RISK_TICKETS, []);
        
        if (params?.level) {
          tickets = tickets.filter(t => t.level === params.level);
        }
        if (params?.status) {
          tickets = tickets.filter(t => t.status === params.status);
        }
        if (params?.type) {
          tickets = tickets.filter(t => t.type === params.type);
        }
        if (params?.caseId) {
          tickets = tickets.filter(t => t.caseId === params.caseId);
        }

        tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = tickets.length;
        
        if (params?.page && params?.pageSize) {
          const start = (params.page - 1) * params.pageSize;
          tickets = tickets.slice(start, start + params.pageSize);
        }

        resolve({
          list: tickets,
          total,
          page: params?.page || 1,
          pageSize: params?.pageSize || total,
        });
      }, 300);
    });
  },

  async getById(id: string): Promise<RiskTicket | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tickets = getFromStorage<RiskTicket[]>(STORAGE_KEYS.RISK_TICKETS, []);
        const ticket = tickets.find(t => t.id === id);
        resolve(ticket || null);
      }, 200);
    });
  },

  async create(data: Omit<RiskTicket, 'id' | 'status' | 'createdAt'> & { status?: RiskStatus }): Promise<RiskTicket> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tickets = getFromStorage<RiskTicket[]>(STORAGE_KEYS.RISK_TICKETS, []);
        const newTicket: RiskTicket = {
          ...data,
          id: generateId(),
          status: data.status || 'pending',
          createdAt: new Date().toISOString(),
        };
        tickets.unshift(newTicket);
        saveToStorage(STORAGE_KEYS.RISK_TICKETS, tickets);
        resolve(newTicket);
      }, 300);
    });
  },

  async update(id: string, data: Partial<RiskTicket>): Promise<RiskTicket | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tickets = getFromStorage<RiskTicket[]>(STORAGE_KEYS.RISK_TICKETS, []);
        const index = tickets.findIndex(t => t.id === id);
        if (index !== -1) {
          tickets[index] = { ...tickets[index], ...data };
          if (data.status === 'closed' || data.status === 'resolved') {
            tickets[index].closeAt = new Date().toISOString();
          }
          saveToStorage(STORAGE_KEYS.RISK_TICKETS, tickets);
          resolve(tickets[index]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  async handleTicket(id: string, handlerId: string, handlerName: string): Promise<RiskTicket | null> {
    return this.update(id, {
      status: 'processing',
      handlerId,
      handlerName,
    });
  },

  async resolveTicket(id: string, result: string): Promise<RiskTicket | null> {
    return this.update(id, {
      status: 'resolved',
      result,
      closeAt: new Date().toISOString(),
    });
  },

  async closeTicket(id: string): Promise<RiskTicket | null> {
    return this.update(id, {
      status: 'closed',
      closeAt: new Date().toISOString(),
    });
  },

  async getStatistics(): Promise<{
    total: number;
    pending: number;
    processing: number;
    resolved: number;
    high: number;
    critical: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tickets = getFromStorage<RiskTicket[]>(STORAGE_KEYS.RISK_TICKETS, []);
        
        resolve({
          total: tickets.length,
          pending: tickets.filter(t => t.status === 'pending').length,
          processing: tickets.filter(t => t.status === 'processing').length,
          resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
          high: tickets.filter(t => t.level === 'high').length,
          critical: tickets.filter(t => t.level === 'critical').length,
        });
      }, 200);
    });
  },
};
