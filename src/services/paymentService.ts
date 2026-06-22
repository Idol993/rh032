import { Payment, PaymentStatus, PaymentType, PaginationParams, PaginationResult } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from './mock';
import { generateId, generateInvoiceNo } from '@/utils';

export const paymentService = {
  async getPayments(params?: PaginationParams & { 
    status?: PaymentStatus;
    type?: PaymentType;
    caseId?: string;
    keyword?: string;
  }): Promise<PaginationResult<Payment>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let payments = getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
        
        if (params?.status) {
          payments = payments.filter(p => p.status === params.status);
        }
        if (params?.type) {
          payments = payments.filter(p => p.type === params.type);
        }
        if (params?.caseId) {
          payments = payments.filter(p => p.caseId === params.caseId);
        }
        if (params?.keyword) {
          const kw = params.keyword.toLowerCase();
          payments = payments.filter(p => 
            p.caseName.toLowerCase().includes(kw) || 
            p.clientName.toLowerCase().includes(kw)
          );
        }

        payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = payments.length;
        
        if (params?.page && params?.pageSize) {
          const start = (params.page - 1) * params.pageSize;
          payments = payments.slice(start, start + params.pageSize);
        }

        resolve({
          list: payments,
          total,
          page: params?.page || 1,
          pageSize: params?.pageSize || total,
        });
      }, 300);
    });
  },

  async getById(id: string): Promise<Payment | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payments = getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
        const payment = payments.find(p => p.id === id);
        resolve(payment || null);
      }, 200);
    });
  },

  async create(data: Omit<Payment, 'id' | 'invoiceStatus' | 'createdAt'> & { invoiceStatus?: string }): Promise<Payment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payments = getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
        const newPayment: Payment = {
          ...data,
          id: generateId(),
          invoiceStatus: (data.invoiceStatus || 'none') as Payment['invoiceStatus'],
          createdAt: new Date().toISOString(),
        } as Payment;
        payments.unshift(newPayment);
        saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
        resolve(newPayment);
      }, 300);
    });
  },

  async update(id: string, data: Partial<Payment>): Promise<Payment | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payments = getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
        const index = payments.findIndex(p => p.id === id);
        if (index !== -1) {
          payments[index] = { ...payments[index], ...data };
          saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
          resolve(payments[index]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  async issueInvoice(id: string): Promise<Payment | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payments = getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
        const index = payments.findIndex(p => p.id === id);
        if (index !== -1) {
          payments[index] = {
            ...payments[index],
            invoiceNo: generateInvoiceNo(),
            invoiceStatus: 'issued',
          };
          saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
          resolve(payments[index]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  async getStatistics(): Promise<{
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    count: number;
    thisMonth: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payments = getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
        const now = new Date();
        const thisMonth = payments.filter(p => {
          const d = new Date(p.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        resolve({
          totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
          paidAmount: payments.reduce((sum, p) => sum + p.paidAmount, 0),
          unpaidAmount: payments.reduce((sum, p) => sum + (p.amount - p.paidAmount), 0),
          count: payments.length,
          thisMonth: thisMonth.reduce((sum, p) => sum + p.paidAmount, 0),
        });
      }, 200);
    });
  },
};
