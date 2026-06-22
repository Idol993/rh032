import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  RefreshCw,
  ShieldCheck,
  Clock,
  User,
  Layers,
  MousePointerClick,
  Target,
  FileText,
  Globe,
  CalendarDays
} from 'lucide-react';
import { OperationLog } from '@/types';
import { operationLogService } from '@/services/operationLogService';
import { formatDateTime, cn } from '@/utils';

const MODULE_LIST = [
  { value: '案件管理', label: '案件管理' },
  { value: '客户管理', label: '客户管理' },
  { value: '文书中心', label: '文书中心' },
  { value: '费用中心', label: '费用中心' },
  { value: '风控中心', label: '风控中心' },
  { value: '系统管理', label: '系统管理' },
  { value: '卷宗管理', label: '卷宗管理' },
];

const ACTION_LIST = [
  { value: '创建', label: '创建' },
  { value: '编辑', label: '编辑' },
  { value: '删除', label: '删除' },
  { value: '查看', label: '查看' },
  { value: '审批', label: '审批' },
  { value: '导出', label: '导出' },
  { value: '登录', label: '登录' },
  { value: '登出', label: '登出' },
];

const OperationLogs: React.FC = () => {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const result = await operationLogService.getLogs({
        page,
        pageSize,
        module: moduleFilter || undefined,
        action: actionFilter || undefined,
        keyword: keyword || undefined,
      });
      
      let filteredList = result.list;
      
      if (startDate) {
        filteredList = filteredList.filter(log => 
          new Date(log.createdAt) >= new Date(startDate)
        );
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filteredList = filteredList.filter(log => 
          new Date(log.createdAt) <= end
        );
      }
      
      if (userFilter) {
        filteredList = filteredList.filter(log => 
          log.userName.includes(userFilter)
        );
      }
      
      setLogs(filteredList);
      setTotal(filteredList.length);
    } catch (error) {
      console.error('获取操作日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, moduleFilter, actionFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const handleReset = () => {
    setModuleFilter('');
    setActionFilter('');
    setUserFilter('');
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setPage(1);
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

  const getActionBadgeColor = (action: string) => {
    const colorMap: Record<string, string> = {
      '创建': 'badge-success',
      '编辑': 'badge-primary',
      '删除': 'badge-danger',
      '查看': 'badge-neutral',
      '审批': 'badge-warning',
      '导出': 'badge-primary',
      '登录': 'badge-success',
      '登出': 'badge-neutral',
    };
    return colorMap[action] || 'badge-neutral';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h1 className="page-title">操作日志</h1>
            <p className="text-sm text-neutral-500 mt-1">记录所有系统操作行为，确保审计合规与安全追溯</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
          <span>审计监控已启用</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <div className="stat-value text-lg">{total}</div>
              <div className="stat-label">总日志数</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
              <MousePointerClick className="w-5 h-5 text-success-500" />
            </div>
            <div>
              <div className="stat-value text-lg">今日</div>
              <div className="stat-label">操作记录</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
              <Layers className="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <div className="stat-value text-lg">{MODULE_LIST.length}</div>
              <div className="stat-label">覆盖模块</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-accent-500" />
            </div>
            <div>
              <div className="stat-value text-lg">100%</div>
              <div className="stat-label">操作可追溯</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-6 border-l-4 border-l-primary-500">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-neutral-700">筛选条件</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="label-text">功能模块</label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="select-field"
            >
              <option value="">全部模块</option>
              {MODULE_LIST.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">操作类型</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="select-field"
            >
              <option value="">全部操作</option>
              {ACTION_LIST.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">操作人</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="输入操作人"
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label-text">开始日期</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
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
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label-text">关键词搜索</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="搜索"
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-neutral-100">
          <button onClick={handleSearch} className="btn-primary">
            搜索
          </button>
          <button onClick={handleReset} className="btn-secondary flex items-center gap-1">
            <RefreshCw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-neutral-500">
            共 <span className="font-medium text-primary-600">{total}</span> 条日志记录
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4" />
            <span>所有操作均已记录，用于审计追溯</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left font-medium">操作时间</th>
                <th className="px-4 py-3 text-left font-medium">操作人</th>
                <th className="px-4 py-3 text-left font-medium">模块</th>
                <th className="px-4 py-3 text-center font-medium">操作</th>
                <th className="px-4 py-3 text-left font-medium">目标对象</th>
                <th className="px-4 py-3 text-left font-medium">详情</th>
                <th className="px-4 py-3 text-left font-medium">IP地址</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
                      <span>加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-12 h-12 text-neutral-300" />
                      <span>暂无日志记录</span>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-neutral-400" />
                        <span className="font-mono text-xs">{formatDateTime(log.createdAt)}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-xs">
                          {log.userName.charAt(0)}
                        </div>
                        <span className="font-medium text-neutral-700">{log.userName}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-neutral-400" />
                        <span>{log.module}</span>
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <span className={cn('badge', getActionBadgeColor(log.action))}>
                        {log.action}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-neutral-400" />
                        <span className="max-w-32 truncate" title={log.targetName}>
                          {log.targetName}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="max-w-48 truncate text-neutral-500" title={log.detail}>
                        {log.detail}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-neutral-400" />
                        <span className="font-mono text-xs text-neutral-500">{log.ip}</span>
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

      <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-primary-700 mb-1">审计合规说明</h3>
            <p className="text-xs text-primary-600 leading-relaxed">
              本系统所有用户操作均被完整记录，包括操作人、操作时间、操作内容、IP地址等信息。
              日志记录不可篡改、不可删除，保留期限符合相关法律法规要求，
              用于安全审计、问题追溯和合规检查。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationLogs;
