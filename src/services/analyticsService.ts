import { Case, User, Client, Deadline, RiskTicket, Payment } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage } from './mock';

export interface AnalyticsOverview {
  activeCases: number;
  newThisMonth: number;
  closedCases: number;
  winRate: number;
  totalRevenue: number;
  pendingAmount: number;
}

export interface CaseTypeItem {
  name: string;
  value: number;
}

export interface LawyerRankItem {
  name: string;
  value: number;
  department: string;
}

export interface MonthlyTrendItem {
  month: string;
  intake: number;
  closed: number;
}

export interface CauseDistributionItem {
  name: string;
  value: number;
}

export interface ClientTypeItem {
  name: string;
  value: number;
}

export interface DeadlineStats {
  normal: number;
  warning: number;
  urgent: number;
  overdue: number;
}

export interface RiskStats {
  critical: number;
  high: number;
  medium: number;
  low: number;
  pending: number;
  processing: number;
  resolved: number;
}

export interface SatisfactionData {
  verySatisfied: number;
  satisfied: number;
  neutral: number;
  dissatisfied: number;
  overall: number;
}

const caseTypeLabels: Record<string, string> = {
  civil: '民事案件',
  criminal: '刑事案件',
  administrative: '行政案件',
  commercial: '商事案件',
  labor: '劳动争议',
  other: '其他案件',
};

const clientTypeLabels: Record<string, string> = {
  enterprise: '企业客户',
  individual: '个人客户',
  government: '政府机构',
};

export const analyticsService = {
  async getOverview(): Promise<AnalyticsOverview> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cases = getFromStorage<Case[]>(STORAGE_KEYS.CASES, []);
        const payments = getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
        const now = new Date();

        const thisMonthCases = cases.filter((c) => {
          const d = new Date(c.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const closedCases = cases.filter((c) => c.status === 'closed' || c.status === 'archived');
        const totalRevenue = payments.reduce((sum, p) => sum + p.paidAmount, 0);
        const pendingAmount = payments.reduce((sum, p) => sum + (p.amount - p.paidAmount), 0);

        const mockWinRate = 78.5;

        resolve({
          activeCases: cases.filter((c) => ['in_progress', 'trial', 'judgment', 'pending', 'intake', 'accepted', 'assigned'].includes(c.status)).length,
          newThisMonth: thisMonthCases.length,
          closedCases: closedCases.length,
          winRate: mockWinRate,
          totalRevenue,
          pendingAmount,
        });
      }, 300);
    });
  },

  async getCaseTypeDistribution(): Promise<CaseTypeItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cases = getFromStorage<Case[]>(STORAGE_KEYS.CASES, []);
        const typeCount: Record<string, number> = {};

        cases.forEach((c) => {
          const label = caseTypeLabels[c.type] || c.type;
          typeCount[label] = (typeCount[label] || 0) + 1;
        });

        const result = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
        resolve(result.sort((a, b) => b.value - a.value));
      }, 200);
    });
  },

  async getLawyerRanking(topN = 10): Promise<LawyerRankItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cases = getFromStorage<Case[]>(STORAGE_KEYS.CASES, []);
        const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
        const lawyerCaseCount: Record<string, number> = {};

        cases.forEach((c) => {
          if (c.lawyerId) {
            lawyerCaseCount[c.lawyerId] = (lawyerCaseCount[c.lawyerId] || 0) + 1;
          }
        });

        const result: LawyerRankItem[] = Object.entries(lawyerCaseCount)
          .map(([id, value]) => {
            const user = users.find((u) => u.id === id);
            return {
              name: user?.name || id,
              value,
              department: user?.department || '未知部门',
            };
          })
          .sort((a, b) => b.value - a.value)
          .slice(0, topN);

        resolve(result);
      }, 200);
    });
  },

  async getMonthlyTrend(months = 12): Promise<MonthlyTrendItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cases = getFromStorage<Case[]>(STORAGE_KEYS.CASES, []);
        const result: MonthlyTrendItem[] = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthLabel = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

          const intakeCount = cases.filter((c) => {
            const cd = new Date(c.createdAt);
            return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
          }).length;

          const closedCount = cases.filter((c) => {
            if (!c.closeAt) return false;
            const cd = new Date(c.closeAt);
            return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
          }).length;

          result.push({
            month: monthLabel,
            intake: intakeCount + Math.floor(Math.random() * 5),
            closed: closedCount + Math.floor(Math.random() * 3),
          });
        }

        resolve(result);
      }, 200);
    });
  },

  async getCauseDistribution(): Promise<CauseDistributionItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cases = getFromStorage<Case[]>(STORAGE_KEYS.CASES, []);
        const causeCount: Record<string, number> = {};

        cases.forEach((c) => {
          const cause = c.cause || '其他';
          causeCount[cause] = (causeCount[cause] || 0) + 1;
        });

        const result = Object.entries(causeCount).map(([name, value]) => ({ name, value }));
        resolve(result.sort((a, b) => b.value - a.value));
      }, 200);
    });
  },

  async getClientTypeDistribution(): Promise<ClientTypeItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const clients = getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);
        const typeCount: Record<string, number> = {};

        clients.forEach((c) => {
          const label = clientTypeLabels[c.type] || c.type;
          typeCount[label] = (typeCount[label] || 0) + 1;
        });

        const result = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
        resolve(result.sort((a, b) => b.value - a.value));
      }, 200);
    });
  },

  async getDeadlineStats(): Promise<DeadlineStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deadlines = getFromStorage<Deadline[]>(STORAGE_KEYS.DEADLINES, []);

        resolve({
          normal: deadlines.filter((d) => d.level === 'normal').length,
          warning: deadlines.filter((d) => d.level === 'warning').length,
          urgent: deadlines.filter((d) => d.level === 'urgent').length,
          overdue: deadlines.filter((d) => d.level === 'overdue').length,
        });
      }, 200);
    });
  },

  async getRiskStats(): Promise<RiskStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tickets = getFromStorage<RiskTicket[]>(STORAGE_KEYS.RISK_TICKETS, []);

        resolve({
          critical: tickets.filter((t) => t.level === 'critical').length,
          high: tickets.filter((t) => t.level === 'high').length,
          medium: tickets.filter((t) => t.level === 'medium').length,
          low: tickets.filter((t) => t.level === 'low').length,
          pending: tickets.filter((t) => t.status === 'pending').length,
          processing: tickets.filter((t) => t.status === 'processing').length,
          resolved: tickets.filter((t) => t.status === 'resolved').length,
        });
      }, 200);
    });
  },

  async getSatisfactionData(): Promise<SatisfactionData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          verySatisfied: 68,
          satisfied: 52,
          neutral: 15,
          dissatisfied: 5,
          overall: 92.3,
        });
      }, 200);
    });
  },
};
