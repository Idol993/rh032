import { JudicialData, PaginationParams, PaginationResult } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from './mock';
import { generateId, formatDate } from '@/utils';

export type JudicialDataType = 'court_notice' | 'judgment' | 'service_notice' | 'case_progress';

export const judicialService = {
  async getJudicialData(params?: PaginationParams & { 
    type?: JudicialDataType;
    court?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginationResult<JudicialData>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = getFromStorage<JudicialData[]>(STORAGE_KEYS.JUDICIAL_DATA, []);
        
        if (params?.type) {
          data = data.filter(item => item.type === params.type);
        }
        if (params?.court) {
          data = data.filter(item => item.court.includes(params.court!));
        }
        if (params?.keyword) {
          const kw = params.keyword.toLowerCase();
          data = data.filter(item => 
            item.title.toLowerCase().includes(kw) || 
            (item.caseNo && item.caseNo.toLowerCase().includes(kw)) ||
            (item.parties && item.parties.toLowerCase().includes(kw)) ||
            item.court.toLowerCase().includes(kw)
          );
        }
        if (params?.startDate) {
          data = data.filter(item => item.date >= params.startDate!);
        }
        if (params?.endDate) {
          data = data.filter(item => item.date <= params.endDate!);
        }

        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const total = data.length;
        
        if (params?.page && params?.pageSize) {
          const start = (params.page - 1) * params.pageSize;
          data = data.slice(start, start + params.pageSize);
        }

        resolve({
          list: data,
          total,
          page: params?.page || 1,
          pageSize: params?.pageSize || total,
        });
      }, 300);
    });
  },

  async getById(id: string): Promise<JudicialData | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = getFromStorage<JudicialData[]>(STORAGE_KEYS.JUDICIAL_DATA, []);
        const item = data.find(d => d.id === id);
        resolve(item || null);
      }, 200);
    });
  },

  async syncData(): Promise<{ newCount: number; totalCount: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingData = getFromStorage<JudicialData[]>(STORAGE_KEYS.JUDICIAL_DATA, []);
        
        const newItems: JudicialData[] = [
          {
            id: generateId(),
            type: 'court_notice',
            title: '上海鼎盛贸易有限公司股权纠纷案开庭公告',
            court: '上海市浦东新区人民法院',
            caseNo: '(2024)沪0115民初8765号',
            parties: '原告：上海鼎盛贸易有限公司；被告：某投资控股公司',
            date: formatDate(new Date()),
            content: '定于近日在本院第五法庭公开开庭审理原告上海鼎盛贸易有限公司与被告某投资控股公司股权转让纠纷一案。',
            source: '中国审判流程信息公开网',
            syncAt: formatDate(new Date()),
          },
          {
            id: generateId(),
            type: 'case_progress',
            title: '北京宏达科技有限公司买卖合同纠纷案件进展',
            court: '北京市朝阳区人民法院',
            caseNo: '(2024)京0105民初12345号',
            parties: '原告：北京宏达科技有限公司；被告：天津某建材公司',
            date: formatDate(new Date()),
            content: '案件已完成证据交换，定于近期安排开庭审理。',
            source: '中国审判流程信息公开网',
            syncAt: formatDate(new Date()),
          },
        ];

        const updatedData = [...newItems, ...existingData];
        saveToStorage(STORAGE_KEYS.JUDICIAL_DATA, updatedData);
        
        resolve({
          newCount: newItems.length,
          totalCount: updatedData.length,
        });
      }, 1500);
    });
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async syncToCase(judicialId: string, caseId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  },
};
