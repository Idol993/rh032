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
  RefreshCw
} from 'lucide-react';
import { Case, CaseStatus, CaseType } from '@/types';
import { caseService } from '@/services/caseService';
import { CASE_STATUS_MAP, CASE_TYPE_MAP } from '@/constants';
import { formatCurrency, cn } from '@/utils';

const CaseList: React.FC = () => {
  const navigate = useNavigate();

  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<CaseType | ''>('');
  const [keyword, setKeyword] = useState('');

  const fetchCases = async () => {
    setLoading(true);
    try {
      const result = await caseService.getCases({
        page,
        pageSize,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        keyword: keyword || undefined,
      });
      setCases(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('获取案件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [page, statusFilter, typeFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchCases();
  };

  const handleReset = () => {
    setStatusFilter('');
    setTypeFilter('');
    setKeyword('');
    setPage(1);
  };

  const handleView = (id: string) => {
    navigate(`/cases/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/cases/${id}/edit`);
  };

  const handleNew = () => {
    navigate('/cases/new');
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">案件管理</h1>
          <p className="text-sm text-neutral-500 mt-1">管理所有案件信息，支持筛选、搜索和分页查看</p>
        </div>
        <button
          onClick={handleNew}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建收案
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-neutral-700">筛选条件</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label-text">案件状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CaseStatus | '')}
              className="select-field"
            >
              <option value="">全部状态</option>
              {Object.entries(CASE_STATUS_MAP).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">案件类型</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as CaseType | '')}
              className="select-field"
            >
              <option value="">全部类型</option>
              {Object.entries(CASE_TYPE_MAP).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
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
                  placeholder="输入案号、案件名称或客户名称搜索"
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
                <th className="px-4 py-3 text-left font-medium">案号</th>
                <th className="px-4 py-3 text-left font-medium">案件名称</th>
                <th className="px-4 py-3 text-left font-medium">案件类型</th>
                <th className="px-4 py-3 text-left font-medium">客户名称</th>
                <th className="px-4 py-3 text-left font-medium">承办律师</th>
                <th className="px-4 py-3 text-right font-medium">涉案金额</th>
                <th className="px-4 py-3 text-center font-medium">案件状态</th>
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
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-12 h-12 text-neutral-300" />
                      <span>暂无案件数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                cases.map((caseItem) => (
                  <tr 
                    key={caseItem.id} 
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="table-cell font-mono text-primary-600">
                      {caseItem.caseNo}
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-neutral-700 max-w-xs truncate">
                        {caseItem.name}
                      </div>
                    </td>
                    <td className="table-cell">
                      {CASE_TYPE_MAP[caseItem.type]}
                    </td>
                    <td className="table-cell">
                      {caseItem.clientName}
                    </td>
                    <td className="table-cell">
                      {caseItem.lawyerName || <span className="text-neutral-400">未分配</span>}
                    </td>
                    <td className="table-cell text-right font-mono">
                      ¥{formatCurrency(caseItem.amount)}
                    </td>
                    <td className="table-cell text-center">
                      <span className={cn(getBadgeClass(CASE_STATUS_MAP[caseItem.status].color))}>
                        {CASE_STATUS_MAP[caseItem.status].label}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleView(caseItem.id)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="查看"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(caseItem.id)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4" />
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

export default CaseList;
