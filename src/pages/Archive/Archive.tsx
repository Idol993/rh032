import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Archive as ArchiveType, Case, CaseType, Document, Payment } from '@/types';
import { archiveService } from '@/services/archiveService';
import { caseService } from '@/services/caseService';
import { documentService } from '@/services/documentService';
import { paymentService } from '@/services/paymentService';
import { ARCHIVE_STATUS_MAP, CASE_TYPE_MAP, PAYMENT_STATUS_MAP, PAYMENT_TYPE_MAP, PAYMENT_STAGE_MAP } from '@/constants';
import { formatDate, cn, formatCurrency, formatDateTime } from '@/utils';
import type { ArchiveStatus } from '@/constants';

const Archive: React.FC = () => {
  const navigate = useNavigate();
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
  const [detailCase, setDetailCase] = useState<Case | null>(null);
  const [detailDocuments, setDetailDocuments] = useState<Document[]>([]);
  const [detailPayments, setDetailPayments] = useState<Payment[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showBorrowConfirm, setShowBorrowConfirm] = useState(false);
  const [borrowId, setBorrowId] = useState('');
  const [borrowing, setBorrowing] = useState(false);

  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);

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

  const handleView = async (id: string) => {
    const archive = archives.find(a => a.id === id);
    if (archive) {
      setDetailArchive(archive);
      setShowDetailModal(true);
      setDetailLoading(true);
      setDetailCase(null);
      setDetailDocuments([]);
      setDetailPayments([]);

      try {
        const [caseResult, docsResult, paymentsResult] = await Promise.all([
          caseService.getById(archive.caseId),
          documentService.getDocuments({ caseId: archive.caseId, page: 1, pageSize: 100 }),
          paymentService.getPayments({ caseId: archive.caseId, page: 1, pageSize: 100 }),
        ]);
        setDetailCase(caseResult);
        setDetailDocuments(docsResult.list);
        setDetailPayments(paymentsResult.list);
      } catch (error) {
        console.error('获取卷宗关联数据失败:', error);
      } finally {
        setDetailLoading(false);
      }
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

  const handleViewPayment = (payment: Payment) => {
    setDetailPayment(payment);
    setShowPaymentDetailModal(true);
  };

  const handleViewDocument = (docId: string) => {
    navigate(`/documents/${docId}`);
  };

  const getArchiveChecklist = () => {
    const paymentExists = detailPayments.length > 0;
    const complaintDoc = detailDocuments.find(d => d.type.includes('complaint') || d.type.includes('defense'));
    const evidenceDoc = detailDocuments.find(d => d.type.includes('evidence'));
    const opinionDoc = detailDocuments.find(d => d.type.includes('opinion') || d.type.includes('agency'));
    const recordDoc = detailDocuments.find(d => d.type.includes('record'));
    const judgmentDoc = detailDocuments.find(d => d.type.includes('judgment'));

    return [
      {
        name: '委托合同',
        exists: true,
        isFixed: true,
        archiveTime: detailArchive?.archiveAt,
      },
      {
        name: '收费凭证',
        exists: paymentExists,
        payment: paymentExists ? detailPayments[0] : null,
        archiveTime: paymentExists ? detailPayments[0].payAt || detailPayments[0].createdAt : null,
      },
      {
        name: '起诉状/答辩状',
        exists: !!complaintDoc,
        document: complaintDoc,
        archiveTime: complaintDoc?.createdAt,
      },
      {
        name: '证据目录',
        exists: !!evidenceDoc,
        document: evidenceDoc,
        archiveTime: evidenceDoc?.createdAt,
      },
      {
        name: '代理词',
        exists: !!opinionDoc,
        document: opinionDoc,
        archiveTime: opinionDoc?.createdAt,
      },
      {
        name: '庭审笔录',
        exists: !!recordDoc,
        document: recordDoc,
        archiveTime: recordDoc?.createdAt,
      },
      {
        name: '判决书/裁定书',
        exists: !!judgmentDoc,
        document: judgmentDoc,
        archiveTime: judgmentDoc?.createdAt,
      },
    ];
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

  const getInvoiceStatusText = (status: string) => {
    const map: Record<string, string> = {
      'none': '未开票',
      'issued': '已开票',
      'void': '已作废',
    };
    return map[status] || status;
  };

  const getInvoiceStatusClass = (status: string) => {
    const map: Record<string, string> = {
      'none': 'badge badge-neutral',
      'issued': 'badge badge-success',
      'void': 'badge badge-danger',
    };
    return map[status] || 'badge badge-neutral';
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 animate-fade-in max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 flex-shrink-0">
              <h3 className="font-medium text-neutral-700">卷宗详情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-5 overflow-y-auto flex-1">
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
                  归档材料清单
                </h4>
                {detailLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
                  </div>
                ) : (
                  <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-neutral-50">
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500 w-12">序号</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">归档材料</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500 w-24">状态</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500 w-36">归档时间</th>
                          <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-500 w-24">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {getArchiveChecklist().map((item, index) => (
                          <tr key={index} className="hover:bg-neutral-50">
                            <td className="px-4 py-3 text-sm text-neutral-500">{index + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <FileText className={cn("w-4 h-4", item.exists ? "text-primary-400" : "text-neutral-300")} />
                                <span className={cn("text-sm", item.exists ? "text-neutral-700" : "text-neutral-400")}>
                                  {item.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {item.exists ? (
                                <span className="badge badge-success">已归档</span>
                              ) : (
                                <span className="badge badge-neutral">待补齐</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-neutral-500">
                              {item.exists && item.archiveTime ? formatDate(item.archiveTime) : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center">
                                {item.exists ? (
                                  item.payment ? (
                                    <button
                                      onClick={() => handleViewPayment(item.payment!)}
                                      className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                                      title="查看费用详情"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                  ) : item.document ? (
                                    <button
                                      onClick={() => handleViewDocument(item.document!.id)}
                                      className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                                      title="查看文书"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <span className="text-xs text-success-600">-</span>
                                  )
                                ) : (
                                  <span className="text-xs text-neutral-400">待补充</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end p-4 border-t border-neutral-200 flex-shrink-0">
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

      {showPaymentDetailModal && detailPayment && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowPaymentDetailModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-primary-50">
              <h2 className="text-lg font-semibold text-primary-600">收费详情</h2>
              <button
                onClick={() => setShowPaymentDetailModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-500">案件名称</label>
                  <p className="text-sm text-neutral-700 font-medium mt-1">{detailPayment.caseName}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-500">客户名称</label>
                  <p className="text-sm text-neutral-700 font-medium mt-1">{detailPayment.clientName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-500">收费类型</label>
                  <p className="text-sm text-neutral-700 mt-1">{PAYMENT_TYPE_MAP[detailPayment.type]}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-500">收费阶段</label>
                  <p className="text-sm text-neutral-700 mt-1">{PAYMENT_STAGE_MAP[detailPayment.stage]}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-500">应收金额</label>
                  <p className="text-sm text-neutral-700 font-mono font-medium mt-1">{formatCurrency(detailPayment.amount)}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-500">已收金额</label>
                  <p className="text-sm text-primary-600 font-mono font-medium mt-1">{formatCurrency(detailPayment.paidAmount)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-500">收费状态</label>
                  <div className="mt-1">
                    <span className={cn(getBadgeClass(PAYMENT_STATUS_MAP[detailPayment.status].color))}>
                      {PAYMENT_STATUS_MAP[detailPayment.status].label}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-neutral-500">开票状态</label>
                  <div className="mt-1">
                    <span className={cn(getInvoiceStatusClass(detailPayment.invoiceStatus))}>
                      {getInvoiceStatusText(detailPayment.invoiceStatus)}
                    </span>
                    {detailPayment.invoiceNo && (
                      <span className="text-xs text-neutral-400 ml-2">{detailPayment.invoiceNo}</span>
                    )}
                  </div>
                </div>
              </div>
              {detailPayment.payAt && (
                <div>
                  <label className="text-sm text-neutral-500">缴费时间</label>
                  <p className="text-sm text-neutral-700 mt-1">{formatDateTime(detailPayment.payAt)}</p>
                </div>
              )}
              {detailPayment.remark && (
                <div>
                  <label className="text-sm text-neutral-500">备注</label>
                  <div className="mt-1 p-3 bg-neutral-50 rounded-lg text-sm text-neutral-700">
                    {detailPayment.remark}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex justify-end">
              <button
                onClick={() => setShowPaymentDetailModal(false)}
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
