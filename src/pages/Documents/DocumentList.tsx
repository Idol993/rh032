import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle,
  Send,
  History,
  File
} from 'lucide-react';
import { Document, DocumentStatus } from '@/types';
import { documentService } from '@/services/documentService';
import { DOCUMENT_STATUS_MAP, DOCUMENT_TEMPLATE_LIST } from '@/constants';
import { formatDateTime, cn } from '@/utils';

const DocumentList: React.FC = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [statusFilter, setStatusFilter] = useState<DocumentStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [keyword, setKeyword] = useState('');

  const [statistics, setStatistics] = useState({
    total: 0,
    draft: 0,
    reviewing: 0,
    approved: 0,
  });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const result = await documentService.getDocuments({
        page,
        pageSize,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        keyword: keyword || undefined,
      });
      setDocuments(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('获取文书列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await documentService.getStatistics();
      setStatistics({
        total: stats.total,
        draft: stats.draft,
        reviewing: stats.reviewing,
        approved: stats.approved,
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchStatistics();
  }, [page, statusFilter, typeFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchDocuments();
  };

  const handleReset = () => {
    setStatusFilter('');
    setTypeFilter('');
    setKeyword('');
    setPage(1);
  };

  const handleView = (id: string) => {
    navigate(`/documents/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/documents/${id}`);
  };

  const handleNew = () => {
    navigate('/documents/new');
  };

  const handleSubmitReview = async (id: string) => {
    try {
      await documentService.submitForReview(id);
      fetchDocuments();
      fetchStatistics();
    } catch (error) {
      console.error('提交审批失败:', error);
    }
  };

  const handleViewHistory = (id: string) => {
    navigate(`/documents/${id}/history`);
  };

  const totalPages = Math.ceil(total / pageSize);

  const getDocumentTypeName = (type: string) => {
    const template = DOCUMENT_TEMPLATE_LIST.find(t => t.id === type);
    return template?.name || type;
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
      label: '文书总数',
      value: statistics.total,
      icon: FileText,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      label: '草稿',
      value: statistics.draft,
      icon: File,
      color: 'text-neutral-600',
      bgColor: 'bg-neutral-100',
    },
    {
      label: '审批中',
      value: statistics.reviewing,
      icon: Clock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      label: '已通过',
      value: statistics.approved,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">文书中心</h1>
          <p className="text-sm text-neutral-500 mt-1">管理所有法律文书，支持模板创建、版本管理和审批流程</p>
        </div>
        <button
          onClick={handleNew}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建文书
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
                <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                  <Icon className={cn('w-6 h-6', stat.color)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-neutral-700">筛选条件</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label-text">文书状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | '')}
              className="select-field"
            >
              <option value="">全部状态</option>
              {Object.entries(DOCUMENT_STATUS_MAP).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">文书类型</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="select-field"
            >
              <option value="">全部类型</option>
              {DOCUMENT_TEMPLATE_LIST.map((template) => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label-text">关键词搜索</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="输入文书标题或案件名称搜索"
                  className="input-field pl-10"
                />
              </div>
              <button onClick={handleSearch} className="btn-primary">
                搜索
              </button>
              <button onClick={handleReset} className="btn-secondary flex items-center gap-1">
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left font-medium">文书标题</th>
                <th className="px-4 py-3 text-left font-medium">所属案件</th>
                <th className="px-4 py-3 text-left font-medium">文书类型</th>
                <th className="px-4 py-3 text-center font-medium">当前版本</th>
                <th className="px-4 py-3 text-center font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">编辑人</th>
                <th className="px-4 py-3 text-left font-medium">最后编辑时间</th>
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
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 text-neutral-300" />
                      <span>暂无文书数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <span className="font-medium text-neutral-700 max-w-xs truncate">
                          {doc.title}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-neutral-600 max-w-xs truncate block">
                        {doc.caseName || <span className="text-neutral-400">未关联案件</span>}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-neutral-600">
                        {getDocumentTypeName(doc.type)}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 text-xs font-mono">
                        v{doc.currentVersion}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className={cn(
                        'badge',
                        DOCUMENT_STATUS_MAP[doc.status].color === 'badge-success' && 'badge-success',
                        DOCUMENT_STATUS_MAP[doc.status].color === 'badge-warning' && 'badge-warning',
                        DOCUMENT_STATUS_MAP[doc.status].color === 'badge-danger' && 'badge-danger',
                        DOCUMENT_STATUS_MAP[doc.status].color === 'badge-primary' && 'badge-primary',
                        DOCUMENT_STATUS_MAP[doc.status].color === 'badge-neutral' && 'badge-neutral',
                      )}>
                        {DOCUMENT_STATUS_MAP[doc.status].label}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-neutral-600 text-sm">
                        {doc.editorName || <span className="text-neutral-400">未知</span>}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-neutral-500 text-xs">
                        {formatDateTime(doc.updatedAt)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleView(doc.id)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="查看"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(doc.id)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {doc.status === 'draft' && (
                          <button
                            onClick={() => handleSubmitReview(doc.id)}
                            className="p-1.5 text-neutral-500 hover:text-warning-600 hover:bg-warning-50 rounded-md transition-colors"
                            title="提交审批"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleViewHistory(doc.id)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="版本历史"
                        >
                          <History className="w-4 h-4" />
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

export default DocumentList;
