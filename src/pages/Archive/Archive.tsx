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
  BookOpen,
  X,
  CheckCircle,
  ListChecks,
  AlertCircle,
} from 'lucide-react';
import { Archive as ArchiveType, Case, CaseType } from '@/types';
import { archiveService } from '@/services/archiveService';
import { caseService } from '@/services/caseService';
import { ARCHIVE_STATUS_MAP, CASE_TYPE_MAP } from '@/constants';
import { formatDate, cn } from '@/utils';
import type { ArchiveStatus } from '@/constants';

const ARCHIVE_CHECKLIST = [
  { name: '委托合同', type: '合同文件' },
  { name: '收费凭证', type: '财务文件' },
  { name: '起诉状/答辩状', type: '诉讼文书' },
  { name: '证据目录', type: '证据材料' },
  { name: '庭审笔录', type: '庭审记录' },
  { name: '判决书/裁定书', type: '裁判文书' },
  { name: '送达回证', type: '程序文件' },
];

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

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [closedCases, setClosedCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [archiveLocation, setArchiveLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [closedCasesLoading, setClosedCasesLoading] = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailArchive, setDetailArchive] = useState<ArchiveType | null>(null);

  const [showBorrowConfirm, setShowBorrowConfirm] = useState(false);
  const [borrowId, setBorrowId] = useState('');
  const [borrowing, setBorrowing] = useState(false);

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
    const archive = archives.find(a => a.id === id);
    if (archive) {
      setDetailArchive(archive);
      setShowDetailModal(true);
    }
  };

  const handleBorrow = (id: string) => {
    setBorrowId(id);
    setShowBorrowConfirm(true);
  };

  const confirmBorrow = async () => {
    setBorrowing(true);
    try {
      await archiveService.update(borrowId, { status: 'borrowed' });
      setShowBorrowConfirm(false);
      fetchArchives();
      fetchStatistics();
    } catch (error) {
      console.error('借阅申请失败:', error);
    } finally {
      setBorrowing(false);
    }
  };

  const handleDownload = () => {
    alert('电子卷宗下载已开始');
  };

  const handleNewArchive = async () => {
    setShowArchiveModal(true);
    setClosedCasesLoading(true);
    setSelectedCaseId('');
    setArchiveLocation('');
    try {
      const result = await caseService.getCases({ status: 'closed', pageSize: 100, page: 1 });
      const archivedCaseIds = (await archiveService.getArchives({ pageSize: 1000, page: 1 })).list.map(a => a.caseId);
      const unarchivedCases = result.list.filter(c => !archivedCaseIds.includes(c.id));
      setClosedCases(unarchivedCases);
    } catch (error) {
      console.error('获取已结案案件失败:', error);
    } finally {
      setClosedCasesLoading(false);
    }
  };

  const generateArchiveNo = () => {
    const year = new Date().getFullYear();
    const count = archives.length + 1;
    return `JD-${year}-${String(count).padStart(3, '0')}`;
  };

  const submitArchive = async () => {
    if (!selectedCaseId) {
      alert('请选择要归档的案件');
      return;
    }
    if (!archiveLocation.trim()) {
      alert('请填写存放位置');
      return;
    }
    setSubmitting(true);
    try {
      const selectedCase = closedCases.find(c => c.id === selectedCaseId);
      if (!selectedCase) return;
      await archiveService.create({
        caseId: selectedCase.id,
        caseName: selectedCase.name,
        caseType: selectedCase.type,
        clientName: selectedCase.clientName,
        archiveNo: generateArchiveNo(),
        status: 'pending',
        location: archiveLocation.trim(),
      });
      setShowArchiveModal(false);
      fetchArchives();
      fetchStatistics();
    } catch (error) {
      console.error('归档申请失败:', error);
    } finally {
      setSubmitting(false);
    }
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
                      {archive.caseType ? CASE_TYPE_MAP[archive.caseType as CaseType] : '-'}
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
                          onClick={handleDownload}
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

      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="font-medium text-neutral-700">归档申请</h3>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="label-text">选择已结案案件</label>
                {closedCasesLoading ? (
                  <div className="flex items-center gap-2 text-sm text-neutral-500 py-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    加载中...
                  </div>
                ) : closedCases.length === 0 ? (
                  <p className="text-sm text-neutral-500 py-2">暂无可归档的已结案案件</p>
                ) : (
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    className="select-field"
                  >
                    <option value="">请选择案件</option>
                    {closedCases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}（{c.clientName}）
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {selectedCaseId && (
                <div className="bg-neutral-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-neutral-700">档案编号</span>
                  </div>
                  <span className="text-sm font-mono text-primary-600">{generateArchiveNo()}</span>
                </div>
              )}
              <div>
                <label className="label-text">存放位置</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={archiveLocation}
                    onChange={(e) => setArchiveLocation(e.target.value)}
                    placeholder="如：档案室A区-第3排"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-200">
              <button
                onClick={() => setShowArchiveModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={submitArchive}
                disabled={submitting || !selectedCaseId || !archiveLocation.trim() || closedCases.length === 0}
                className={cn(
                  "btn-primary flex items-center gap-2",
                  (submitting || !selectedCaseId || !archiveLocation.trim() || closedCases.length === 0) && "opacity-50 cursor-not-allowed"
                )}
              >
                <CheckCircle className="w-4 h-4" />
                {submitting ? '提交中...' : '确认归档'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && detailArchive && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="font-medium text-neutral-700">卷宗详情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-5">
              <div>
                <h4 className="text-sm font-medium text-neutral-500 mb-3">基本信息</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-400 mb-1">档案编号</p>
                    <p className="text-sm font-mono font-medium text-primary-600">{detailArchive.archiveNo}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-400 mb-1">案件名称</p>
                    <p className="text-sm font-medium text-neutral-700">{detailArchive.caseName || '-'}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-400 mb-1">归档状态</p>
                    <span className={cn(getBadgeClass(ARCHIVE_STATUS_MAP[detailArchive.status].color))}>
                      {ARCHIVE_STATUS_MAP[detailArchive.status].label}
                    </span>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-400 mb-1">归档日期</p>
                    <p className="text-sm text-neutral-700">{detailArchive.archiveAt ? formatDate(detailArchive.archiveAt) : '-'}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-neutral-400 mb-1">存放位置</p>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                      <p className="text-sm text-neutral-700">{detailArchive.location || '未指定'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-500 mb-3 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4" />
                  归档清单
                </h4>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">文件名称</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">文件类型</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">归档时间</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {ARCHIVE_CHECKLIST.map((item, index) => (
                        <tr key={index} className="hover:bg-neutral-50">
                          <td className="px-3 py-2 text-sm text-neutral-700">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-neutral-400" />
                              {item.name}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-neutral-500">{item.type}</td>
                          <td className="px-3 py-2 text-sm text-neutral-500">
                            {detailArchive.archiveAt ? formatDate(detailArchive.archiveAt) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end p-4 border-t border-neutral-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="btn-secondary"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showBorrowConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="font-medium text-neutral-700">借阅申请</h3>
              <button
                onClick={() => setShowBorrowConfirm(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-600">确认申请借阅该卷宗？借阅后卷宗状态将变为"借阅中"。</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-200">
              <button
                onClick={() => setShowBorrowConfirm(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={confirmBorrow}
                disabled={borrowing}
                className={cn(
                  "btn-primary flex items-center gap-2",
                  borrowing && "opacity-50 cursor-not-allowed"
                )}
              >
                <BookOpen className="w-4 h-4" />
                {borrowing ? '处理中...' : '确认借阅'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Archive;
