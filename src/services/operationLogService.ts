import { OperationLog, PaginationParams, PaginationResult } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from './mock';
import { generateId } from '@/utils';

export const operationLogService = {
  async getLogs(params?: PaginationParams & { 
    module?: string;
    action?: string;
    userId?: string;
    keyword?: string;
  }): Promise<PaginationResult<OperationLog>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let logs = getFromStorage<OperationLog[]>(STORAGE_KEYS.OPERATION_LOGS, []);
        
        if (params?.module) {
          logs = logs.filter(l => l.module === params.module);
        }
        if (params?.action) {
          logs = logs.filter(l => l.action === params.action);
        }
        if (params?.userId) {
          logs = logs.filter(l => l.userId === params.userId);
        }
        if (params?.keyword) {
          const kw = params.keyword.toLowerCase();
          logs = logs.filter(l => 
            l.userName.toLowerCase().includes(kw) || 
            l.targetName.toLowerCase().includes(kw) ||
            l.detail.toLowerCase().includes(kw)
          );
        }

        logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = logs.length;
        
        if (params?.page && params?.pageSize) {
          const start = (params.page - 1) * params.pageSize;
          logs = logs.slice(start, start + params.pageSize);
        }

        resolve({
          list: logs,
          total,
          page: params?.page || 1,
          pageSize: params?.pageSize || total,
        });
      }, 300);
    });
  },

  async addLog(data: Omit<OperationLog, 'id' | 'createdAt'>): Promise<OperationLog> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const logs = getFromStorage<OperationLog[]>(STORAGE_KEYS.OPERATION_LOGS, []);
        const newLog: OperationLog = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        logs.unshift(newLog);
        saveToStorage(STORAGE_KEYS.OPERATION_LOGS, logs);
        resolve(newLog);
      }, 100);
    });
  },
};
