import { Deadline, DeadlineType, DeadlineLevel, PaginationParams, PaginationResult } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from './mock';
import { generateId, calculateRemainingDays, getDeadlineLevel } from '@/utils';

export const deadlineService = {
  async getDeadlines(params?: PaginationParams & { 
    level?: DeadlineLevel;
    type?: DeadlineType;
    status?: 'pending' | 'completed';
    caseId?: string;
  }): Promise<PaginationResult<Deadline>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let deadlines = getFromStorage<Deadline[]>(STORAGE_KEYS.DEADLINES, []);
        
        deadlines = deadlines.map(d => ({
          ...d,
          remainingDays: calculateRemainingDays(d.deadline),
          level: getDeadlineLevel(calculateRemainingDays(d.deadline)),
        }));

        if (params?.level) {
          deadlines = deadlines.filter(d => d.level === params.level);
        }
        if (params?.type) {
          deadlines = deadlines.filter(d => d.type === params.type);
        }
        if (params?.status) {
          deadlines = deadlines.filter(d => d.status === params.status);
        }
        if (params?.caseId) {
          deadlines = deadlines.filter(d => d.caseId === params.caseId);
        }

        deadlines.sort((a, b) => a.remainingDays - b.remainingDays);

        const total = deadlines.length;
        
        if (params?.page && params?.pageSize) {
          const start = (params.page - 1) * params.pageSize;
          deadlines = deadlines.slice(start, start + params.pageSize);
        }

        resolve({
          list: deadlines,
          total,
          page: params?.page || 1,
          pageSize: params?.pageSize || total,
        });
      }, 300);
    });
  },

  async getById(id: string): Promise<Deadline | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deadlines = getFromStorage<Deadline[]>(STORAGE_KEYS.DEADLINES, []);
        const deadline = deadlines.find(d => d.id === id);
        if (deadline) {
          resolve({
            ...deadline,
            remainingDays: calculateRemainingDays(deadline.deadline),
            level: getDeadlineLevel(calculateRemainingDays(deadline.deadline)),
          });
        } else {
          resolve(null);
        }
      }, 200);
    });
  },

  async create(data: Omit<Deadline, 'id' | 'remainingDays' | 'level' | 'notifiedLawyer' | 'notifiedPartner' | 'notifiedDirector' | 'createdAt'>): Promise<Deadline> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deadlines = getFromStorage<Deadline[]>(STORAGE_KEYS.DEADLINES, []);
        const newDeadline: Deadline = {
          ...data,
          id: generateId(),
          remainingDays: calculateRemainingDays(data.deadline),
          level: getDeadlineLevel(calculateRemainingDays(data.deadline)),
          notifiedLawyer: false,
          notifiedPartner: false,
          notifiedDirector: false,
          createdAt: new Date().toISOString(),
        };
        deadlines.push(newDeadline);
        saveToStorage(STORAGE_KEYS.DEADLINES, deadlines);
        resolve(newDeadline);
      }, 300);
    });
  },

  async complete(id: string): Promise<Deadline | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deadlines = getFromStorage<Deadline[]>(STORAGE_KEYS.DEADLINES, []);
        const index = deadlines.findIndex(d => d.id === id);
        if (index !== -1) {
          deadlines[index] = { 
            ...deadlines[index], 
            status: 'completed',
          };
          saveToStorage(STORAGE_KEYS.DEADLINES, deadlines);
          resolve(deadlines[index]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  async getStatistics(): Promise<{
    total: number;
    normal: number;
    warning: number;
    urgent: number;
    overdue: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deadlines = getFromStorage<Deadline[]>(STORAGE_KEYS.DEADLINES, []);
        const pendingDeadlines = deadlines.filter(d => d.status === 'pending').map(d => ({
          ...d,
          level: getDeadlineLevel(calculateRemainingDays(d.deadline)),
        }));

        resolve({
          total: pendingDeadlines.length,
          normal: pendingDeadlines.filter(d => d.level === 'normal').length,
          warning: pendingDeadlines.filter(d => d.level === 'warning').length,
          urgent: pendingDeadlines.filter(d => d.level === 'urgent').length,
          overdue: pendingDeadlines.filter(d => d.level === 'overdue').length,
        });
      }, 200);
    });
  },

  async getUrgentDeadlines(limit: number = 5): Promise<Deadline[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let deadlines = getFromStorage<Deadline[]>(STORAGE_KEYS.DEADLINES, []);
        deadlines = deadlines
          .filter(d => d.status === 'pending')
          .map(d => ({
            ...d,
            remainingDays: calculateRemainingDays(d.deadline),
            level: getDeadlineLevel(calculateRemainingDays(d.deadline)),
          }))
          .sort((a, b) => a.remainingDays - b.remainingDays)
          .slice(0, limit);
        resolve(deadlines);
      }, 200);
    });
  },
};
