import { Case, CaseStatus, CaseType, PaginationParams, PaginationResult, CaseLog } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from './mock';
import { generateId, generateCaseNo, formatDate } from '@/utils';

export const caseService = {
  async getCases(params?: PaginationParams & { 
    status?: CaseStatus; 
    type?: CaseType;
    keyword?: string;
    lawyerId?: string;
    clientId?: string;
  }): Promise<PaginationResult<Case>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let cases = getFromStorage<Case[]>(STORAGE_KEYS.CASES, []);
        
        if (params?.status) {
          cases = cases.filter(c => c.status === params.status);
        }
        if (params?.type) {
          cases = cases.filter(c => c.type === params.type);
        }
        if (params?.lawyerId) {
          cases = cases.filter(c => c.lawyerId === params.lawyerId);
        }
        if (params?.clientId) {
          cases = cases.filter(c => c.clientId === params.clientId);
        }
        if (params?.keyword) {
          const kw = params.keyword.toLowerCase();
          cases = cases.filter(c => 
            c.name.toLowerCase().includes(kw) || 
            c.caseNo.toLowerCase().includes(kw) ||
            c.clientName.toLowerCase().includes(kw)
          );
        }

        cases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = cases.length;
        
        if (params?.page && params?.pageSize) {
          const start = (params.page - 1) * params.pageSize;
          cases = cases.slice(start, start + params.pageSize);
        }

        resolve({
          list: cases,
          total,
          page: params?.page || 1,
          pageSize: params?.pageSize || total,
        });
      }, 300);
    });
  },

  async getById(id: string): Promise<Case | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cases = getFromStorage<Case[]>(STORAGE_KEYS.CASES, []);
        const caseItem = cases.find(c => c.id === id);
        resolve(caseItem || null);
      }, 200);
    });
  },

  async create(data: Omit<Case, 'id' | 'caseNo' | 'createdAt' | 'status' | 'phase'> & { 
    status?: CaseStatus;
    phase?: string;
  }): Promise<Case> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cases = getFromStorage<Case[]>(STORAGE_KEYS.CASES, []);
        const newCase: Case = {
          ...data,
          id: generateId(),
          caseNo: generateCaseNo(),
          status: data.status || 'pending',
          phase: (data.phase || 'intake') as Case['phase'],
          createdAt: new Date().toISOString(),
        } as Case;
        cases.unshift(newCase);
        saveToStorage(STORAGE_KEYS.CASES, cases);
        
        this.addCaseLog(newCase.id, '创建案件', 'system', '系统', '创建新案件');
        
        resolve(newCase);
      }, 300);
    });
  },

  async update(id: string, data: Partial<Case>): Promise<Case | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cases = getFromStorage<Case[]>(STORAGE_KEYS.CASES, []);
        const index = cases.findIndex(c => c.id === id);
        if (index !== -1) {
          cases[index] = { ...cases[index], ...data };
          saveToStorage(STORAGE_KEYS.CASES, cases);
          resolve(cases[index]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  async checkConflict(clientName: string, oppositeParty: string): Promise<{ hasConflict: boolean; conflicts: string[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cases = getFromStorage<Case[]>(STORAGE_KEYS.CASES, []);
        const conflicts: string[] = [];
        
        cases.forEach(c => {
          if (c.clientName === oppositeParty) {
            conflicts.push(`对方当事人 ${oppositeParty} 曾作为我方客户委托案件：${c.name}`);
          }
          if (c.oppositeParty === clientName) {
            conflicts.push(`客户 ${clientName} 曾作为对方当事人出现在案件：${c.name}`);
          }
        });

        resolve({
          hasConflict: conflicts.length > 0,
          conflicts,
        });
      }, 500);
    });
  },

  async assignLawyer(caseId: string, lawyerId: string, lawyerName: string, partnerId?: string, partnerName?: string): Promise<Case | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cases = getFromStorage<Case[]>(STORAGE_KEYS.CASES, []);
        const index = cases.findIndex(c => c.id === caseId);
        if (index !== -1) {
          cases[index] = {
            ...cases[index],
            lawyerId,
            lawyerName,
            partnerId: partnerId || cases[index].partnerId,
            partnerName: partnerName || cases[index].partnerName,
            status: 'assigned',
            phase: 'pre_trial',
          };
          saveToStorage(STORAGE_KEYS.CASES, cases);
          this.addCaseLog(caseId, '分案', lawyerId, lawyerName, `分配承办律师：${lawyerName}`);
          resolve(cases[index]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  async closeCase(caseId: string): Promise<Case | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cases = getFromStorage<Case[]>(STORAGE_KEYS.CASES, []);
        const index = cases.findIndex(c => c.id === caseId);
        if (index !== -1) {
          cases[index] = {
            ...cases[index],
            status: 'closed',
            phase: 'closed',
            closeAt: new Date().toISOString(),
          };
          saveToStorage(STORAGE_KEYS.CASES, cases);
          this.addCaseLog(caseId, '结案', 'system', '系统', '案件已结案');
          resolve(cases[index]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  async getCaseLogs(caseId: string): Promise<CaseLog[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const logs = getFromStorage<CaseLog[]>(STORAGE_KEYS.CASE_LOGS, []);
        const caseLogs = logs.filter(l => l.caseId === caseId);
        caseLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(caseLogs);
      }, 200);
    });
  },

  async addCaseLog(caseId: string, action: string, operatorId: string, operatorName: string, detail: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const logs = getFromStorage<CaseLog[]>(STORAGE_KEYS.CASE_LOGS, []);
        logs.push({
          id: generateId(),
          caseId,
          action,
          operatorId,
          operatorName,
          detail,
          createdAt: new Date().toISOString(),
        });
        saveToStorage(STORAGE_KEYS.CASE_LOGS, logs);
        resolve();
      }, 100);
    });
  },

  async getStatistics(): Promise<{
    total: number;
    inProgress: number;
    pending: number;
    closed: number;
    thisMonth: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cases = getFromStorage<Case[]>(STORAGE_KEYS.CASES, []);
        const now = new Date();
        const thisMonth = cases.filter(c => {
          const d = new Date(c.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        resolve({
          total: cases.length,
          inProgress: cases.filter(c => ['in_progress', 'trial', 'judgment'].includes(c.status)).length,
          pending: cases.filter(c => ['pending', 'intake', 'accepted', 'assigned'].includes(c.status)).length,
          closed: cases.filter(c => c.status === 'closed' || c.status === 'archived').length,
          thisMonth,
        });
      }, 200);
    });
  },
};
