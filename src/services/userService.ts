import { User, UserRole, PaginationParams, PaginationResult } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from './mock';
import { generateId, formatDate } from '@/utils';

export const userService = {
  async login(name: string, _password: string): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.name === name);
        if (user && user.status === 'active') {
          resolve(user);
        } else {
          resolve(null);
        }
      }, 500);
    });
  },

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (userData) {
        resolve(JSON.parse(userData));
      } else {
        resolve(null);
      }
    });
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  clearCurrentUser(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  async getUsers(params?: PaginationParams & { role?: UserRole; keyword?: string }): Promise<PaginationResult<User>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
        
        if (params?.role) {
          users = users.filter(u => u.role === params.role);
        }
        if (params?.keyword) {
          const kw = params.keyword.toLowerCase();
          users = users.filter(u => 
            u.name.toLowerCase().includes(kw) || 
            u.phone.includes(kw)
          );
        }

        const total = users.length;
        
        if (params?.page && params?.pageSize) {
          const start = (params.page - 1) * params.pageSize;
          users = users.slice(start, start + params.pageSize);
        }

        resolve({
          list: users,
          total,
          page: params?.page || 1,
          pageSize: params?.pageSize || total,
        });
      }, 300);
    });
  },

  async getLawyers(): Promise<User[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
        const lawyers = users.filter(u => u.role === 'lawyer' || u.role === 'partner');
        resolve(lawyers);
      }, 200);
    });
  },

  async getById(id: string): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === id);
        resolve(user || null);
      }, 200);
    });
  },

  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
        const newUser: User = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        saveToStorage(STORAGE_KEYS.USERS, users);
        resolve(newUser);
      }, 300);
    });
  },

  async update(id: string, data: Partial<User>): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
          users[index] = { ...users[index], ...data };
          saveToStorage(STORAGE_KEYS.USERS, users);
          resolve(users[index]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  async delete(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
          users.splice(index, 1);
          saveToStorage(STORAGE_KEYS.USERS, users);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300);
    });
  },
};
