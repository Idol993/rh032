import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Building2, 
  Calendar, 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Download,
  Filter,
  Gavel,
  Bell,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { JudicialData } from '@/types';
import { judicialService, JudicialDataType } from '@/services/judicialService';
import { COURT_LIST } from '@/constants';
import { formatDate, cn } from '@/utils';

const TAB_LIST: { key: JudicialDataType | 'all'; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: '全部', icon: <FileText className="w-4 h-4" /> },
  { key: 'court_notice', label: '开庭公告', icon: <Gavel className="w-4 h-4" /> },
  { key: 'judgment', label: '裁判文书', icon: <FileText className="w-4 h-4" /> },
  { key: 'service_notice', label: '送达公告', icon: <Bell className="w-4 h-4" /> },
  { key: 'case_progress', label: '案件流程', icon: <FolderKanban className="w-4 h-4" /> },
];

const TYPE_LABEL_MAP: Record<string, string> = {
  court_notice: '开庭公告',
  judgment: '裁判文书',
  service_notice: '送达公告',
  case_progress: '案件流程',
};

const TYPE_BADGE_MAP: Record<string, string> = {
  court_notice: 'badge-primary',
  judgment: 'badge-danger',
  service_notice: 'badge-warning',
  case_progress: 'badge-success',
};

const JudicialDataPage: React.FC = () => {
  const [dataList, setDataList] = useState<JudicialData[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [activeTab, setActiveTab] = useState<JudicialDataType | 'all'>('all');
  const [courtFilter, setCourtFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedItem, setSelectedItem] = useState<JudicialData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await judicialService.getJudicialData({
        page,
        pageSize,
        type: activeTab === 'all' ? undefined : activeTab,
        court: courtFilter || undefined,
        keyword: keyword || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setDataList(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('获取司法数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeTab, courtFilter, keyword, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleReset = () => {
    setCourtFilter('');
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleTabChange = (tab: JudicialDataType | 'all') => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const result = await judicialService.syncData();
      setSyncMessage({
        type: 'success',
        text: `同步成功！新增 ${result.newCount} 条数据，当前共 ${result.totalCount} 条记录`,
      });
      fetchData();
    } catch {
      setSyncMessage({
        type: 'error',
        text: '同步失败，请稍后重试',
      });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const handleViewDetail = (item: JudicialData) => {
    setSelectedItem(item);
  };

  const handleSyncToCase = (item: JudicialData) => {
    alert(`即将将"${item.title}"同步到案件...`);
  };

  const totalPages = Math.ceil(total / pageSize);

  const renderPagination = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title text-primary-700">司法数据</h1>
          <p className="text-sm text-neutral-500 mt-1">汇聚公开司法数据，智能匹配关联案件</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn-primary flex items-center gap-2"
        >
          {syncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {syncing ? '同步中...' : '同步数据'}
        </button>
      </div>

      {syncMessage && (
        <div className={cn(
          "mb-4 p-4 rounded-lg flex items-center gap-3 animate-fade-in",
          syncMessage.type === 'success' 
            ? "bg-success-50 border border-success-200 text-success-700" 
            : "bg-danger-50 border border-danger-200 text-danger-700"
        )}>
          {syncMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{syncMessage.text}</span>
        </div>
      )}

      <div className="card mb-6 p-0 overflow-hidden">
        <div className="flex border-b border-neutral-200">
          {TAB_LIST.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.key
                  ? "text-primary-600 border-primary-500 bg-primary-50/50"
                  : "text-neutral-500 border-transparent hover:text-neutral-700 hover:bg-neutral-50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-neutral-700">筛选条件</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label-text">法院</label>
            <select
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className="select-field"
            >
              <option value="">全部法院</option>
              {COURT_LIST.map((court) => (
                <option key={court} value={court}>{court}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">关键词搜索</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="标题、案号、当事人"
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label-text">开始日期</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label-text">结束日期</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <button onClick={handleSearch} className="btn-primary whitespace-nowrap">
                搜索
              </button>
              <button onClick={handleReset} className="btn-secondary flex items-center gap-1 whitespace-nowrap">
                <RefreshCw className="w-4 h-4" />
                重置
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-neutral-500">
            共 <span className="font-medium text-primary-600">{total}</span> 条记录
          </div>
          <div className="text-xs text-neutral-400">
            数据来源：中国裁判文书网、审判流程信息公开网、人民法院公告网
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <span className="text-sm text-neutral-500">加载中...</span>
          </div>
        ) : dataList.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <FileText className="w-12 h-12 text-neutral-300" />
            <span className="text-sm text-neutral-500">暂无司法数据</span>
            <button onClick={handleSync} className="btn-secondary mt-2">
              <RefreshCw className="w-4 h-4" />
              立即同步
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {dataList.map((item) => (
              <div
                key={item.id}
                className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn("badge", TYPE_BADGE_MAP[item.type])}>
                        {TYPE_LABEL_MAP[item.type]}
                      </span>
                      <h3 className="text-base font-medium text-neutral-800 hover:text-primary-600 cursor-pointer truncate"
                          onClick={() => handleViewDetail(item)}>
                        {item.title}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Building2 className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span className="truncate">{item.court}</span>
                      </div>
                      {item.caseNo && (
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          <span className="truncate font-mono text-primary-600">{item.caseNo}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Calendar className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span>{formatDate(item.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Download className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span className="truncate">{item.source}</span>
                      </div>
                    </div>

                    {item.parties && (
                      <div className="text-sm text-neutral-600 mb-2 line-clamp-1">
                        <span className="text-neutral-400">当事人：</span>
                        {item.parties}
                      </div>
                    )}

                    <p className="text-sm text-neutral-500 line-clamp-2">
                      {item.content}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleViewDetail(item)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      查看详情
                    </button>
                    <button
                      onClick={() => handleSyncToCase(item)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-success-600 hover:bg-success-50 rounded-md transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      同步到案件
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 0 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-200">
            <div className="text-sm text-neutral-500">
              第 {page} / {totalPages} 页，共 {total} 条记录
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  page === 1 
                    ? "text-neutral-300 cursor-not-allowed" 
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {renderPagination().map((p, index) => (
                <button
                  key={index}
                  onClick={() => typeof p === 'number' && setPage(p)}
                  disabled={p === '...'}
                  className={cn(
                    "min-w-8 h-8 px-2 rounded-md text-sm transition-colors",
                    p === page
                      ? "bg-primary-500 text-white font-medium"
                      : p === '...'
                        ? "text-neutral-400 cursor-default"
                        : "text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  {p}
                </button>
              ))}
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  page === totalPages 
                    ? "text-neutral-300 cursor-not-allowed" 
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-primary-50">
              <div className="flex items-center gap-3">
                <span className={cn("badge", TYPE_BADGE_MAP[selectedItem.type])}>
                  {TYPE_LABEL_MAP[selectedItem.type]}
                </span>
                <h2 className="text-lg font-semibold text-neutral-800">{selectedItem.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-neutral-500">法院</label>
                    <p className="text-sm text-neutral-700 font-medium mt-1">{selectedItem.court}</p>
                  </div>
                  {selectedItem.caseNo && (
                    <div>
                      <label className="text-sm text-neutral-500">案号</label>
                      <p className="text-sm text-primary-600 font-mono font-medium mt-1">{selectedItem.caseNo}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm text-neutral-500">日期</label>
                  <p className="text-sm text-neutral-700 mt-1">{formatDate(selectedItem.date)}</p>
                </div>
                {selectedItem.parties && (
                  <div>
                    <label className="text-sm text-neutral-500">当事人</label>
                    <p className="text-sm text-neutral-700 mt-1">{selectedItem.parties}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-neutral-500">数据来源</label>
                  <p className="text-sm text-neutral-700 mt-1">{selectedItem.source}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-500">内容</label>
                  <div className="mt-2 p-4 bg-neutral-50 rounded-lg text-sm text-neutral-700 leading-relaxed">
                    {selectedItem.content}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="btn-secondary"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  handleSyncToCase(selectedItem);
                  setSelectedItem(null);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                同步到案件
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JudicialDataPage;
