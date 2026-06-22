import { Document, DocumentStatus, DocVersion, PaginationParams, PaginationResult } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from './mock';
import { generateId } from '@/utils';

export const documentService = {
  async getDocuments(params?: PaginationParams & { 
    status?: DocumentStatus;
    type?: string;
    caseId?: string;
    keyword?: string;
  }): Promise<PaginationResult<Document>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let documents = getFromStorage<Document[]>(STORAGE_KEYS.DOCUMENTS, []);
        
        if (params?.status) {
          documents = documents.filter(d => d.status === params.status);
        }
        if (params?.type) {
          documents = documents.filter(d => d.type === params.type);
        }
        if (params?.caseId) {
          documents = documents.filter(d => d.caseId === params.caseId);
        }
        if (params?.keyword) {
          const kw = params.keyword.toLowerCase();
          documents = documents.filter(d => 
            d.title.toLowerCase().includes(kw) || 
            d.caseName?.toLowerCase().includes(kw)
          );
        }

        documents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        const total = documents.length;
        
        if (params?.page && params?.pageSize) {
          const start = (params.page - 1) * params.pageSize;
          documents = documents.slice(start, start + params.pageSize);
        }

        resolve({
          list: documents,
          total,
          page: params?.page || 1,
          pageSize: params?.pageSize || total,
        });
      }, 300);
    });
  },

  async getById(id: string): Promise<Document | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const documents = getFromStorage<Document[]>(STORAGE_KEYS.DOCUMENTS, []);
        const doc = documents.find(d => d.id === id);
        resolve(doc || null);
      }, 200);
    });
  },

  async getVersions(docId: string): Promise<DocVersion[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const versionsKey = `${STORAGE_KEYS.DOCUMENTS}_versions_${docId}`;
        const versions = getFromStorage<DocVersion[]>(versionsKey, []);
        versions.sort((a, b) => b.version - a.version);
        resolve(versions);
      }, 200);
    });
  },

  async create(data: Omit<Document, 'id' | 'currentVersion' | 'createdAt' | 'updatedAt' | 'status'> & { 
    status?: DocumentStatus;
    content?: string;
    editorId?: string;
    editorName?: string;
  }): Promise<Document> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const documents = getFromStorage<Document[]>(STORAGE_KEYS.DOCUMENTS, []);
        const now = new Date().toISOString();
        const newDoc: Document = {
          ...data,
          id: generateId(),
          currentVersion: 1,
          status: data.status || 'draft',
          createdAt: now,
          updatedAt: now,
        };
        documents.unshift(newDoc);
        saveToStorage(STORAGE_KEYS.DOCUMENTS, documents);

        if (data.content && data.editorId && data.editorName) {
          const versionsKey = `${STORAGE_KEYS.DOCUMENTS}_versions_${newDoc.id}`;
          const version: DocVersion = {
            id: generateId(),
            docId: newDoc.id,
            version: 1,
            content: data.content,
            editorId: data.editorId,
            editorName: data.editorName,
            editNote: '初始版本',
            createdAt: now,
          };
          saveToStorage(versionsKey, [version]);
        }

        resolve(newDoc);
      }, 300);
    });
  },

  async saveVersion(
    docId: string, 
    content: string, 
    editorId: string, 
    editorName: string, 
    editNote: string
  ): Promise<Document | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const documents = getFromStorage<Document[]>(STORAGE_KEYS.DOCUMENTS, []);
        const index = documents.findIndex(d => d.id === docId);
        if (index === -1) {
          resolve(null);
          return;
        }

        const currentVersion = documents[index].currentVersion + 1;
        const now = new Date().toISOString();
        
        documents[index] = {
          ...documents[index],
          currentVersion,
          content,
          updatedAt: now,
        };
        saveToStorage(STORAGE_KEYS.DOCUMENTS, documents);

        const versionsKey = `${STORAGE_KEYS.DOCUMENTS}_versions_${docId}`;
        const versions = getFromStorage<DocVersion[]>(versionsKey, []);
        versions.push({
          id: generateId(),
          docId,
          version: currentVersion,
          content,
          editorId,
          editorName,
          editNote,
          createdAt: now,
        });
        saveToStorage(versionsKey, versions);

        resolve(documents[index]);
      }, 300);
    });
  },

  async updateStatus(id: string, status: DocumentStatus): Promise<Document | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const documents = getFromStorage<Document[]>(STORAGE_KEYS.DOCUMENTS, []);
        const index = documents.findIndex(d => d.id === id);
        if (index !== -1) {
          documents[index] = {
            ...documents[index],
            status,
            updatedAt: new Date().toISOString(),
          };
          saveToStorage(STORAGE_KEYS.DOCUMENTS, documents);
          resolve(documents[index]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  async submitForReview(id: string): Promise<Document | null> {
    return this.updateStatus(id, 'reviewing');
  },

  async approve(id: string): Promise<Document | null> {
    return this.updateStatus(id, 'approved');
  },

  async reject(id: string): Promise<Document | null> {
    return this.updateStatus(id, 'rejected');
  },

  async getStatistics(): Promise<{
    total: number;
    draft: number;
    reviewing: number;
    approved: number;
    thisMonth: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const documents = getFromStorage<Document[]>(STORAGE_KEYS.DOCUMENTS, []);
        const now = new Date();
        const thisMonth = documents.filter(d => {
          const date = new Date(d.createdAt);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;

        resolve({
          total: documents.length,
          draft: documents.filter(d => d.status === 'draft').length,
          reviewing: documents.filter(d => d.status === 'reviewing').length,
          approved: documents.filter(d => d.status === 'approved').length,
          thisMonth,
        });
      }, 200);
    });
  },
};
