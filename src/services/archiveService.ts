import { Archive, PaginationParams, PaginationResult } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from './mock';
import { generateId, formatDate } from '@/utils';
import type { ArchiveStatus } from '@/constants';

export const archiveService = {
  async getArchives(params?: PaginationParams & { 
    status?: ArchiveStatus; 
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginationResult<Archive>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let archives = getFromStorage<Archive[]>(STORAGE_KEYS.ARCHIVES, []);
        
        if (params?.status) {
          archives = archives.filter(a => a.status === params.status);
        }
        if (params?.keyword) {
          const kw = params.keyword.toLowerCase();
          archives = archives.filter(a => 
            (a.caseName && a.caseName.toLowerCase().includes(kw)) || 
            a.archiveNo.toLowerCase().includes(kw) ||
            (a.location && a.location.toLowerCase().includes(kw))
          );
        }
        if (params?.startDate) {
          archives = archives.filter(a => 
            a.archiveAt && new Date(a.archiveAt) >= new Date(params.startDate!)
          );
        }
        if (params?.endDate) {
          archives = archives.filter(a => 
            a.archiveAt && new Date(a.archiveAt) <= new Date(params.endDate!)
          );
        }

        archives.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = archives.length;
        
        if (params?.page && params?.pageSize) {
          const start = (params.page - 1) * params.pageSize;
          archives = archives.slice(start, start + params.pageSize);
        }

        resolve({
          list: archives,
          total,
          page: params?.page || 1,
          pageSize: params?.pageSize || total,
        });
      }, 300);
    });
  },

  async getById(id: string): Promise<Archive | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const archives = getFromStorage<Archive[]>(STORAGE_KEYS.ARCHIVES, []);
        const archive = archives.find(a => a.id === id);
        resolve(archive || null);
      }, 200);
    });
  },

  async create(data: Omit<Archive, 'id' | 'createdAt' | 'status'> & { 
    status?: ArchiveStatus;
  }): Promise<Archive> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const archives = getFromStorage<Archive[]>(STORAGE_KEYS.ARCHIVES, []);
        const newArchive: Archive = {
          ...data,
          id: generateId(),
          status: data.status || 'pending',
          createdAt: new Date().toISOString(),
        } as Archive;
        archives.unshift(newArchive);
        saveToStorage(STORAGE_KEYS.ARCHIVES, archives);
        resolve(newArchive);
      }, 300);
    });
  },

  async update(id: string, data: Partial<Archive>): Promise<Archive | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const archives = getFromStorage<Archive[]>(STORAGE_KEYS.ARCHIVES, []);
        const index = archives.findIndex(a => a.id === id);
        if (index !== -1) {
          archives[index] = { ...archives[index], ...data };
          saveToStorage(STORAGE_KEYS.ARCHIVES, archives);
          resolve(archives[index]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  async delete(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const archives = getFromStorage<Archive[]>(STORAGE_KEYS.ARCHIVES, []);
        const filtered = archives.filter(a => a.id !== id);
        saveToStorage(STORAGE_KEYS.ARCHIVES, filtered);
        resolve(filtered.length < archives.length);
      }, 200);
    });
  },

  async getStatistics(): Promise<{
    total: number;
    archived: number;
    pending: number;
    borrowed: number;
    thisYear: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const archives = getFromStorage<Archive[]>(STORAGE_KEYS.ARCHIVES, []);
        const now = new Date();
        const thisYear = archives.filter(a => {
          const d = new Date(a.createdAt);
          return d.getFullYear() === now.getFullYear();
        }).length;

        resolve({
          total: archives.length,
          archived: archives.filter(a => a.status === 'archived').length,
          pending: archives.filter(a => a.status === 'pending').length,
          borrowed: archives.filter(a => a.status === 'borrowed').length,
          thisYear,
        });
      }, 200);
    });
  },
};
