import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Download, 
  FileText,
  FolderOpen,
  Archive as ArchiveIcon,
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Calendar,
  MapPin,
  Building2,
  Clock,
  BookOpen
} from 'lucide-react';
import { Archive as ArchiveType, CaseType } from '@/types';
import { archiveService } from '@/services/archiveService';
import { ARCHIVE_STATUS_MAP, CASE_TYPE_MAP } from '@/constants';
import { formatDate, cn } from '@/utils';
import type { ArchiveStatus } from '@/constants';

const Archive: React.FC = () => {
  const [archives, setArchives] = useState<ArchiveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [activeTab, setActiveTab] = useState<ArchiveStatus | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [statistics, setStatistics] = useState({
    total: 0,
    archived: 0,
    pending: 0,
    borrowed: 0,
    thisYear: 0,
  });

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const result = await archiveService.getArchives({
        page,
        pageSize,
        status: activeTab === 'all' ? undefined : activeTab,
        keyword: keyword || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setArchives(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('获取卷宗列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await archiveService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  useEffect(() => {
    fetchArchives();
    fetchStatistics();
  }, [page, activeTab]);

  const handleSearch = () => {
    setPage(1);
    fetchArchives();
  };

  const handleReset = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setActiveTab('all');
  };

  const handleTabChange = (tab: ArchiveStatus | 'all') => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleView = (id: string) => {
    console.log('查看详情:', id);
  };

  const handleBorrow = (id: string) => {
    console.log('借阅申请:', id);
  };

  const handleDownload = (id: string) => {
    console.log('下载电子卷:', id);
  };

  const handleNewArchive = () => {
    console.log('归档申请');
  };

  const totalPages = Math.ceil(total / pageSize);

  const getBadgeClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'badge-primary': 'badge badge-primary',
      'badge-success': 'badge badge-success',
      'badge-warning': 'badge badge-warning',
      'badge-danger': 'badge badge-danger',
      'badge-neutral': 'badge badge-neutral',
    };
    return colorMap[color] || 'badge badge-neutral';
  };

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

  const statCards = [
    {
      label: '已归档卷宗',
      value: statistics.archived,
      icon: ArchiveIcon,
      color: 'text-success-500',
      bgColor: 'bg-success-50',
    },
    {
      label: '待归档案件',
      value: statistics.pending,
      icon: Clock,
      color: 'text-warning-500',
      bgColor: 'bg-warning-50',
    },
    {
      label: '本年归档数',
      value: statistics.thisYear,
      icon: Calendar,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      label: '档案借阅中',
      value: statistics.borrowed,
      icon: BookOpen,
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
    },
  ];

  const tabs = [
    { key: 'all' as const, label: '全部卷宗' },
    { key: 'archived' as const, label: '已归档' },
    { key: 'pending' as const, label: '待归档' },
    { key: 'borrowed' as const, label: '借阅中' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">卷宗管理</h1>
          <p className="text-sm text-neutral-500 mt-1">管理律所所有案件卷宗，支持归档、借阅、查询等操作</p>
        </div>
        <button
          onClick={handleNewArchive}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          归档申请
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="stat-card flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", stat.bgColor)}>
                <IconComponent className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-1 border-b border-neutral-200 -mx-4 -mt-4 px-4 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-colors relative",
                activeTab === tab.key
                  ? "text-primary-600"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label className="label-text">关键词搜索</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="输入档案编号、案件名称或客户名称搜索"
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <label className="label-text">归档日期开始</label>
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
          <div className="md:col-span-2">
            <label className="label-text">归档日期结束</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="md:col-span-2 flex items-end gap-2">
            <button onClick={handleSearch} className="btn-primary flex-1">
              搜索
            </button>
            <button onClick={handleReset} className="btn-secondary flex items-center gap-1">
              <RefreshCw className="w-4 h-4" />
              重置
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-neutral-500">
            共 <span className="font-medium text-primary-600">{total}</span> 条记录
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left font-medium">档案编号</th>
                <th className="px-4 py-3 text-left font-medium">案件名称</th>
                <th className="px-4 py-3 text-left font-medium">案件类型</th>
                <th className="px-4 py-3 text-left font-medium">客户名称</th>
                <th className="px-4 py-3 text-center font-medium">归档状态</th>
                <th className="px-4 py-3 text-left font-medium">归档日期</th>
                <th className="px-4 py-3 text-left font-medium">存放位置</th>
                <th className="px-4 py-3 text-center font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
                      <span>加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : archives.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <FolderOpen className="w-12 h-12 text-neutral-300" />
                      <span>暂无卷宗数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                archives.map((archive) => (
                  <tr 
                    key={archive.id} 
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="table-cell font-mono text-primary-600">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary-400" />
                        {archive.archiveNo}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-neutral-700 max-w-xs truncate">
                        {archive.caseName}
                      </div>
                    </td>
                    <td className="table-cell">
                      {archive.caseType ? CASE_TYPE_MAP[archive.caseType] : '-'}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-neutral-400" />
                        <span>{archive.clientName || '-'}</span>
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <span className={cn(getBadgeClass(ARCHIVE_STATUS_MAP[archive.status].color))}>
                        {ARCHIVE_STATUS_MAP[archive.status].label}
                      </span>
                    </td>
                    <td className="table-cell">
                      {archive.archiveAt ? formatDate(archive.archiveAt) : '-'}
                    </td>
                    <td className="table-cell">
                      {archive.location ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-neutral-400" />
                          <span>{archive.location}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-400">未归档</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleView(archive.id)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBorrow(archive.id)}
                          disabled={archive.status !== 'archived'}
                          className={cn(
                            "p-1.5 rounded-md transition-colors",
                            archive.status === 'archived'
                              ? "text-neutral-500 hover:text-primary-600 hover:bg-primary-50"
                              : "text-neutral-300 cursor-not-allowed"
                          )}
                          title={archive.status === 'archived' ? '借阅申请' : '不可借阅'}
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(archive.id)}
                          disabled={archive.status === 'pending'}
                          className={cn(
                            "p-1.5 rounded-md transition-colors",
                            archive.status !== 'pending'
                              ? "text-neutral-500 hover:text-primary-600 hover:bg-primary-50"
                              : "text-neutral-300 cursor-not-allowed"
                          )}
                          title={archive.status !== 'pending' ? '下载电子卷' : '暂不可下载'}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
    </div>
  );
};

export default Archive;
